import {filter, isEmpty, map, mean, some} from 'lodash-es';
import {doctorIds} from "../utils/doctors.js";
import {desiredFreeDateTimestamps} from "../utils/dates.js";
import {getDoctorDuties} from "../utils/schedule.js";
import {fromUnixTime, isSameDay} from "date-fns";

const isDesiredFreeDate = ({doctorId, timestamp}) =>
    some(desiredFreeDateTimestamps[doctorId], desiredFreeTimestamp =>
        isSameDay(fromUnixTime(desiredFreeTimestamp), fromUnixTime(timestamp)));

const freeDatesRatio = ({doctorId, schedule}) => {
    if (isEmpty(desiredFreeDateTimestamps[doctorId])) {
        return 1.0;
    } else {
        return 1.0 - (filter(getDoctorDuties({doctorId, schedule}), (timestamp) =>
                isDesiredFreeDate({doctorId, timestamp})).length
            / desiredFreeDateTimestamps[doctorId].length);
    }
};

export const fitness = ({schedule}) =>
    mean(
        map(doctorIds, doctorId => freeDatesRatio({doctorId, schedule}))
    );
