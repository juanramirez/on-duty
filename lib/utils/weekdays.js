import {map, once} from 'lodash';
import {differenceInDays, endOfDay, format, fromUnixTime, getUnixTime, startOfDay} from 'date-fns';
import {weekendDays} from "../../config/weekdays";

export const weekdayFromDate = ({date}) =>
    format(date, 'EEE');

export const weekdayFromTimestamp = ({timestamp}) =>
    weekdayFromDate({date: fromUnixTime(timestamp)});

export const isWeekendDay = ({timestamp}) =>
    weekendDays.includes(weekdayFromTimestamp({timestamp}));

export const getWeekends = once(({schedule}) => {
    const scheduleTimestamps = map(schedule, ({timestamp}) => timestamp);

    let weekends = [];
    let startTimestamp = null;
    let endTimestamp = null;
    let latestTimestampWasWeekend = false;
    for (let timestamp of scheduleTimestamps) {
        if (!latestTimestampWasWeekend) {
            if (isWeekendDay({timestamp})) {
                startTimestamp = getUnixTime(startOfDay(fromUnixTime(timestamp)));
                endTimestamp = getUnixTime(endOfDay(fromUnixTime(timestamp)));
                latestTimestampWasWeekend = true;
            }
        } else {
            if (isWeekendDay({timestamp})) {
                endTimestamp = getUnixTime(endOfDay(fromUnixTime(timestamp)));
            } else {
                latestTimestampWasWeekend = false;
                if (differenceInDays(fromUnixTime(endTimestamp), fromUnixTime(startTimestamp)) >= 1) {
                    weekends.push({
                        startTimestamp,
                        endTimestamp
                    })
                }
            }
        }
    }

    return weekends;
});
