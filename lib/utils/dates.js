import {getUnixTime, parse} from 'date-fns';

export const parseFormattedDate = (formattedDate) => getUnixTime(
    parse(formattedDate, 'dd/MM/yyyy', new Date())
);
