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
import * as commonDesiredFreeWeekdaysBalance from './common-desired-free-weekdays-balance';

const evaluators = {
    commonNotConsecutiveWeekdays,
    personalNotAvailableWeekdays,
    personalNotAvailableDates,
    avoidDoublets,
    personalDesiredDutyDates,
    personalDutiesDistribution,
    totalDutyDaysBalance,
    personalDesiredFreeDates,
    commonDesiredFreeWeekdaysBalance
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
