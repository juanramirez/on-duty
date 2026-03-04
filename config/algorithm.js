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

// Evaluator weights control how much each criterion influences the final fitness score.
// All evaluators return a value between 0 and 1; the final score is their weighted sum.
//
// Weight tiers:
//   ~32  → hard constraints: violations make the schedule unacceptable
//   ~1   → important soft constraints: strongly preferred but not mandatory
//   ~0.1 → fairness preferences: nice to have, used to break ties
//
// To prioritise a criterion, increase its weight relative to the others.
// To disable a criterion entirely, set its weight to 0.
export const evaluatorWeights = {
    // Hard constraints (~32): schedules that violate these are effectively discarded
    commonNotConsecutiveWeekdays: 32.137,  // no doctor on duty on two days configured as consecutive (e.g. Fri and Sat)
    personalNotAvailableWeekdays: 32.137,  // no doctor on their recurring unavailable workday (Mon–Fri)
    personalNotAvailableDates: 32.137,     // no doctor on their explicitly unavailable dates

    // Important soft constraints (~1): strongly influence the result
    avoidBackToBack: 1.339,                 // avoid two duties with one day off or less in between, per doctor tolerance
    totalDutyDaysBalance: 1.339,           // balance total duty days across all doctors (accounting for offsets)

    // Fairness preferences (~0.1): used to optimise among otherwise equivalent schedules
    personalDesiredFreeDates: 0.268,       // respect doctors' preferred days off
    personalDesiredDutyDates: 0.134,       // assign doctors their preferred duty dates when possible
    personalDutiesDistribution: 0.134,     // spread each doctor's duties evenly across the month
    maxPossibleFreeWeekends: 0.134,        // maximise the average number of free weekends per doctor
    weekendDaysBalance: 0.107,             // balance total weekend days assigned across doctors
    freeWeekendsBalance: 0.08,             // balance the number of free weekends across doctors
    isolatedWeekendDaysBalance: 0.054,     // balance isolated (single-day) weekend duties across doctors
};
