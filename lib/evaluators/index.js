import {map, sum} from 'lodash';
import {evaluatorWeights} from '../../config/algorithm';
import * as commonNotConsecutiveWeekdays from './common-not-consecutive-weekdays';
import * as personalNotAvailableWeekdays from './personal-not-available-weekdays';
import * as personalNotAvailableDates from './personal-not-available-dates';
import * as avoidDoublets from './avoid-doublets';
import * as personalDesiredDutyDates from './personal-desired-duty-dates';
import * as personalDutiesDistribution from './personal-duties-distribution';
import * as totalDutyDaysBalance from './total-duty-days-balance';
import * as personalDesiredFreeDates from './personal-desired-free-dates';
import * as weekendDaysBalance from './weekend-days-balance';
import * as isolatedWeekendDaysBalance from './isolated-weekend-days-balance';
import * as maxPossibleFreeWeekends from './max-possible-free-weekends';
import * as freeWeekendsBalance from './free-weekends-balance';

const evaluators = {
    commonNotConsecutiveWeekdays,
    personalNotAvailableWeekdays,
    personalNotAvailableDates,
    avoidDoublets,
    personalDesiredDutyDates,
    personalDutiesDistribution,
    totalDutyDaysBalance,
    personalDesiredFreeDates,
    weekendDaysBalance,
    isolatedWeekendDaysBalance,
    maxPossibleFreeWeekends,
    freeWeekendsBalance
};

export const fitness = ({schedule}) =>
    sum(
        map(evaluators, (evaluator, evaluatorName) => {
            const evaluatorFitness = evaluator.fitness({schedule});
            if (evaluatorFitness < 0 || evaluatorFitness > 1) {
                throw "Fitness should be between 0 and 1. " + evaluatorName + " gave " + evaluatorFitness;
            }
            return evaluatorWeights[evaluatorName] * evaluatorFitness
        })
    );

export const fitnessReport = ({schedule}) => {
    let report = "Fitness evaluation: \n";
    let total = 0;
    report += map(evaluators, (evaluator, evaluatorName) => {
        const evaluatorFitness = evaluator.fitness({schedule});
        if (evaluatorFitness < 0 || evaluatorFitness > 1) {
            throw "Fitness should be between 0 and 1. " + evaluatorName + " gave " + evaluatorFitness;
        }
        total += evaluatorWeights[evaluatorName] * evaluatorFitness;
        return evaluatorName + ": " + evaluatorFitness + ",\n";
    }).join('');
    report += "Total fitness: " + total + "\n";
    return report;
}
