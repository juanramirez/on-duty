import {map, max, min} from 'lodash';
import {doctorIds} from "../utils/doctors";
import {getDoctorFreeWeekends} from "../utils/weekdays";

const differenceBetweenMaximumAndMinimum = ({schedule}) => {
    const values = map(doctorIds, doctorId => getDoctorFreeWeekends({doctorId, schedule}));
    return max(values) - min(values);
};

export const fitness = ({schedule}) =>
    max([0.0, 1.0 - (0.1 * differenceBetweenMaximumAndMinimum({schedule}))]);
