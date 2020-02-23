import {filter, get, max, min} from 'lodash';
import {doctorIds} from "../utils/doctors";
import {dutyDaysOffset} from "../../config/offsets";
import {offsetRatio} from "../../config/algorithm";

const getTotalDutiesForDoctor = ({doctorId, schedule}) =>
    filter(schedule, it => it.doctorId === doctorId).length;

const differenceBetweenMaximumAndMinimum = ({schedule}) => {
    const values = doctorIds.map(doctorId => getTotalDutiesForDoctor({doctorId, schedule}) + offsetRatio * get(dutyDaysOffset, doctorId, 0));
    return max(values) - min(values);
};

export const fitness = ({schedule}) =>
    max([0.0, 1.0 - (0.1 * differenceBetweenMaximumAndMinimum({schedule}))]);
