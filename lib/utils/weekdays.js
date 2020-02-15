import {filter, isEmpty, map, once} from 'lodash';
import {differenceInDays, endOfDay, format, fromUnixTime, getUnixTime, startOfDay} from 'date-fns';
import {weekendDays} from "../../config/weekdays";
import {timestampDayIsBetween} from "./dates";
import {getDoctorDuties} from "./schedule";

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
const getWeekendSchedule = ({weekend, schedule}) =>
    filter(schedule, ({timestamp}) => timestampDayIsBetween({
        timestamp,
        range: weekend
    }));
export const getDoctorFreeWeekends = ({doctorId, schedule}) => {
    const weekendSchedules = map(getWeekends({schedule}), weekend => getWeekendSchedule({weekend, schedule}));
    const doctorFreeWeekendSchedules = filter(weekendSchedules, weekendSchedule =>
        isEmpty(getDoctorDuties({doctorId, schedule: weekendSchedule})));
    return doctorFreeWeekendSchedules.length;
};
