import Genetical from 'genetical';
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
import {scheduleReport} from "./utils/schedule.js";

export const run = ({monthTimestamp}) => {
    const algorithm = new Genetical({
        populationSize,
        populationFactory: (populationLength, populationSize, randomGenerator, callback) => {
            try {
                callback(null, {schedule: createSchedule({monthTimestamp, randomGenerator})});
            } catch (err) {
                callback(err);
            }
        },
        terminationCondition: stats => stats.generation > generationLimit || stats.bestScore >= stopScore,
        fitnessEvaluator: (candidate, callback) => {
            try {
                callback(null, fitness({schedule: candidate.schedule}));
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

    algorithm.on('error', (err) => {
        console.error('Genetic algorithm error:', err.message);
        process.exit(1);
    });

    let lastBestScore = null;

    algorithm.on('stats updated', stats => {
        const improved = stats.bestScore !== lastBestScore;
        if (improved) {
            if (lastBestScore !== null) process.stdout.write('\n');
            console.log('Generation ' + stats.generation +
                ', best score: ' + stats.bestScore +
                ', mean score: ' + stats.mean);
            lastBestScore = stats.bestScore;
        } else {
            process.stdout.write('.');
        }
    });

    console.log('Initialising population...');
    return algorithm.solve(null, (bestCandidate) => {
        process.stdout.write('\n');
        console.log('Best candidate: \n' + scheduleReport({schedule: bestCandidate.schedule}));
    });
};
