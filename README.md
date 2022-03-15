### <img src="https://juanramirez.github.io/assets/images/projects/doctorplan/logo-dark.png" alt="DoctorPlan" width="200"/>

# On-duty-organizer
**On-duty-organizer** (a.k.a. "_DoctorPlan_") is an open-source on-duty schedule organizer for hospital services I made using NodeJS. I started it in 2017, when I saw that on-duty days organization consumed my wife (and also the rest of the doctors of the paediatric service in the hospital) a lot of time, energy and discussions. I thought that this problem was ideal to be solved using [evolutionary algorithms](https://en.wikipedia.org/wiki/Evolutionary_algorithm), which had strongly called my attention when I studied them in the career. Hence, _DoctorPlan_ takes into account doctor preferences, mandatory medical consultations and similar factors to organize on-duty days assignation for a hospital service using evolutionary algorithms, and generates the best solution it can.

Theoretically, a similar approach could be used to organize on-duty days in any kind of professional service which require someone to be always on-duty.

This repo has the code corresponding to the command-line version of _DoctorPlan_. Parallely, I'm also trying to build a client-server application around this, which I expect to have desktop and mobile versions if possible.

## How to use it
In the *config* directory you have some JS files. There is some data there, wrote as example.

### General algorithm configuration (algorithm.js)
_DoctorPlan_ uses the [Genetical](https://github.com/rubenjgarcia/genetical) library. Hence, the algorithm parameters are the same than the ones used by that library. They are very well explained in the [Genetical library documentation](https://github.com/rubenjgarcia/genetical#usage). The default values on this repo (I mean the _on-duty_ repo, not the _Genetical_ one) work generally well for me, but may not work for your case and, of course, you can change them to fit your needs ;)

### Doctor configuration (doctors.js)
There you have an array with the doctors of the service. Every doctor has an `id`, a `name`, an array of `notAvailableWeekdays` (optional), and a number that represents the `doubletsTolerance` (optional as well, default is `1` -which means a high tolerance to on-duty days-). I'll try to explain what those fields mean:

#### id
It's an internal string which will represent a doctor. Doesn't have to be human-readable.

#### name
The human-readable full name of the doctor.

#### notAvailableWeekdays
An array which represents the weekdays that the doctor cannot be on-duty, for any kind of reason. We use this, for example, to exclude the weekday previous to the doctor's consultancy weekday, but it can also be used for some other kind of weekday exclusion. For instance, if a doctor cannot be on-duty from Mondays to Wednesdays, for some other kind of reason.

#### doubletsTolerance
We call _doublet_ to a pair of consecutive on-duty days, separated by a day _not on-duty_ (for instance, having Wednesday and Friday on-duty). Working a _doublet_ is hard, but there are times that _doublets_ are needed to fulfill other parameters better; however, there are people that, for some personal circumstances, have less tolerance than others to have _doublets_. I introduced this parameter to be able to apply some _restrictions_ (or at least _preferences_) when assigning _doublets_ to some doctors. This field is expected to be a _float_ that can go from `0` (no tolerance to _doublets_ at all) to `1` (high tolerance to doublets, which is the default).

### Dates configuration (dates.js)
Generally, it will be the only config you'll have to change every month. It will export these constants:

#### notAvailableDates
An object whose keys are the doctors' ids. Each doctor id will be associated with an array of dates in DD/MM/YYYY format representing the dates that the algorithm will avoid (in all cases) assigning to that doctor.

#### desiredDutyDates
An object whose keys are the doctors' ids. Each doctor id will be associated with an array of dates in DD/MM/YYYY format representing the dates that the algorithm will try to assign to that doctor.

#### desiredFreeDates
An object whose keys are the doctors' ids. Each doctor id will be associated with an array of dates in DD/MM/YYYY format representing the dates that the algorithm will try to avoid assigning to that doctor.

*Note*: It's important understanding the difference between the `notAvailableDates` and the `desiredFreeDates` objects. In the former case, the dates won't be able to be assigned on-duty for the doctors. The former are generally _force majeure_ reasons; the latter are dates which doctors doesn't like to be assigned just because they don't like to work that date. For instance, if a doctor cannot work some day because he's going to get married, this date would be in `notAvailableDates`. If a doctor wants to have a free day just because it's her birthday, that date would be in `desiredFreeDates`.
