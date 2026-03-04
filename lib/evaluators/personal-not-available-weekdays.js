import {every, filter} from 'lodash-es';
import {getDoctor} from "../utils/doctors.js";
import {weekdayFromTimestamp} from "../utils/weekdays.js";

const isAvailable = ({timestamp, doctorId}) =>
    every(getDoctor({doctorId}).notAvailableWeekdays,
        weekday => weekdayFromTimestamp({timestamp}) !== weekday);

export const fitness = ({schedule}) =>
    filter(schedule, ({timestamp, doctorId}) =>
        isAvailable({timestamp, doctorId})).length / schedule.length;
