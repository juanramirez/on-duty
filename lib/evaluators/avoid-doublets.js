import {map, max, mean, sortBy} from 'lodash';
import {differenceInCalendarDays, fromUnixTime} from 'date-fns';
import {doctorIds, getDoctorDoubletsTolerance} from "../utils/doctors";
import {getDoctorDuties} from "../utils/schedule";

const getDoctorDoublets = ({doctorId, schedule}) => {
    const doctorDuties = sortBy(getDoctorDuties({doctorId, schedule}));
    let doublets = 0;

    for (let i = 1; i < doctorDuties.length; i++) {
        if (Math.abs(differenceInCalendarDays(fromUnixTime(doctorDuties[i-1]), fromUnixTime(doctorDuties[i]))) <= 2) {
            doublets++;
        }
    }

    return doublets;
};

const evaluateDoctor = ({doctorId, schedule}) =>
    max([0.0, 1.0 - ((1.0 - getDoctorDoubletsTolerance({doctorId})) * getDoctorDoublets({doctorId, schedule}) / getDoctorDuties({doctorId, schedule}).length)]);

export const fitness = ({schedule}) =>
    mean(map(doctorIds, doctorId => evaluateDoctor({doctorId, schedule})));
