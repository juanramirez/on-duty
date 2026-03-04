import {map, max, mean, sortBy} from 'lodash-es';
import {differenceInCalendarDays, fromUnixTime} from 'date-fns';
import {doctorIds, getDoctorBackToBackTolerance} from "../utils/doctors.js";
import {getDoctorDuties} from "../utils/schedule.js";

const getDoctorBackToBackDuties = ({doctorId, schedule}) => {
    const doctorDuties = sortBy(getDoctorDuties({doctorId, schedule}));
    let backToBack = 0;

    for (let i = 1; i < doctorDuties.length; i++) {
        if (Math.abs(differenceInCalendarDays(fromUnixTime(doctorDuties[i-1]), fromUnixTime(doctorDuties[i]))) <= 2) {
            backToBack++;
        }
    }

    return backToBack;
};

const evaluateDoctor = ({doctorId, schedule}) =>
    max([0.0, 1.0 - ((1.0 - getDoctorBackToBackTolerance({doctorId})) * getDoctorBackToBackDuties({doctorId, schedule}) / getDoctorDuties({doctorId, schedule}).length)]);

export const fitness = ({schedule}) =>
    mean(map(doctorIds, doctorId => evaluateDoctor({doctorId, schedule})));
