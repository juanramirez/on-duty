import {filter, isEmpty, map, mean} from 'lodash';
import {getWeekends} from "../utils/weekdays";
import {doctorIds} from "../utils/doctors";
import {timestampDayIsBetween} from "../utils/dates";
import {getDoctorDuties} from "../utils/schedule";

const getWeekendSchedule = ({weekend, schedule}) =>
    filter(schedule, ({timestamp}) => timestampDayIsBetween({
        timestamp,
        range: weekend
    }));

const getDoctorFreeWeekends = ({doctorId, schedule}) => {
    const weekendSchedules = map(getWeekends({schedule}), weekend => getWeekendSchedule({weekend, schedule}));
    const doctorFreeWeekendSchedules = filter(weekendSchedules, weekendSchedule =>
        isEmpty(getDoctorDuties({doctorId, schedule: weekendSchedule})));
    return doctorFreeWeekendSchedules.length;
};

export const fitness = ({schedule}) =>
    mean(map(doctorIds, doctorId => getDoctorFreeWeekends({doctorId, schedule})))
        / getWeekends({schedule}).length;
