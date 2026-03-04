import {doctors} from '../config/doctors';
import {notAvailableDates, desiredDutyDates, desiredFreeDates} from '../config/dates';
import {dutyDaysOffset} from '../config/offsets';

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
        errors.push('doctors.js: debe contener al menos un médico');
        return;
    }
    const seenIds = new Set();
    doctors.forEach((d, i) => {
        const prefix = `doctors[${i}]`;
        if (!d.id || typeof d.id !== 'string')
            errors.push(`${prefix}: falta el campo "id"`);
        else if (seenIds.has(d.id))
            errors.push(`${prefix}: id duplicado "${d.id}"`);
        else
            seenIds.add(d.id);

        if (!d.name || typeof d.name !== 'string')
            errors.push(`${prefix}: falta el campo "name"`);

        if (d.notAvailableWeekdays !== undefined) {
            if (!Array.isArray(d.notAvailableWeekdays))
                errors.push(`${prefix}: "notAvailableWeekdays" debe ser un array`);
            else
                d.notAvailableWeekdays.forEach(w => {
                    if (!VALID_WEEKDAYS.includes(w))
                        errors.push(`${prefix}: día no válido "${w}" en notAvailableWeekdays`);
                });
        }

        if (d.doubletsTolerance !== undefined && typeof d.doubletsTolerance !== 'number')
            errors.push(`${prefix}: "doubletsTolerance" debe ser un número`);
    });
};

const validateDatesSection = (section, sectionName, doctorIds, monthTimestamp, errors) => {
    const monthDate = new Date(monthTimestamp * 1000);
    const expectedYear = monthDate.getUTCFullYear();
    const expectedMonth = monthDate.getUTCMonth();

    Object.entries(section).forEach(([doctorId, dates]) => {
        if (!doctorIds.has(doctorId))
            errors.push(`dates.js (${sectionName}): id de médico desconocido "${doctorId}"`);

        if (!Array.isArray(dates)) {
            errors.push(`dates.js (${sectionName}.${doctorId}): debe ser un array de fechas`);
            return;
        }

        dates.forEach(d => {
            const date = parseDDMMYYYY(d);
            if (!date) {
                errors.push(`dates.js (${sectionName}.${doctorId}): fecha no válida "${d}" (formato esperado: DD/MM/YYYY)`);
            } else if (date.getUTCFullYear() !== expectedYear || date.getUTCMonth() !== expectedMonth) {
                errors.push(`dates.js (${sectionName}.${doctorId}): la fecha "${d}" no pertenece al mes indicado`);
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
            errors.push(`offsets.js: id de médico desconocido "${doctorId}"`);
        if (typeof offset !== 'number')
            errors.push(`offsets.js: el offset de "${doctorId}" debe ser un número`);
    });
};

export const validateConfig = ({monthTimestamp}) => {
    const errors = [];

    validateDoctors(errors);

    const doctorIds = new Set(doctors.filter(d => d.id).map(d => d.id));
    validateDates(doctorIds, monthTimestamp, errors);
    validateOffsets(doctorIds, errors);

    if (errors.length > 0) {
        console.error('Errores de configuración:\n' + errors.map(e => `  - ${e}`).join('\n'));
        process.exit(1);
    }
};
