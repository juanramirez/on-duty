import _ from 'lodash';
import {fromUnixTime, getUnixTime, subDays} from 'date-fns';
import {weekdayFromDate, weekdayFromTimestamp} from "../utils/weekdays";
import {getOnDutyDoctorId} from "../utils/schedule";
import {notConsecutiveWeekdays} from "../../config/weekdays";

const getLatestRelativeWeekdayTimestamp = ({timestamp, weekday}) => {
    let date = fromUnixTime(timestamp);
    while (weekdayFromDate({date}) !== weekday) {
        date = subDays(date, 1)
    }
    return getUnixTime(date);
};

const canBeAssigned = ({timestamp, doctorId, schedule}) =>
    _.every(notConsecutiveWeekdays[weekdayFromTimestamp({timestamp})], weekday =>
        getOnDutyDoctorId({
            timestamp: getLatestRelativeWeekdayTimestamp({timestamp, weekday}),
            schedule
        }) !== doctorId);


export const fitness = ({schedule}) =>
    _.filter(schedule, ({timestamp, doctorId}) =>
        canBeAssigned({timestamp, doctorId, schedule})).length / schedule.length;
