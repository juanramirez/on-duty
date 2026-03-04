/*
  Test: validateConfig.test.js
  Purpose: Minimal Jest tests to validate that config/doctors.js and config/dates.js
  load correctly and have a reasonable structure.

  How to use:
  1. Install Jest as a dev dependency:
     npm install --save-dev jest

  2. Add a test script to package.json:
     "scripts": {
       "test": "jest --runInBand"
     }

  3. Run tests:
     npm test

  The tests are intentionally defensive: they don't assume a strict shape for your
  config files, but they check for common properties and some cross-consistency
  where possible.
*/

const path = require('path');

function tryRequire(relPath) {
  const p = path.resolve(__dirname, '..', relPath);
  // require may throw if file has syntax errors or other problems
  return require(p);
}

function isValidDateString(s) {
  if (typeof s !== 'string') return false;
  // Support DD/MM/YYYY (used in config) in addition to ISO strings
  const ddmmyyyy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy.map(Number);
    const t = Date.UTC(year, month - 1, day);
    return !Number.isNaN(t) && new Date(t).getUTCMonth() === month - 1;
  }
  return !Number.isNaN(Date.parse(s));
}

describe('Config files: doctors and dates', () => {
  let doctorsRaw;
  let datesRaw;

  test('doctors.js loads without throwing and is an array', () => {
    expect(() => {
      doctorsRaw = tryRequire('config/doctors.js');
    }).not.toThrow();

    // allow module.exports = { doctors: [...] } or directly an array
    const doctors = Array.isArray(doctorsRaw) ? doctorsRaw : (doctorsRaw && doctorsRaw.doctors) ? doctorsRaw.doctors : null;
    expect(Array.isArray(doctors)).toBe(true);
    expect(doctors.length).toBeGreaterThan(0);

    // save for other tests
    doctorsRaw = doctors;
  });

  test('every doctor is an object and has at least an id or name (string)', () => {
    const doctors = doctorsRaw;
    doctors.forEach((d, idx) => {
      expect(typeof d).toBe('object');
      // check common identifier keys
      const id = d && (d.id || d.name || d.nombre || d.key);
      expect(typeof id === 'string' && id.length > 0).toBe(true);
    });

    // uniqueness: collect id/name
    const ids = doctors.map(d => (d.id || d.name || d.nombre || d.key));
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('dates.js loads and has a reasonable structure', () => {
    expect(() => {
      datesRaw = tryRequire('config/dates.js');
    }).not.toThrow();

    // dates.js exports sections (e.g. notAvailableDates, desiredDutyDates, desiredFreeDates)
    // each is an object mapping doctorId -> array of date strings
    expect(typeof datesRaw).toBe('object');
    expect(Object.keys(datesRaw).length).toBeGreaterThan(0);

    Object.values(datesRaw).forEach(byDoctor => {
      expect(typeof byDoctor).toBe('object');
      Object.values(byDoctor).forEach(dates => {
        expect(Array.isArray(dates)).toBe(true);
        dates.forEach(d => expect(isValidDateString(d)).toBe(true));
      });
    });
  });

  test('if dates reference doctors, those references refer to known doctors', () => {
    // This test is permissive: it only runs checks when it detects obvious
    // references inside the dates structure (properties named like assigned, doctor, doctors, notAvailable)
    const doctors = doctorsRaw;
    const doctorIds = new Set(doctors.map(d => (d.id || d.name || d.nombre || d.key)));

    const checkRef = (val) => {
      if (typeof val === 'string') {
        // if matches a doctor id/name, fine; if looks like a name/id but not found, fail
        // Heuristic: if string length <= 40 and contains a letter, consider it potentially a reference
        if (/\w/.test(val) && val.length <= 40) {
          if (doctorIds.has(val)) return true; // ok
          // if not present, we don't necessarily fail because it may be a free text reason
          // but record as a potential mismatch (we'll fail only if we are confident)
          return false;
        }
      }
      return null; // no opinion
    };

    // traverse datesRaw and collect any detected references
    const mismatches = [];
    const visit = (node) => {
      if (Array.isArray(node)) {
        node.forEach(visit);
      } else if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) {
          const low = k.toLowerCase();
          if (['doctor','doctors','assigned','assignedto','notavailable','not_available','who','name','id'].includes(low)) {
            const val = node[k];
            if (Array.isArray(val)) {
              val.forEach(v => {
                const r = checkRef(v);
                if (r === false) mismatches.push(v);
              });
            } else {
              const r = checkRef(val);
              if (r === false) mismatches.push(val);
            }
          }
          visit(node[k]);
        }
      }
    };

    visit(datesRaw);

    // If we found clear mismatches, fail the test with a helpful message.
    if (mismatches.length > 0) {
      fail('Found references in dates config that do not match any doctor id/name: ' + JSON.stringify(mismatches));
    }
  });
});
