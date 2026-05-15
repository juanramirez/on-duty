export const elitism = 0.01;
export const generationLimit = 2;
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

// Evaluator weights control how much each criterion influences the final fitness score.
// Higher values make a criterion more important; set a weight to 0 to disable it.
export const evaluatorWeights = {
    avoidBackToBack: 1.339,
    commonNotConsecutiveWeekdays: 33,
    freeWeekendsBalance: 0.08,
    isolatedWeekendDaysBalance: 0.054,
    maxPossibleFreeWeekends: 0.134,
    personalDesiredDutyDates: 0.134,
    personalDesiredFreeDates: 0.268,
    personalDutiesDistribution: 0.134,
    personalNotAvailableDates: 33,
    personalNotAvailableWeekdays: 33,
    totalDutyDaysBalance: 1.339,
    weekendDaysBalance: 0.107
};
