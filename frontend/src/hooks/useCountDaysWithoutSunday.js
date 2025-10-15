import dayjs from 'dayjs';

const useCountDaysWithoutSunday = () => {
    const countDays = (fromDate, toDate) => {
        const from = dayjs(fromDate);
        const to = dayjs(toDate);
        let count = 0;

        for (let date = from; date.isBefore(to) || date.isSame(to); date = date.add(1, 'day')) {
            if (date.day() !== 0) {
                count++;
            }
        }

        return count;
    };

    return { countDays };
};

export default useCountDaysWithoutSunday;