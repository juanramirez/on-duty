import _ from 'lodash';
import {evaluatorWeights} from '../../config/algorithm';
import * as commonNotConsecutiveWeekdays from './common-not-consecutive-weekdays';
import * as personalNotAvailableWeekdays from './personal-not-available-weekdays';
import * as personalNotAvailableDates from './personal-not-available-dates';

const evaluators = {
    commonNotConsecutiveWeekdays,
    personalNotAvailableWeekdays,
    personalNotAvailableDates
};

export const fitness = ({schedule}) =>
    _.sum(
        _.map(evaluators, (evaluator, evaluatorName) =>
            evaluatorWeights[evaluatorName] * evaluator.fitness({schedule}))
    );
