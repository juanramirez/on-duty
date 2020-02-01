import {every, filter, get} from 'lodash';
import {fromUnixTime, isSameDay} from 'date-fns';
import {notAvailableDateTimestamps} from "../utils/dates";

const isAvailable = ({timestamp, doctorId}) =>
    every(get(notAvailableDateTimestamps, doctorId, []), notAvailableDateTimestamp =>
        !isSameDay(fromUnixTime(notAvailableDateTimestamp), fromUnixTime(timestamp)));

export const fitness = ({schedule}) =>
    filter(schedule, ({timestamp, doctorId}) => isAvailable({timestamp, doctorId})).length /
    schedule.length;
