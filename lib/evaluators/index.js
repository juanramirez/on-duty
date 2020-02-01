import {map, sum} from 'lodash';
import {evaluatorWeights} from '../../config/algorithm';
import * as commonNotConsecutiveWeekdays from './common-not-consecutive-weekdays';
import * as personalNotAvailableWeekdays from './personal-not-available-weekdays';
import * as personalNotAvailableDates from './personal-not-available-dates';
import * as avoidDoublets from './avoid-doublets';
import * as personalDesiredDutyDates from './personal-desired-duty-dates';
import * as personalDutiesDistribution from './personal-duties-distribution';
import * as totalDutyDaysBalance from './total-duty-days-balance';

const evaluators = {
    commonNotConsecutiveWeekdays,
    personalNotAvailableWeekdays,
    personalNotAvailableDates,
    avoidDoublets,
    personalDesiredDutyDates,
    personalDutiesDistribution,
    totalDutyDaysBalance
};

export const fitness = ({schedule}) =>
    sum(
        map(evaluators, (evaluator, evaluatorName) =>
            evaluatorWeights[evaluatorName] * evaluator.fitness({schedule}))
    );
