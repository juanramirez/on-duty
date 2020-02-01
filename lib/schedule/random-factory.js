import {range} from 'lodash';
import {addDays, fromUnixTime, getDaysInMonth, getUnixTime, startOfMonth} from 'date-fns';
import {doctorIds} from "../utils/doctors";

const getRandomDoctorId = ({ randomGenerator }) => doctorIds[Math.floor(randomGenerator.random() * doctorIds.length)];

export const createSchedule = ({ monthTimestamp, randomGenerator }) =>
    range(0, getDaysInMonth(fromUnixTime(monthTimestamp)))
        .map((dayOffset) => addDays(startOfMonth(fromUnixTime(monthTimestamp)), dayOffset))
        .map((dayTimestamp) =>
            ({timestamp: getUnixTime(dayTimestamp), doctorId: getRandomDoctorId({randomGenerator})}));
