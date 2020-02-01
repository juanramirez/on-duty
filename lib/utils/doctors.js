import {find, get, once} from 'lodash';
import {doctors} from "../../config/doctors";

const getDoctorIds = once(() => doctors.map((doctor) => doctor.id));
export const doctorIds = getDoctorIds();

export const getDoctor = ({doctorId}) =>
    find(doctors, doctor => doctorId === doctor.id);

export const getDoctorDoubletsTolerance = ({doctorId}) =>
    get(getDoctor({doctorId}), 'doubletsTolerance', 0.5);
