import _ from 'lodash';
import {getDoctorIds} from "../utils/doctors";

const getDifferentDoctorId = ({doctorId, randomGenerator}) => {
    let result = null;
    do {
        result = getDoctorIds()[Math.floor(randomGenerator.random() * getDoctorIds().length)]
    } while (result !== doctorId);
    return result;
};

export const mutate = ({schedule, mutationProbability, mutationAggresivity, randomGenerator}) => {
    if (randomGenerator.random() < mutationProbability) {
        return _.map(schedule, ({timestamp, doctorId}) =>
            ({timestamp, doctorId: randomGenerator.random() < mutationAggresivity
                    ? getDifferentDoctorId({doctorId, randomGenerator})
                    : doctorId})
        )
    } else {
        return schedule;
    }
};
