import _ from 'lodash';
import {doctors} from "../../config/doctors";

export const getDoctor = ({doctorId}) =>
    _.find(doctors, doctor => doctorId === doctor.id);
