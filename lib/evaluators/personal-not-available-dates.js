import _ from 'lodash';
import {fromUnixTime, isSameDay} from 'date-fns';
import {notAvailableDates} from "../../config/dates";
import {parseFormattedDate} from "../utils/dates";

const getNotAvailableDateTimestamps = () => {
    let result = {};
    for (let key of _.keys(notAvailableDates)) {
        result[key] = _.map(notAvailableDates[key], formattedDate => parseFormattedDate(formattedDate));
    }
    return result;
};

const notAvailableDateTimestamps = getNotAvailableDateTimestamps();

const isAvailable = ({timestamp, doctorId}) =>
    _.every(_.get(notAvailableDateTimestamps, doctorId, []), notAvailableDateTimestamp =>
        !isSameDay(fromUnixTime(notAvailableDateTimestamp), fromUnixTime(timestamp)));

export const fitness = ({schedule}) =>
    _.filter(schedule, ({timestamp, doctorId}) => isAvailable({timestamp, doctorId})).length /
    schedule.length;
