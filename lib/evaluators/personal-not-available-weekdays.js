import {every, filter} from 'lodash';
import {getDoctor} from "../utils/doctors";
import {weekdayFromTimestamp} from "../utils/weekdays";

const isAvailable = ({timestamp, doctorId}) =>
    every(getDoctor({doctorId}).notAvailableWeekdays,
        weekday => weekdayFromTimestamp({timestamp}) !== weekday);

export const fitness = ({schedule}) =>
    filter(schedule, ({timestamp, doctorId}) =>
        isAvailable({timestamp, doctorId})).length / schedule.length;
