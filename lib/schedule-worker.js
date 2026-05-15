import {generationLimit} from '../config/algorithm.js';
import {generateSchedule, totalInitialIndividuals} from './scheduler.js';

process.on('message', async (message) => {
    if (message?.type !== 'start') return;

    try {
        let evolveProgress = null;

        const result = await generateSchedule({
            monthTimestamp: message.monthTimestamp,
            onInitProgress: ({current}) => {
                process.send?.({
                    type: 'progress',
                    progress: {
                        phase: 'initializing',
                        current,
                        total: totalInitialIndividuals(),
                        percent: Math.round(Math.min(current / totalInitialIndividuals(), 1) * 25)
                    }
                });
            },
            onStats: stats => {
                evolveProgress = {
                    phase: 'evolving',
                    current: stats.generation,
                    total: generationLimit,
                    percent: Math.round(25 + Math.min(stats.generation / generationLimit, 1) * 75),
                    bestScore: stats.bestScore,
                    mean: stats.mean,
                    evalCurrent: null,
                    evalTotal: null
                };
                process.send?.({
                    type: 'progress',
                    progress: evolveProgress,
                    best: {
                        schedule: stats.bestCandidate.schedule,
                        score: stats.bestScore,
                        mean: stats.mean,
                        generation: stats.generation
                    }
                });
            },
            onEvalProgress: ({current, total}) => {
                if (!evolveProgress) return;
                process.send?.({
                    type: 'progress',
                    progress: {...evolveProgress, evalCurrent: current, evalTotal: total}
                });
            }
        });

        process.send?.({type: 'completed', result});
    } catch (err) {
        process.send?.({type: 'failed', error: err.message});
    }
});

