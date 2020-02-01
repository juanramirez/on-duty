import _ from 'lodash';
import {fromUnixTime, isSameDay} from 'date-fns';

export const getScheduleFirstTimestamp = ({schedule}) =>
    _.min(_.map(schedule, ({timestamp}) => timestamp));

export const getOnDutyDoctorId = ({timestamp: wantedTimestamp, schedule}) => {
    const found = _.find(schedule, ({timestamp}) =>
        isSameDay(fromUnixTime(timestamp), fromUnixTime(wantedTimestamp)));
    return found ? found.doctorId : null;
};

export const getDoctorDuties = ({doctorId: wantedDoctorId, schedule}) =>
    _.map(
        _.filter(schedule, ({doctorId}) => doctorId === wantedDoctorId),
        ({timestamp}) => timestamp
    );
