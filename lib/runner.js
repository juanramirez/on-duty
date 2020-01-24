import Genetical from 'genetical';
import {format, fromUnixTime} from 'date-fns';
import {createSchedule} from './schedule/random-factory';
import {cross} from "./operators/crossover";
import {fitness} from "./evaluators/";
import {getDoctor} from "./utils/doctors";
import {mutate} from "./operators/mutation";
import {elitism, generationLimit, mutationAggresivity, populationSize, stopScore} from "../config/algorithm";

const monthTimestamp = 1580515200; // February 1st GMT

export const run = () => {
    const algorithm = new Genetical({
        populationSize,
        populationFactory: (populationLength, populationSize, randomGenerator, callback) =>
            callback(null, {schedule: createSchedule({monthTimestamp, randomGenerator})}),
        terminationCondition: stats => stats.generation > generationLimit || stats.bestScore >= stopScore,
        fitnessEvaluator: (candidate, callback) => callback(null, fitness({schedule: candidate.schedule})),
        evolutionOptions: {
            crossover: (parent1, parent2, points, randomGenerator, callback) =>
                callback([
                    {schedule: cross({a: parent1.schedule, b: parent2.schedule, randomGenerator})},
                    {schedule: cross({a: parent2.schedule, b: parent1.schedule, randomGenerator})}
                ]),
            mutate: (candidate, mutationProbability, randomGenerator, callback) =>
                callback(
                    {schedule: mutate({schedule: candidate.schedule, mutationProbability, randomGenerator, mutationAggresivity})}
                ),
        },
        elitism
    });

    algorithm.on('stats updated', stats =>
        console.log('Generation ' + stats.generation +
            ', best score: ' + stats.bestScore +
            ', mean score: ' + stats.mean)
    );

    return algorithm.solve(null, (bestCandidate) => {
        console.log('Best candidate:');
        bestCandidate.schedule.map(({timestamp, doctorId}) => {
            console.log(format(fromUnixTime(timestamp), 'EEE dd/MM/yyyy') + ', doctor: ' + getDoctor({doctorId}).name);
        })
    });
};
