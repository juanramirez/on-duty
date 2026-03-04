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

const BAR_WIDTH = 30;

const renderBar = ({label, current, total, extra = ''}) => {
    const pct = Math.min(current / total, 1);
    const filled = Math.round(pct * BAR_WIDTH);
    const bar = '='.repeat(filled) + (filled < BAR_WIDTH ? '>' : '') + ' '.repeat(Math.max(0, BAR_WIDTH - filled - 1));
    const cur = String(current).padStart(String(total).length);
    process.stdout.write('\r[' + bar + '] ' + label + ' ' + cur + '/' + total + extra + '   ');
};

export const run = ({monthTimestamp}) => {
    const totalIndividuals = populationSize * (islandOptions.islands || 1);
    let initCount = 0;

    const algorithm = new Genetical({
        populationSize,
        populationFactory: (populationLength, populationSize, randomGenerator, callback) => {
            try {
                const result = createSchedule({monthTimestamp, randomGenerator});
                initCount++;
                renderBar({label: 'Init', current: initCount, total: totalIndividuals});
                callback(null, {schedule: result});
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
        const delta = improved && lastBestScore !== null
            ? ' \x1b[32m+' + (stats.bestScore - lastBestScore).toFixed(2) + '\x1b[0m'
            : '';
        renderBar({
            label: 'Gen',
            current: stats.generation,
            total: generationLimit,
            extra: ' | best: ' + stats.bestScore.toFixed(2) + delta + ' | mean: ' + stats.mean.toFixed(2)
        });
        if (improved) lastBestScore = stats.bestScore;
    });
    return algorithm.solve(null, (bestCandidate) => {
        process.stdout.write('\n');
        console.log('Best candidate: \n' + scheduleReport({schedule: bestCandidate.schedule}));
    });
};
