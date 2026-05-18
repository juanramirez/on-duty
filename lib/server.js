import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {fork} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {fileURLToPath, URL} from 'node:url';
import {getConfig, getConfigErrorsFor, saveConfig} from './config-store.js';
import {generateSchedule, serializeSchedule, totalInitialIndividuals} from './scheduler.js';
import {parseMonth} from './utils/month.js';
import {scheduleReport} from './utils/schedule.js';

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = '127.0.0.1';
const MAX_BODY_BYTES = 1024 * 1024;
const WEB_INDEX = new URL('../web/index.html', import.meta.url);
const WORKER_FILE = fileURLToPath(new URL('./schedule-worker.js', import.meta.url));
const JOB_TTL_MS = 30 * 60 * 1000;
const jobs = new Map();

const sendJson = ({res, status = 200, body}) => {
    const payload = JSON.stringify(body, null, 2);

    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
        'access-control-allow-headers': 'content-type'
    });
    res.end(payload);
};

const sendHtml = ({res, body}) => {
    res.writeHead(200, {
        'content-type': 'text/html; charset=utf-8'
    });
    res.end(body);
};

const readJsonBody = (req) =>
    new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
            if (body.length > MAX_BODY_BYTES) {
                reject(new Error('Request body is too large'));
                req.destroy();
            }
        });

        req.on('end', () => {
            if (!body) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(new Error('Request body must be valid JSON'));
            }
        });

        req.on('error', reject);
    });

const scheduleResponse = ({month, result}) => ({
    month,
    score: result.score,
    mean: result.mean,
    generation: result.generation,
    schedule: serializeSchedule({schedule: result.schedule}),
    report: scheduleReport({schedule: result.schedule})
});

const handleScheduleRequest = async ({req, url}) => {
    const body = req.method === 'POST' ? await readJsonBody(req) : {};
    const month = body.month || url.searchParams.get('month');
    const monthTimestamp = parseMonth({month});
    const configErrors = getConfigErrorsFor(await getConfig());

    if (configErrors.length > 0) {
        return {
            status: 400,
            body: {
                error: 'Invalid configuration for requested month',
                details: configErrors
            }
        };
    }

    const result = await generateSchedule({monthTimestamp});

    return {
        status: 200,
        body: scheduleResponse({month, result})
    };
};

const jobPayload = (job) => ({
    id: job.id,
    month: job.month,
    status: job.status,
    progress: job.progress,
    result: job.result,
    latestResult: job.latestResult ?? null,
    error: job.error
});

const cleanupJobs = () => {
    const now = Date.now();

    for (const [id, job] of jobs.entries()) {
        if (job.status !== 'running' && now - job.updatedAt > JOB_TTL_MS) {
            jobs.delete(id);
        }
    }
};

const startScheduleJob = ({month, monthTimestamp}) => {
    cleanupJobs();

    const job = {
        id: randomUUID(),
        month,
        status: 'running',
        cancelRequested: false,
        progress: {
            phase: 'initializing',
            current: 0,
            total: totalInitialIndividuals(),
            percent: 0,
            message: 'Creating initial population'
        },
        result: null,
        error: null,
        latestResult: null,
        worker: null,
        updatedAt: Date.now()
    };

    jobs.set(job.id, job);

    const worker = fork(WORKER_FILE, [], {stdio: ['ignore', 'ignore', 'ignore', 'ipc']});
    job.worker = worker;

    worker.on('message', message => {
        if (message.type === 'progress') {
            job.progress = message.progress;
            if (message.best) {
                job.latestResult = scheduleResponse({month: job.month, result: message.best});
            }
            job.updatedAt = Date.now();
            return;
        }

        if (message.type === 'completed') {
            job.status = 'completed';
            job.progress = {
                ...job.progress,
                phase: 'completed',
                percent: 100,
                message: 'Completed'
            };
            job.result = scheduleResponse({month, result: message.result});
            job.updatedAt = Date.now();
            return;
        }

        if (message.type === 'failed') {
            job.status = 'failed';
            job.error = message.error;
            job.progress = {
                ...job.progress,
                phase: 'failed',
                message: message.error
            };
            job.updatedAt = Date.now();
        }
    });

    worker.on('exit', () => {
        job.worker = null;

        if (job.status === 'running' && job.cancelRequested) {
            job.status = 'cancelled';
            job.progress = {
                ...job.progress,
                phase: 'cancelled',
                percent: job.latestResult ? 100 : job.progress.percent,
                message: job.latestResult
                    ? 'Stopped with best schedule found so far'
                    : 'Stopped before a schedule was evaluated'
            };
            if (job.latestResult) {
                job.result = scheduleResponse({month, result: job.latestResult});
            }
            job.updatedAt = Date.now();
        } else if (job.status === 'running') {
            job.status = 'failed';
            job.error = 'Schedule worker stopped unexpectedly';
            job.progress = {
                ...job.progress,
                phase: 'failed',
                message: job.error
            };
            job.updatedAt = Date.now();
        }
    });

    worker.send({type: 'start', monthTimestamp});

    return job;
};

