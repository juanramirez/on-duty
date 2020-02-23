export const elitism = 0.01;
export const generationLimit = 1000;
export const mutationProbability = 0.5;
export const mutationAggresivity = 0.5;
export const populationSize = 1000;
export const stopScore = 100;
export const tournamentSelectionRatio = 0.65;
export const islandOptions = {
    islands: 3,
    migration: 0.1,
    epoch: 20
};

export const offsetRatio = 0.75;

export const evaluatorWeights = {
    commonNotConsecutiveWeekdays: 32.137,
    personalNotAvailableWeekdays: 32.137,
    personalNotAvailableDates: 32.137,
    avoidDoublets: 1.339,
    personalDesiredDutyDates: 0.134,
    personalDutiesDistribution: 0.134,
    totalDutyDaysBalance: 1.339,
    personalDesiredFreeDates: 0.268,
    weekendDaysBalance: 0.107,
    freeWeekendsBalance: 0.08,
    isolatedWeekendDaysBalance: 0.054,
    maxPossibleFreeWeekends: 0.134
};
