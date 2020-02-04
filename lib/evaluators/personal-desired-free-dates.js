import {filter, isEmpty, map, mean, some} from 'lodash';
import {doctorIds} from "../utils/doctors";
import {desiredFreeDateTimestamps} from "../utils/dates";
import {getDoctorDuties} from "../utils/schedule";
import {fromUnixTime, isSameDay} from "date-fns";

const isDesiredFreeDate = ({doctorId, timestamp}) =>
    some(desiredFreeDateTimestamps[doctorId], desiredFreeTimestamp =>
        isSameDay(fromUnixTime(desiredFreeTimestamp), fromUnixTime(timestamp)));

const freeDatesRatio = ({doctorId, schedule}) => {
    if (isEmpty(desiredFreeDateTimestamps[doctorId])) {
        return 1.0;
    } else {
        return filter(getDoctorDuties({doctorId, schedule}), (timestamp) =>
                !isDesiredFreeDate({doctorId, timestamp})).length
            / (schedule.length - desiredFreeDateTimestamps[doctorId].length);
    }
};

export const fitness = ({schedule}) =>
    mean(
        map(doctorIds, doctorId => freeDatesRatio({doctorId, schedule}))
    );
