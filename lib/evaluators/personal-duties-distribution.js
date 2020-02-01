import {map, max, mean} from 'lodash';
import {differenceInCalendarDays, fromUnixTime} from 'date-fns';
import {std} from 'mathjs';
import {doctorIds} from "../utils/doctors";
import {getDoctorDuties, getScheduleFirstTimestamp} from "../utils/schedule";

const doctorDutiesDistribution = ({doctorId, schedule}) => {
    const dutyDaysFromStart = map(getDoctorDuties({doctorId, schedule}),
        timestamp => Math.abs(differenceInCalendarDays(
            fromUnixTime(timestamp),
            fromUnixTime(getScheduleFirstTimestamp({schedule}))
        )));
    return dutyDaysFromStart.length !== 0
        ? std(dutyDaysFromStart) / schedule.length
        : 0;
};

const evaluateDoctor = ({doctorId, schedule}) =>
    max([0.0, doctorDutiesDistribution({doctorId, schedule})]);

export const fitness = ({schedule}) =>
    mean(
        map(doctorIds, doctorId => evaluateDoctor({doctorId, schedule}))
    );
