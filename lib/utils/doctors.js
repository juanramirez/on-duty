import _ from 'lodash';
import {doctors} from "../../config/doctors";

const getDoctorIds = _.once(() => doctors.map((doctor) => doctor.id));
export const doctorIds = getDoctorIds();

export const getDoctor = ({doctorId}) =>
    _.find(doctors, doctor => doctorId === doctor.id);

export const getDoctorDoubletsTolerance = ({doctorId}) =>
    _.get(getDoctor({doctorId}), 'doubletsTolerance', 0.5);
