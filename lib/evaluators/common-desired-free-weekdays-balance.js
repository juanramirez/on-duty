import {filter, map, max, min} from 'lodash';
import {doctorIds} from "../utils/doctors";
import {commonDesiredFreeWeekdays} from "../../config/weekdays";
import {weekdayFromTimestamp} from "../utils/weekdays";
import {getDoctorDuties} from "../utils/schedule";

const getDesiredFreeWeekdaysSchedule = ({schedule}) =>
    filter(schedule, ({timestamp}) => commonDesiredFreeWeekdays.includes(weekdayFromTimestamp({timestamp})));

const differenceBetweenMaximumAndMinimum = ({schedule}) => {
    const values = map(doctorIds, doctorId => getDoctorDuties({doctorId, schedule}).length);
    return max(values) - min(values);
};

export const fitness = ({schedule}) => {
    const desiredFreeDaysSchedule = getDesiredFreeWeekdaysSchedule({schedule});
    return max([0.0, 1.0 - (0.1 * differenceBetweenMaximumAndMinimum({schedule: desiredFreeDaysSchedule}))]);
};
