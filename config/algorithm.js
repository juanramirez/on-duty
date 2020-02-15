export const elitism = 0.05;
export const generationLimit = 100;
export const mutationProbability = 0.5;
export const mutationAggresivity = 0.5;
export const populationSize = 1000;
export const stopScore = 100;
export const islandOptions = {
    islands: 3,
    migration: 0.1,
    epoch: 10
};

export const evaluatorWeights = {
    commonNotConsecutiveWeekdays: 31.99,
    personalNotAvailableWeekdays: 31.99,
    personalNotAvailableDates: 31.99,
    avoidDoublets: 3.199,
    personalDesiredDutyDates: 0.319,
    personalDutiesDistribution: 0.16,
    totalDutyDaysBalance: 0.096,
    personalDesiredFreeDates: 0.096,
    commonDesiredFreeWeekdaysBalance: 0.096,
    commonIsolatedDesiredFreeWeekdaysBalance: 0.064
};
