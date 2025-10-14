import { format, parseISO } from 'date-fns';

const useDateFormat = () => {
    const formatDateToReadable = (date, showTime = false) => {
        if (!date) return "";
        
        try {
            return format(
                parseISO(date),
                `MMMM d, yyyy${showTime ? ' hh:mm a' : ''}`
            );
        } catch {
            return date;
        }
    };

    const calculateAge = (date) => {
        if (!date) return "";
        
        const birthDate = new Date(date);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    return { formatDateToReadable, calculateAge };
}

export default useDateFormat