const handleStartScheduleJob = async ({req}) => {
    const body = await readJsonBody(req);
    const month = body.month;
    const monthTimestamp = parseMonth({month});
    const configErrors = getConfigErrorsFor(await getConfig());

    if (configErrors.length > 0) {
        return {
            status: 400,
            body: {
                error: 'Invalid configuration for requested month',
                details: configErrors
            }
        };
    }

    return {
        status: 202,
        body: jobPayload(startScheduleJob({month, monthTimestamp}))
    };
};

export const createServer = () =>
    http.createServer(async (req, res) => {
        res.setHeader('access-control-allow-origin', '*');
        res.setHeader('access-control-allow-methods', 'GET,POST,PUT,OPTIONS');
        res.setHeader('access-control-allow-headers', 'content-type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        try {
            if (req.method === 'GET' && url.pathname === '/health') {
                sendJson({res, body: {status: 'ok'}});
                return;
            }

            if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/web')) {
                sendHtml({res, body: await readFile(WEB_INDEX, 'utf8')});
                return;
            }

            if (req.method === 'GET' && url.pathname === '/api/doctors') {
                const config = await getConfig();
                sendJson({res, body: {doctors: config.doctors}});
                return;
            }

            if (req.method === 'GET' && url.pathname === '/api/config') {
                sendJson({res, body: await getConfig()});
                return;
            }

            if (req.method === 'PUT' && url.pathname === '/api/config') {
                const config = await readJsonBody(req);
                sendJson({res, body: await saveConfig(config)});
                return;
            }

            if ((req.method === 'GET' || req.method === 'POST') && url.pathname === '/api/schedules') {
                const response = await handleScheduleRequest({req, url});
                sendJson({res, ...response});
                return;
            }

            if (req.method === 'POST' && url.pathname === '/api/schedule-jobs') {
                const response = await handleStartScheduleJob({req});
                sendJson({res, ...response});
                return;
            }

            const cancelJobMatch = url.pathname.match(/^\/api\/schedule-jobs\/([^/]+)\/cancel$/);
            if (req.method === 'POST' && cancelJobMatch) {
                const job = jobs.get(cancelJobMatch[1]);
                if (!job) {
                    sendJson({res, status: 404, body: {error: 'Job not found'}});
                    return;
                }

                if (job.status === 'running') {
                    job.cancelRequested = true;
                    job.progress = {
                        ...job.progress,
                        message: 'Stopping now'
                    };
                    job.worker?.kill();
                    job.updatedAt = Date.now();
                }

                sendJson({res, body: jobPayload(job)});
                return;
            }

            const jobMatch = url.pathname.match(/^\/api\/schedule-jobs\/([^/]+)$/);
            if (req.method === 'GET' && jobMatch) {
                cleanupJobs();
                const job = jobs.get(jobMatch[1]);
                if (!job) {
                    sendJson({res, status: 404, body: {error: 'Job not found'}});
                    return;
                }

                sendJson({res, body: jobPayload(job)});
                return;
            }

            sendJson({res, status: 404, body: {error: 'Not found'}});
        } catch (err) {
            const isClientError = [
                'Month must use YYYY-MM format',
                'Request body is too large',
                'Request body must be valid JSON',
                'Invalid configuration'
            ].includes(err.message);

            sendJson({
                res,
                status: isClientError ? 400 : 500,
                body: {
                    error: err.message,
                    details: err.details
                }
            });
        }
    });

const isMain = process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href;

if (isMain) {
    const port = Number(process.env.PORT || DEFAULT_PORT);
    const host = process.env.HOST || DEFAULT_HOST;
    const server = createServer();

    server.listen(port, host, () => {
        console.log(`On-duty API listening on http://${host}:${port}`);
    });
}
