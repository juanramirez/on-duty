import _ from 'lodash';
import {fromUnixTime, isSameDay} from 'date-fns';
import {doctorIds} from "../utils/doctors";
import {desiredDutyDateTimestamps} from "../utils/dates";

const isDesiredDutyDate = ({doctorId, timestamp}) =>
    _.some(desiredDutyDateTimestamps[doctorId], desiredDutyTimestamp =>
        isSameDay(fromUnixTime(desiredDutyTimestamp), fromUnixTime(timestamp)));

const dutyDatesRatio = ({doctorId, schedule}) => {
    if (_.isEmpty(desiredDutyDateTimestamps[doctorId])) {
        return 1.0;
    } else {
        return _.filter(schedule, ({timestamp, doctorId}) => isDesiredDutyDate({doctorId, timestamp})).length
            / schedule.length;
    }
};

export const fitness = ({schedule}) =>
    _.mean(
        _.map(doctorIds, doctorId => dutyDatesRatio({doctorId, schedule}))
    );
