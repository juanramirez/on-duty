import {writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';

const DOCTORS_FILE = new URL('../config/doctors.js', import.meta.url);
const DATES_FILE = new URL('../config/dates.js', import.meta.url);
const OFFSETS_FILE = new URL('../config/offsets.js', import.meta.url);
const ALGORITHM_FILE = new URL('../config/algorithm.js', import.meta.url);
const PRICING_FILE = new URL('../config/pricing.js', import.meta.url);

const require = createRequire(import.meta.url);
const APP_VERSION = require('../package.json').version ?? '';

const PRICING_TIERS = ['free', 'low', 'medium', 'high'];

const importFresh = async (url) =>
    import(`${url.href}?updated=${Date.now()}-${Math.random()}`);

const sortObject = (value) =>
    Object.fromEntries(Object.entries(value || {}).sort(([a], [b]) => a.localeCompare(b)));

const serialize = (value) =>
    JSON.stringify(value, null, 4).replace(/"([A-Za-z_$][\w$]*)":/g, '$1:');

const asNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeDatesByDoctor = (value) =>
    sortObject(Object.fromEntries(
        Object.entries(value || {})
            .map(([doctorId, dates]) => [
                doctorId,
                Array.isArray(dates) ? dates.filter(Boolean).map(String) : []
            ])
            .filter(([doctorId, dates]) => doctorId && dates.length > 0)
    ));

const parseDDMMYYYY = (s) => {
    const match = typeof s === 'string' && s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCDate() === day && date.getUTCMonth() === month - 1 ? date : null;
};

export const getConfigErrorsFor = (config) => {
    const errors = [];
    const doctorIds = new Set();

    if (!Array.isArray(config.doctors) || config.doctors.length === 0) {
        errors.push('doctors: must contain at least one doctor');
    } else {
        config.doctors.forEach((doctor, index) => {
            if (!doctor.id) errors.push(`doctors[${index}]: missing id`);
            if (!doctor.name) errors.push(`doctors[${index}]: missing name`);
            if (doctor.id && doctorIds.has(doctor.id)) errors.push(`doctors[${index}]: duplicate id "${doctor.id}"`);
            if (doctor.id) doctorIds.add(doctor.id);
            if (doctor.backToBackTolerance !== undefined && typeof doctor.backToBackTolerance !== 'number') {
                errors.push(`doctors[${index}]: backToBackTolerance must be a number`);
            }
        });
    }

    ['notAvailableDates', 'desiredDutyDates', 'desiredFreeDates'].forEach(section => {
        Object.entries(config.dates?.[section] || {}).forEach(([doctorId, dates]) => {
            if (!doctorIds.has(doctorId)) errors.push(`dates.${section}: unknown doctor id "${doctorId}"`);
            dates.forEach(date => {
                if (!parseDDMMYYYY(date)) {
                    errors.push(`dates.${section}.${doctorId}: invalid date "${date}" (expected DD/MM/YYYY)`);
                }
            });
        });
    });

    Object.entries(config.offsets || {}).forEach(([doctorId, offset]) => {
        if (!doctorIds.has(doctorId)) errors.push(`offsets: unknown doctor id "${doctorId}"`);
        if (typeof offset !== 'number') errors.push(`offsets.${doctorId}: must be a number`);
    });

    return errors;
};

export const getConfig = async () => {
    const [doctorsConfig, datesConfig, offsetsConfig, algorithmConfig, pricingConfig] = await Promise.all([
        importFresh(DOCTORS_FILE),
        importFresh(DATES_FILE),
        importFresh(OFFSETS_FILE),
        importFresh(ALGORITHM_FILE),
        importFresh(PRICING_FILE)
    ]);

    return {
        pricingTier: pricingConfig.pricingTier,
        version: APP_VERSION,
        doctors: doctorsConfig.doctors,
        dates: {
            notAvailableDates: datesConfig.notAvailableDates,
            desiredDutyDates: datesConfig.desiredDutyDates,
            desiredFreeDates: datesConfig.desiredFreeDates
        },
        offsets: offsetsConfig.dutyDaysOffset,
        algorithm: {
            elitism: algorithmConfig.elitism,
            generationLimit: algorithmConfig.generationLimit,
            mutationProbability: algorithmConfig.mutationProbability,
            mutationAggresivity: algorithmConfig.mutationAggresivity,
            populationSize: algorithmConfig.populationSize,
            stopScore: algorithmConfig.stopScore,
            tournamentSelectionRatio: algorithmConfig.tournamentSelectionRatio,
            islandOptions: algorithmConfig.islandOptions,
            offsetRatio: algorithmConfig.offsetRatio,
            evaluatorWeights: algorithmConfig.evaluatorWeights
        }
    };
};

const normalizeConfig = (config) => ({
    doctors: (config.doctors || []).map(doctor => ({
        id: String(doctor.id || '').trim(),
        name: String(doctor.name || '').trim(),
        notAvailableWeekdays: Array.isArray(doctor.notAvailableWeekdays)
            ? doctor.notAvailableWeekdays.filter(Boolean)
            : [],
        backToBackTolerance: doctor.backToBackTolerance === '' || doctor.backToBackTolerance === undefined
            ? undefined
            : asNumber(doctor.backToBackTolerance, 0.5)
    })).filter(doctor => doctor.id && doctor.name),
    dates: {
        notAvailableDates: normalizeDatesByDoctor(config.dates?.notAvailableDates),
        desiredDutyDates: normalizeDatesByDoctor(config.dates?.desiredDutyDates),
        desiredFreeDates: normalizeDatesByDoctor(config.dates?.desiredFreeDates)
    },
    offsets: sortObject(Object.fromEntries(
        Object.entries(config.offsets || {})
            .filter(([doctorId, value]) => doctorId && value !== '')
            .map(([doctorId, value]) => [doctorId, asNumber(value, 0)])
    )),
    algorithm: {
        elitism: asNumber(config.algorithm?.elitism, 0.01),
        generationLimit: asNumber(config.algorithm?.generationLimit, 1000),
        mutationProbability: asNumber(config.algorithm?.mutationProbability, 0.5),
        mutationAggresivity: asNumber(config.algorithm?.mutationAggresivity, 0.5),
        populationSize: asNumber(config.algorithm?.populationSize, 1000),
        stopScore: asNumber(config.algorithm?.stopScore, 100),
        tournamentSelectionRatio: asNumber(config.algorithm?.tournamentSelectionRatio, 0.65),
        islandOptions: {
            islands: asNumber(config.algorithm?.islandOptions?.islands, 3),
            migration: asNumber(config.algorithm?.islandOptions?.migration, 0.1),
            epoch: asNumber(config.algorithm?.islandOptions?.epoch, 20)
        },
        offsetRatio: asNumber(config.algorithm?.offsetRatio, 0.75),
        evaluatorWeights: sortObject(Object.fromEntries(
            Object.entries(config.algorithm?.evaluatorWeights || {})
                .map(([key, value]) => [key, asNumber(value, 0)])
        ))
    }
});

const doctorsFile = ({doctors}) =>
    `const doctors = ${serialize(doctors)};\n\nexport { doctors };\n`;

const datesFile = ({dates}) =>
    `// All dates use DD/MM/YYYY format\n\n` +
    `const notAvailableDates = ${serialize(dates.notAvailableDates)};\n\n` +
    `const desiredDutyDates = ${serialize(dates.desiredDutyDates)};\n\n` +
    `const desiredFreeDates = ${serialize(dates.desiredFreeDates)};\n\n` +
    `export { notAvailableDates, desiredDutyDates, desiredFreeDates };\n`;

const offsetsFile = ({offsets}) =>
    `export const dutyDaysOffset = ${serialize(offsets)};\n`;

const algorithmFile = ({algorithm}) =>
    `export const elitism = ${algorithm.elitism};\n` +
    `export const generationLimit = ${algorithm.generationLimit};\n` +
    `export const mutationProbability = ${algorithm.mutationProbability};\n` +
    `export const mutationAggresivity = ${algorithm.mutationAggresivity};\n` +
    `export const populationSize = ${algorithm.populationSize};\n` +
    `export const stopScore = ${algorithm.stopScore};\n` +
    `export const tournamentSelectionRatio = ${algorithm.tournamentSelectionRatio};\n` +
    `export const islandOptions = ${serialize(algorithm.islandOptions)};\n\n` +
    `export const offsetRatio = ${algorithm.offsetRatio};\n\n` +
    `// Evaluator weights control how much each criterion influences the final fitness score.\n` +
    `// Higher values make a criterion more important; set a weight to 0 to disable it.\n` +
    `export const evaluatorWeights = ${serialize(algorithm.evaluatorWeights)};\n`;

export const saveConfig = async (config) => {
    const normalized = normalizeConfig(config);
    const errors = getConfigErrorsFor(normalized);

    if (errors.length > 0) {
        const error = new Error('Invalid configuration');
        error.details = errors;
        throw error;
    }

    await Promise.all([
        writeFile(DOCTORS_FILE, doctorsFile(normalized)),
        writeFile(DATES_FILE, datesFile(normalized)),
        writeFile(OFFSETS_FILE, offsetsFile(normalized)),
        writeFile(ALGORITHM_FILE, algorithmFile(normalized))
    ]);

    // pricing.js is server-only — never overwritten via the public API
    const pricingConfig = await importFresh(PRICING_FILE);
    return {...normalized, pricingTier: pricingConfig.pricingTier, version: APP_VERSION};
};
