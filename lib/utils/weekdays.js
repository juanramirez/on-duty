import {format, fromUnixTime} from 'date-fns';

export const weekdayFromDate = ({date}) =>
    format(date, 'EEE');

export const weekdayFromTimestamp = ({timestamp}) =>
    weekdayFromDate({date: fromUnixTime(timestamp)});
