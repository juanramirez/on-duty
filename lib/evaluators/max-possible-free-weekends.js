import {map, mean} from 'lodash';
import {getDoctorFreeWeekends, getWeekends} from "../utils/weekdays";
import {doctorIds} from "../utils/doctors";

export const fitness = ({schedule}) =>
    mean(map(doctorIds, doctorId => getDoctorFreeWeekends({doctorId, schedule})))
        / getWeekends({schedule}).length;
