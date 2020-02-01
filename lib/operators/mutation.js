import {map} from 'lodash';
import {doctorIds} from "../utils/doctors";

const getDifferentDoctorId = ({doctorId, randomGenerator}) => {
    let result = null;
    do {
        result = doctorIds[Math.floor(randomGenerator.random() * doctorIds.length)]
    } while (result !== doctorId);
    return result;
};

export const mutate = ({schedule, mutationProbability, mutationAggresivity, randomGenerator}) => {
    if (randomGenerator.random() < mutationProbability) {
        return map(schedule, ({timestamp, doctorId}) =>
            ({timestamp, doctorId: randomGenerator.random() < mutationAggresivity
                    ? getDifferentDoctorId({doctorId, randomGenerator})
                    : doctorId})
        )
    } else {
        return schedule;
    }
};
