import minimist from 'minimist';
import {run} from "./runner";

const args = minimist(process.argv.slice(2));
const month = args.month || args.m;

if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    console.error('Usage: npm start -- --month YYYY-MM  (e.g. --month 2024-03)');
    process.exit(1);
}

const [year, monthIndex] = month.split('-').map(Number);
const monthTimestamp = Math.floor(new Date(Date.UTC(year, monthIndex - 1, 1)) / 1000);

run({monthTimestamp});
