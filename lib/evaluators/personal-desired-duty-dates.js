import {filter, isEmpty, map, mean, some} from 'lodash-es';
import {fromUnixTime, isSameDay} from 'date-fns';
import {doctorIds} from "../utils/doctors.js";
import {desiredDutyDateTimestamps} from "../utils/dates.js";
import {getDoctorDuties} from "../utils/schedule.js";

const isDesiredDutyDate = ({doctorId, timestamp}) =>
    some(desiredDutyDateTimestamps[doctorId], desiredDutyTimestamp =>
        isSameDay(fromUnixTime(desiredDutyTimestamp), fromUnixTime(timestamp)));

const dutyDatesRatio = ({doctorId, schedule}) => {
    if (isEmpty(desiredDutyDateTimestamps[doctorId])) {
        return 1.0;
    } else {
        return filter(getDoctorDuties({doctorId, schedule}), (timestamp) =>
                isDesiredDutyDate({doctorId, timestamp})).length
            / desiredDutyDateTimestamps[doctorId].length;
    }
};

export const fitness = ({schedule}) =>
    mean(
        map(doctorIds, doctorId => dutyDatesRatio({doctorId, schedule}))
    );
