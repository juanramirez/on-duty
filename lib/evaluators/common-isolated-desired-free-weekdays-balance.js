import {filter, map, max, mean, min} from "lodash";
import {commonDesiredFreeWeekdays} from "../../config/weekdays";
import {weekdayFromTimestamp} from "../utils/weekdays";
import {doctorIds} from "../utils/doctors";
import {getDoctorDuties} from "../utils/schedule";

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
    mean(map(commonDesiredFreeWeekdays, weekday => evaluateWeekday({weekday, schedule})));
