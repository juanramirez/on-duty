import _ from 'lodash';
import {addDays, fromUnixTime, getDaysInMonth, getUnixTime, startOfMonth} from 'date-fns';
import {getDoctorIds} from "../utils/doctors";

const getRandomDoctorId = ({ randomGenerator }) => getDoctorIds()[Math.floor(randomGenerator.random() * getDoctorIds().length)];

export const createSchedule = ({ monthTimestamp, randomGenerator }) =>
    _.range(0, getDaysInMonth(fromUnixTime(monthTimestamp)))
        .map((dayOffset) => addDays(startOfMonth(fromUnixTime(monthTimestamp)), dayOffset))
        .map((dayTimestamp) =>
            ({timestamp: getUnixTime(dayTimestamp), doctorId: getRandomDoctorId({randomGenerator})}));
