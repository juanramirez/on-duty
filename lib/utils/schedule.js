import _ from 'lodash';
import {fromUnixTime, isSameDay} from 'date-fns';

export const getOnDutyDoctorId = ({timestamp: wantedTimestamp, schedule}) => {
    const found = _.find(schedule, ({timestamp}) =>
        isSameDay(fromUnixTime(timestamp), fromUnixTime(wantedTimestamp)));
    return found ? found.doctorId : null;
};
