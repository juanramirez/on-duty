import _ from "lodash";
import {getUnixTime, parse} from 'date-fns';
import {desiredDutyDates, notAvailableDates} from "../../config/dates";

const parseFormattedDate = (formattedDate) => getUnixTime(
    parse(formattedDate, 'dd/MM/yyyy', new Date())
);

const getTimestampsFromConfig = config => {
    let result = {};
    for (let key of _.keys(config)) {
        result[key] = _.map(config[key], formattedDate => parseFormattedDate(formattedDate));
    }
    return result;
};

const getNotAvailableDateTimestamps = _.once(() => getTimestampsFromConfig(notAvailableDates));
export const notAvailableDateTimestamps = getNotAvailableDateTimestamps();

const getDesiredDutyDateTimestamps = _.once(() => getTimestampsFromConfig(desiredDutyDates));
export const desiredDutyDateTimestamps = getDesiredDutyDateTimestamps();
