import {filter, find, map, min} from 'lodash';
import {fromUnixTime, isSameDay} from 'date-fns';

export const getScheduleFirstTimestamp = ({schedule}) =>
    min(map(schedule, ({timestamp}) => timestamp));

export const getOnDutyDoctorId = ({timestamp: wantedTimestamp, schedule}) => {
    const found = find(schedule, ({timestamp}) =>
        isSameDay(fromUnixTime(timestamp), fromUnixTime(wantedTimestamp)));
    return found ? found.doctorId : null;
};

export const getDoctorDuties = ({doctorId: wantedDoctorId, schedule}) =>
    map(
        filter(schedule, ({doctorId}) => doctorId === wantedDoctorId),
        ({timestamp}) => timestamp
    );
