import minimist from 'minimist';
import {validateConfig} from "./validate-config.js";
import {run} from "./runner.js";
import {parseMonth} from "./utils/month.js";

const args = minimist(process.argv.slice(2));
const month = args.month || args.m;

if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    console.error('Usage: npm start -- --month YYYY-MM  (e.g. --month 2024-03)');
    process.exit(1);
}

let monthTimestamp;

try {
    monthTimestamp = parseMonth({month});
} catch (err) {
    console.error('Usage: npm start -- --month YYYY-MM  (e.g. --month 2024-03)');
    process.exit(1);
}

validateConfig({monthTimestamp});
run({monthTimestamp});
