import {doctors} from '../config/doctors.js';
import {notAvailableDates, desiredDutyDates, desiredFreeDates} from '../config/dates.js';
import {dutyDaysOffset} from '../config/offsets.js';

const VALID_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const parseDDMMYYYY = (s) => {
    const m = typeof s === 'string' && s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const [, day, month, year] = m.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCMonth() === month - 1 ? date : null;
};

const validateDoctors = (errors) => {
    if (!Array.isArray(doctors) || doctors.length === 0) {
        errors.push('doctors.js: must contain at least one doctor');
        return;
    }
    const seenIds = new Set();
    doctors.forEach((d, i) => {
        const prefix = `doctors[${i}]`;
        if (!d.id || typeof d.id !== 'string')
            errors.push(`${prefix}: missing required field "id"`);
        else if (seenIds.has(d.id))
            errors.push(`${prefix}: duplicate id "${d.id}"`);
        else
            seenIds.add(d.id);

        if (!d.name || typeof d.name !== 'string')
            errors.push(`${prefix}: missing required field "name"`);

        if (d.notAvailableWeekdays !== undefined) {
            if (!Array.isArray(d.notAvailableWeekdays))
                errors.push(`${prefix}: "notAvailableWeekdays" must be an array`);
            else
                d.notAvailableWeekdays.forEach(w => {
                    if (!VALID_WEEKDAYS.includes(w))
                        errors.push(`${prefix}: invalid weekday "${w}" in notAvailableWeekdays`);
                });
        }

        if (d.backToBackTolerance !== undefined && typeof d.backToBackTolerance !== 'number')
            errors.push(`${prefix}: "backToBackTolerance" must be a number`);
    });
};

const validateDatesSection = (section, sectionName, doctorIds, monthTimestamp, errors) => {
    const monthDate = new Date(monthTimestamp * 1000);
    const expectedYear = monthDate.getUTCFullYear();
    const expectedMonth = monthDate.getUTCMonth();

    Object.entries(section).forEach(([doctorId, dates]) => {
        if (!doctorIds.has(doctorId))
            errors.push(`dates.js (${sectionName}): unknown doctor id "${doctorId}"`);

        if (!Array.isArray(dates)) {
            errors.push(`dates.js (${sectionName}.${doctorId}): must be an array of dates`);
            return;
        }

        dates.forEach(d => {
            const date = parseDDMMYYYY(d);
            if (!date) {
                errors.push(`dates.js (${sectionName}.${doctorId}): invalid date "${d}" (expected format: DD/MM/YYYY)`);
            } else if (date.getUTCFullYear() !== expectedYear || date.getUTCMonth() !== expectedMonth) {
                errors.push(`dates.js (${sectionName}.${doctorId}): date "${d}" does not belong to the target month`);
            }
        });
    });
};

const validateDates = (doctorIds, monthTimestamp, errors) => {
    validateDatesSection(notAvailableDates, 'notAvailableDates', doctorIds, monthTimestamp, errors);
    validateDatesSection(desiredDutyDates, 'desiredDutyDates', doctorIds, monthTimestamp, errors);
    validateDatesSection(desiredFreeDates, 'desiredFreeDates', doctorIds, monthTimestamp, errors);
};

const validateOffsets = (doctorIds, errors) => {
    Object.entries(dutyDaysOffset).forEach(([doctorId, offset]) => {
        if (!doctorIds.has(doctorId))
            errors.push(`offsets.js: unknown doctor id "${doctorId}"`);
        if (typeof offset !== 'number')
            errors.push(`offsets.js: offset for "${doctorId}" must be a number`);
    });
};

export const validateConfig = ({monthTimestamp}) => {
    const errors = [];

    validateDoctors(errors);

    const doctorIds = new Set(doctors.filter(d => d.id).map(d => d.id));
    validateDates(doctorIds, monthTimestamp, errors);
    validateOffsets(doctorIds, errors);

    if (errors.length > 0) {
        console.error('Configuration errors:\n' + errors.map(e => `  - ${e}`).join('\n'));
        process.exit(1);
    }
};
