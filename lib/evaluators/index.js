import {map, sum} from 'lodash-es';
import {evaluatorWeights} from '../../config/algorithm.js';
import * as commonNotConsecutiveWeekdays from './common-not-consecutive-weekdays.js';
import * as personalNotAvailableWeekdays from './personal-not-available-weekdays.js';
import * as personalNotAvailableDates from './personal-not-available-dates.js';
import * as avoidBackToBack from './avoid-back-to-back.js';
import * as personalDesiredDutyDates from './personal-desired-duty-dates.js';
import * as personalDutiesDistribution from './personal-duties-distribution.js';
import * as totalDutyDaysBalance from './total-duty-days-balance.js';
import * as personalDesiredFreeDates from './personal-desired-free-dates.js';
import * as weekendDaysBalance from './weekend-days-balance.js';
import * as isolatedWeekendDaysBalance from './isolated-weekend-days-balance.js';
import * as maxPossibleFreeWeekends from './max-possible-free-weekends.js';
import * as freeWeekendsBalance from './free-weekends-balance.js';

const evaluators = {
    commonNotConsecutiveWeekdays,
    personalNotAvailableWeekdays,
    personalNotAvailableDates,
    avoidBackToBack,
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
