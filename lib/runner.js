import MersenneTwister from 'mersenne-twister';
import { createSchedule } from './schedule/random-factory';
import {fitness} from "./evaluators/common-not-consecutive-weekdays";

const monthTimestamp = 1580515200; // February 1st GMT
const randomGenerator = new MersenneTwister();

export const run = () => {
    const schedule = createSchedule({monthTimestamp, randomGenerator});
    console.log(schedule, fitness({schedule}));
};
