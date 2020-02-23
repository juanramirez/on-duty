import {filter, find, map, min} from 'lodash';
import {format, fromUnixTime, isSameDay} from 'date-fns';
import {getDoctor} from "./doctors";

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

export const scheduleReport = ({schedule}) =>
    schedule.map(({timestamp, doctorId}) =>
        format(fromUnixTime(timestamp), 'EEE dd/MM/yyyy') + ', doctor: ' + getDoctor({doctorId}).name).join('\n');
