import {filter, max, min} from 'lodash';
import {doctorIds} from "../utils/doctors";

const getTotalDutiesForDoctor = ({doctorId, schedule}) =>
    filter(schedule, it => it.doctorId === doctorId).length;

const differenceBetweenMaximumAndMinimum = ({schedule}) => {
    const values = doctorIds.map(doctorId => getTotalDutiesForDoctor({doctorId, schedule}));
    return max(values) - min(values);
};

export const fitness = ({schedule}) =>
    max([0.0, 1.0 - (0.1 * differenceBetweenMaximumAndMinimum({schedule}))]);
