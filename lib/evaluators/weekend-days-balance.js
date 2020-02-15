import {filter, map, max, min} from 'lodash';
import {doctorIds} from "../utils/doctors";
import {isWeekendDay} from "../utils/weekdays";
import {getDoctorDuties} from "../utils/schedule";

const getWeekendDaysSchedule = ({schedule}) =>
    filter(schedule, ({timestamp}) => isWeekendDay({timestamp}));

const differenceBetweenMaximumAndMinimum = ({schedule}) => {
    const values = map(doctorIds, doctorId => getDoctorDuties({doctorId, schedule}).length);
    return max(values) - min(values);
};

export const fitness = ({schedule}) => {
    const weekendDaysSchedule = getWeekendDaysSchedule({schedule});
    return max([0.0, 1.0 - (0.1 * differenceBetweenMaximumAndMinimum({schedule: weekendDaysSchedule}))]);
};
