import _ from "lodash";
import {getUnixTime, parse} from 'date-fns';
import {notAvailableDates} from "../../config/dates";

const parseFormattedDate = (formattedDate) => getUnixTime(
    parse(formattedDate, 'dd/MM/yyyy', new Date())
);

const getNotAvailableDateTimestamps = _.once(() => {
    let result = {};
    for (let key of _.keys(notAvailableDates)) {
        result[key] = _.map(notAvailableDates[key], formattedDate => parseFormattedDate(formattedDate));
    }
    return result;
});

export const notAvailableDateTimestamps = getNotAvailableDateTimestamps();
