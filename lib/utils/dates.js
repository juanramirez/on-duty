import {keys, map, once} from "lodash";
import {getUnixTime, parse} from 'date-fns';
import {desiredDutyDates, desiredFreeDates, notAvailableDates} from "../../config/dates";

const parseFormattedDate = (formattedDate) => getUnixTime(
    parse(formattedDate, 'dd/MM/yyyy', new Date())
);

const getTimestampsFromConfig = config => {
    let result = {};
    for (let key of keys(config)) {
        result[key] = map(config[key], formattedDate => parseFormattedDate(formattedDate));
    }
    return result;
};

const getNotAvailableDateTimestamps = once(() => getTimestampsFromConfig(notAvailableDates));
export const notAvailableDateTimestamps = getNotAvailableDateTimestamps();

const getDesiredDutyDateTimestamps = once(() => getTimestampsFromConfig(desiredDutyDates));
export const desiredDutyDateTimestamps = getDesiredDutyDateTimestamps();

const getDesiredFreeDateTimestamps = once(() => getTimestampsFromConfig(desiredFreeDates));
export const desiredFreeDateTimestamps = getDesiredFreeDateTimestamps();
