import {concat, take, takeRight} from 'lodash';

export const cross = ({a, b, randomGenerator}) => {
    const crossPosition = Math.floor(randomGenerator.random() * b.length);
    return concat(take(a, crossPosition), takeRight(b, b.length - crossPosition));
};
