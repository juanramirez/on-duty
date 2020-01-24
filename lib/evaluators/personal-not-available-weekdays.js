import _ from 'lodash';
import {getDoctor} from "../utils/doctors";
import {weekdayFromTimestamp} from "../utils/weekdays";

const isAvailable = ({timestamp, doctorId}) =>
    _.every(getDoctor({doctorId}).notAvailableWeekdays,
        weekday => weekdayFromTimestamp({timestamp}) !== weekday);

export const fitness = ({schedule}) =>
    _.filter(schedule, ({timestamp, doctorId}) =>
        isAvailable({timestamp, doctorId})).length / schedule.length;
