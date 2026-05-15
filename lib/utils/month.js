export const parseMonth = ({month}) => {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        throw new Error('Month must use YYYY-MM format');
    }

    const [year, monthIndex] = month.split('-').map(Number);
    if (monthIndex < 1 || monthIndex > 12) {
        throw new Error('Month must use YYYY-MM format');
    }

    return Math.floor(new Date(Date.UTC(year, monthIndex - 1, 1)) / 1000);
};

