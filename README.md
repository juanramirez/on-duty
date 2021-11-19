# on-duty-organizer
**on-duty-organizer** (a.k.a. "_DoctorPlan_") is an open-source on-duty schedule organizer for hospital services I made using NodeJS. I started it in 2017, when I saw that on-duty days organization consumed my wife (and also the rest of the doctors of the paediatric service in the hospital) a lot of time, energy and discussions. I thought that this problem was ideal to be solved using [evolutionary algorithms](https://en.wikipedia.org/wiki/Evolutionary_algorithm), which had strongly called my attention when I studied them in the career. Hence, _DoctorPlan_ takes into account doctor preferences, mandatory medical consultations and similar factors to organize on-duty days assignation for a hospital service using evolutionary algorithms, and generates the best solution it can.

Theoretically, a similar approach could be used to organize on-duty days in any kind of professional service which require someone to be always on-duty.

This repo has the code corresponding to the command-line version of _DoctorPlan_. Parallely, I'm also trying to build a client-server application around this, which I expect to have desktop and mobile versions if possible.

## How to use it
In the *config* directory you have some JS files. There are some data there, wrote as example.

### General algorithm configuration (algorithm.js)
_DoctorPlan_ uses the [Genetical](https://github.com/rubenjgarcia/genetical) library. Hence, the algorithm parameters are the same than the ones used by that library. They are very well explained in the [Genetical library documentation](https://github.com/rubenjgarcia/genetical#usage). The default ones in this repo work generally well for me, but may not work for your case and, of course, can be changed.

### Doctor configuration (doctors.js)
There you have an array with the doctors of the service. Every doctor has an `id`, a `name`, an array of `notAvailableWeekdays` (optional), and a number that represents the `doubletsTolerance` (optional as well, default is `1` -which means a high tolerance to on-duty days-). I'll try to explain what those fields mean:

#### id
It's an internal string which will represent a doctor. Doesn't have to be human-readable.

#### name
The human-readable full name of the doctor.

#### notAvailableWeekdays
An array which represents the weekdays that the doctor cannot be on-duty, for any kind of reason. I use this, for example, to exclude the weekday previous to the day that the doctor has consultancy, but can also be used for some other kind of weekday exclusion. For instance, if a doctor cannot have on-duty from Mondays to Fridays, for some other kind of reason.

#### doubletsTolerance
I call _doublet_ to a pair of consecutive on-duty days, separated by a day _not on-duty_. For instance, having Wednesday and Friday on-duty. Working a _doublet_ is hard, but there are times that _doublets_ are needed to fulfill other parameters better; however, there are people that, for some personal circumstances, have less tolerance than others to have _doublets_. I introduced this parameter to be able to apply some _restrictions_ (or at least _preferences_) when assigning _doublets_ to some doctors. This field is expected to be a _float_ that can go from `0` (no tolerance to _doublets_ at all) to `1` (high tolerance to doublets).
