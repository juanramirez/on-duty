import _ from 'lodash';

export const cross = ({a, b, randomGenerator}) => {
    const crossPosition = Math.floor(randomGenerator.random() * b.length);
    return _.concat(_.take(a, crossPosition), _.takeRight(b, b.length - crossPosition));
};
