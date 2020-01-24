import MersenneTwister from 'mersenne-twister';
import { createSchedule } from './schedule/random-factory';

const monthTimestamp = 1580515200; // February 1st GMT
const randomGenerator = new MersenneTwister();

export const run = () =>
    console.log(createSchedule({ monthTimestamp, randomGenerator }));
