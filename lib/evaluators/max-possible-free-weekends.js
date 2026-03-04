import {map, mean} from 'lodash-es';
import {getDoctorFreeWeekends, getWeekends} from "../utils/weekdays.js";
import {doctorIds} from "../utils/doctors.js";

export const fitness = ({schedule}) =>
    mean(map(doctorIds, doctorId => getDoctorFreeWeekends({doctorId, schedule})))
        / getWeekends({schedule}).length;
