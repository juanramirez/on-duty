const doctors = [
    {
        id: 'john',
        name: 'John C. Jackson',
        notAvailableWeekdays: ['Mon'],
        backToBackTolerance: 0
    },
    {
        id: 'nancy',
        name: 'Nancy Norton',
        notAvailableWeekdays: ['Tue']
    },
    {
        id: 'george',
        name: 'George Garfield',
        notAvailableWeekdays: ['Thu'],
        backToBackTolerance: 0
    },
    {
        id: 'bobbie',
        name: 'Barbara Bentley',
        notAvailableWeekdays: ['Mon', 'Wed']
    }
];

module.exports = { doctors };
