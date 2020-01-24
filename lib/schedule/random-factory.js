import _ from 'lodash';
import {addDays, fromUnixTime, getDaysInMonth, getUnixTime, startOfMonth} from 'date-fns';
import {doctors} from "../../config/doctors";

const doctorIds = doctors.map((doctor) => doctor.id);

const getRandomDoctorId = ({ randomGenerator }) => doctorIds[Math.floor(randomGenerator.random() * doctorIds.length)];

export const createSchedule = ({ monthTimestamp, randomGenerator }) =>
    _.range(0, getDaysInMonth(fromUnixTime(monthTimestamp)))
        .map((dayOffset) => addDays(startOfMonth(fromUnixTime(monthTimestamp)), dayOffset))
        .map((dayTimestamp) =>
            ({timestamp: getUnixTime(dayTimestamp), doctorId: getRandomDoctorId({randomGenerator})}));
