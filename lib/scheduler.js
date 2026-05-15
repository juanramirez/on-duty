import Genetical from 'genetical';
import {format, fromUnixTime} from 'date-fns';
import {createSchedule} from './schedule/random-factory.js';
import {cross} from "./operators/crossover.js";
import {fitness} from "./evaluators/index.js";
import {mutate} from "./operators/mutation.js";
import {
    elitism,
    generationLimit,
    islandOptions,
    mutationAggresivity,
    mutationProbability,
    populationSize,
    stopScore,
    tournamentSelectionRatio
} from "../config/algorithm.js";
import {getDoctor} from "./utils/doctors.js";

const buildAlgorithm = ({monthTimestamp, onInitProgress, onStats, onEvalProgress, shouldStop}) => {
    let initCount = 0;
    let evalCount = 0;
    const evalTotal = populationSize * (islandOptions.islands || 1);
    const evalStep = Math.max(1, Math.floor(evalTotal / 10));

    const algorithm = new Genetical({
        populationSize,
        populationFactory: (populationLength, populationSize, randomGenerator, callback) => {
            try {
                const result = createSchedule({monthTimestamp, randomGenerator});
                initCount++;
                onInitProgress?.({current: initCount});
                callback(null, {schedule: result});
            } catch (err) {
                callback(err);
            }
        },
        terminationCondition: stats => shouldStop?.() || stats.generation > generationLimit || stats.bestScore >= stopScore,
        fitnessEvaluator: (candidate, callback) => {
            try {
                const score = fitness({schedule: candidate.schedule});
                evalCount++;
                if (evalCount % evalStep === 0 || evalCount >= evalTotal) {
                    onEvalProgress?.({current: Math.min(evalCount, evalTotal), total: evalTotal});
                }
                callback(null, score);
            } catch (err) {
                callback(err);
            }
        },
        evolutionOptions: {
            crossover: (parent1, parent2, points, randomGenerator, callback) => {
                try {
                    callback([
                        {schedule: cross({a: parent1.schedule, b: parent2.schedule, randomGenerator})},
                        {schedule: cross({a: parent2.schedule, b: parent1.schedule, randomGenerator})}
                    ]);
                } catch (err) {
                    console.error('Crossover error:', err.message);
                    callback([parent1, parent2]);
                }
            },
            mutate: (candidate, mutationProbability, randomGenerator, callback) => {
                try {
                    callback(
                        {schedule: mutate({schedule: candidate.schedule, mutationProbability, randomGenerator, mutationAggresivity})}
                    );
                } catch (err) {
                    console.error('Mutation error:', err.message);
                    callback(candidate);
                }
            },
            mutationProbability
        },
        selectionStrategy: Genetical.TOURNAMENT,
        selectionStrategyOptions: {
            tournamentSelection: tournamentSelectionRatio
        },
        elitism,
        islandOptions
    });

    algorithm.on('stats updated', stats => {
        evalCount = 0;
        onStats?.(stats);
    });

    return algorithm;
};

export const totalInitialIndividuals = () =>
    populationSize * (islandOptions.islands || 1);

export const serializeSchedule = ({schedule}) =>
    schedule.map(({timestamp, doctorId}) => {
        const doctor = getDoctor({doctorId});

        return {
            timestamp,
            date: format(fromUnixTime(timestamp), 'yyyy-MM-dd'),
            weekday: format(fromUnixTime(timestamp), 'EEE'),
            doctor: {
                id: doctorId,
                name: doctor?.name || doctorId
            }
        };
    });

export const generateSchedule = ({monthTimestamp, onInitProgress, onStats, onEvalProgress, shouldStop}) =>
    new Promise((resolve, reject) => {
        const algorithm = buildAlgorithm({monthTimestamp, onInitProgress, onStats, onEvalProgress, shouldStop});
        let lastStats = null;

        algorithm.on('stats updated', stats => {
            lastStats = stats;
        });

        algorithm.on('error', reject);

        try {
            algorithm.solve(null, (bestCandidate, generation) => {
                resolve({
                    schedule: bestCandidate.schedule,
                    score: lastStats?.bestScore ?? null,
                    mean: lastStats?.mean ?? null,
                    generation
                });
            });
        } catch (err) {
            reject(err);
        }
    });
