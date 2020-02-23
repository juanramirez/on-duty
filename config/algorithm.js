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

export const offsetRatio = 0.75;

export const evaluatorWeights = {
    commonNotConsecutiveWeekdays: 31.969,
    personalNotAvailableWeekdays: 31.969,
    personalNotAvailableDates: 31.969,
    avoidDoublets: 3.197,
    personalDesiredDutyDates: 0.32,
    personalDutiesDistribution: 0.16,
    totalDutyDaysBalance: 0.096,
    personalDesiredFreeDates: 0.096,
    weekendDaysBalance: 0.096,
    isolatedWeekendDaysBalance: 0.064,
    maxPossibleFreeWeekends: 0.064
};
