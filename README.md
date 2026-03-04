### <img src="https://juanramirez.github.io/assets/images/projects/doctorplan/logo-dark.png" alt="DoctorPlan" width="200"/>

# On-duty-organizer
**On-duty-organizer** (a.k.a. "_DoctorPlan_") is an open-source on-duty schedule organizer for hospital services built with NodeJS. It was started in 2017 to reduce the time, energy and discussions that on-duty scheduling consumed in a paediatric hospital service. _DoctorPlan_ takes into account doctor preferences, availability constraints and fairness criteria to generate optimal on-duty schedules using [evolutionary algorithms](https://en.wikipedia.org/wiki/Evolutionary_algorithm).

Theoretically, a similar approach could be used to organize on-duty days in any kind of professional service which requires someone to always be on-duty.

## Installation

```bash
yarn install
```

## Usage

```bash
yarn start -- --month YYYY-MM
```

For example, to generate the schedule for March 2024:

```bash
yarn start -- --month 2024-03
```

## Running tests

```bash
yarn test
```

## Configuration

In the `config` directory you have several JS files. Example data is provided in all of them.

### General algorithm configuration (algorithm.js)

_DoctorPlan_ uses the [Genetical](https://github.com/juanramirez/genetical) library. The algorithm parameters are documented in the [Genetical library documentation](https://github.com/rubenjgarcia/genetical#usage). The default values work well in general, but can be adjusted for your specific case.

The `evaluatorWeights` object controls how much each scheduling criterion influences the final score. Each evaluator returns a value between 0 and 1, and the weights define their relative importance. See the comments in `algorithm.js` for a full explanation of each evaluator and its weight tier.

### Doctor configuration (doctors.js)

An array of doctors for the service. Each doctor has the following fields:

#### id
An internal string identifier for the doctor. Does not need to be human-readable.

#### name
The human-readable full name of the doctor.

#### notAvailableWeekdays
An optional array of workdays (Mon–Fri) on which the doctor cannot be on-duty. Useful, for example, to exclude the workday before the doctor's regular consultation day.

#### backToBackTolerance
We call _back-to-back_ two on-duty days with one day off or less in between (for instance, Wednesday and Friday, or Tuesday and Wednesday). Back-to-back duties are demanding, but sometimes needed to satisfy other constraints. This optional float ranges from `0` (no tolerance for back-to-back duties) to `1` (high tolerance, which is the default).

### Dates configuration (dates.js)

This is typically the only file you need to update each month. All dates use **DD/MM/YYYY** format. It exports the following objects, all keyed by doctor id:

#### notAvailableDates
Dates that the algorithm will **never** assign to that doctor (e.g. force majeure: illness, a wedding, an unavoidable commitment).

#### desiredDutyDates
Dates that the algorithm will **try to assign** to that doctor.

#### desiredFreeDates
Dates that the algorithm will **try to keep free** for that doctor (e.g. a birthday or a personal preference). Unlike `notAvailableDates`, these are soft preferences and may be overridden if needed.

### Weekday constraints configuration (weekdays.js)

Defines which pairs of days are considered consecutive for scheduling purposes (e.g. Friday and Saturday), and which days count as weekend days. This usually does not need to be changed.

### Duty day offsets configuration (offsets.js)

Allows adjusting the expected number of duty days for specific doctors. A positive offset means the algorithm will aim to assign that doctor slightly more duties than the average. Useful to account for part-time arrangements or historical imbalances.
