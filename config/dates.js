// All dates use DD/MM/YYYY format

const notAvailableDates = {
    nancy: [
        '01/02/2020'
    ],
    george: [
        '18/02/2020',
        '22/02/2020',
        '28/02/2020'
    ]
};

const desiredDutyDates = {
    john: [
        '28/02/2020'
    ],
    nancy: [
        '02/02/2020',
        '08/02/2020',
        '14/02/2020',
        '20/02/2020',
        '26/02/2020'
    ],
    george: [
        '29/02/2020'
    ]
};

const desiredFreeDates = {
    john: [
        '01/02/2020'
    ]
};

module.exports = { notAvailableDates, desiredDutyDates, desiredFreeDates };

