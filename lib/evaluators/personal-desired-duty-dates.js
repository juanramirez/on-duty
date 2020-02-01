import {filter, isEmpty, map, mean, some} from 'lodash';
import {fromUnixTime, isSameDay} from 'date-fns';
import {doctorIds} from "../utils/doctors";
import {desiredDutyDateTimestamps} from "../utils/dates";

const isDesiredDutyDate = ({doctorId, timestamp}) =>
    some(desiredDutyDateTimestamps[doctorId], desiredDutyTimestamp =>
        isSameDay(fromUnixTime(desiredDutyTimestamp), fromUnixTime(timestamp)));

const dutyDatesRatio = ({doctorId, schedule}) => {
    if (isEmpty(desiredDutyDateTimestamps[doctorId])) {
        return 1.0;
    } else {
        return filter(schedule, ({timestamp, doctorId}) => isDesiredDutyDate({doctorId, timestamp})).length
            / schedule.length;
    }
};

export const fitness = ({schedule}) =>
    mean(
        map(doctorIds, doctorId => dutyDatesRatio({doctorId, schedule}))
    );
