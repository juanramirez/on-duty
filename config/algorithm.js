export const elitism = 0.01;
export const generationLimit = 1;
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
// Keys treated as hard constraints (shown as checkboxes, auto-weighted).
export const hardConstraintKeys = ['commonNotConsecutiveWeekdays', 'personalNotAvailableDates', 'personalNotAvailableWeekdays'];

export const evaluatorWeights = {
    avoidBackToBack: 0.009000000000000001,
    freeWeekendsBalance: 0.001,
    isolatedWeekendDaysBalance: 0,
    maxPossibleFreeWeekends: 0.001,
    personalDesiredDutyDates: 0.001,
    personalDesiredFreeDates: 0.002,
    personalDutiesDistribution: 0.001,
    personalNotAvailableDates: 49.5,
    personalNotAvailableWeekdays: 49.5,
    totalDutyDaysBalance: 0.009000000000000001,
    weekendDaysBalance: 0.01
};
