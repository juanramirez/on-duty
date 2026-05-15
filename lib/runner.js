import {generationLimit} from "../config/algorithm.js";
import {scheduleReport} from "./utils/schedule.js";
import {generateSchedule, totalInitialIndividuals} from "./scheduler.js";

const BAR_WIDTH = 30;

const renderBar = ({label, current, total, extra = ''}) => {
    const pct = Math.min(current / total, 1);
    const filled = Math.round(pct * BAR_WIDTH);
    const bar = '='.repeat(filled) + (filled < BAR_WIDTH ? '>' : '') + ' '.repeat(Math.max(0, BAR_WIDTH - filled - 1));
    const cur = String(current).padStart(String(total).length);
    process.stdout.write('\x1b[2K\r[' + bar + '] ' + label + ' ' + cur + '/' + total + extra);
};

export const run = ({monthTimestamp}) => {
    let lastBestScore = null;

    return generateSchedule({
        monthTimestamp,
        onInitProgress: ({current}) => {
            renderBar({label: 'Init', current, total: totalInitialIndividuals()});
        },
        onStats: stats => {
            const improved = stats.bestScore !== lastBestScore;
            const delta = improved && lastBestScore !== null
                ? ' \x1b[32m+' + (stats.bestScore - lastBestScore).toFixed(2) + '\x1b[0m'
                : '';
            renderBar({
                label: 'Gen',
                current: stats.generation,
                total: generationLimit,
                extra: ' | best: ' + stats.bestScore.toFixed(2) + delta + ' | mean: ' + stats.mean.toFixed(2)
            });
            if (improved) lastBestScore = stats.bestScore;
        }
    })
        .then(({schedule}) => {
            process.stdout.write('\n');
            console.log('Best candidate: \n' + scheduleReport({schedule}));
        })
        .catch((err) => {
            console.error('Genetic algorithm error:', err.message);
            process.exit(1);
        });
};
