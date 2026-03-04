import {filter, map, max, mean, min} from "lodash-es";
import {weekendDays} from "../../config/weekdays.js";
import {weekdayFromTimestamp} from "../utils/weekdays.js";
import {doctorIds} from "../utils/doctors.js";
import {getDoctorDuties} from "../utils/schedule.js";

const getWeekdaySchedule = ({weekday, schedule}) =>
    filter(schedule, ({timestamp}) => weekdayFromTimestamp({timestamp}) === weekday);

const differenceBetweenMaximumAndMinimum = ({schedule}) => {
    const values = map(doctorIds, doctorId => getDoctorDuties({doctorId, schedule}).length);
    return max(values) - min(values);
};

const evaluateWeekday = ({weekday, schedule}) => {
    const weekdaySchedule = getWeekdaySchedule({weekday, schedule});
    return max([0.0, 1.0 - (0.1 * differenceBetweenMaximumAndMinimum({schedule: weekdaySchedule}))]);
};

export const fitness = ({schedule}) =>
    mean(map(weekendDays, weekday => evaluateWeekday({weekday, schedule})));
