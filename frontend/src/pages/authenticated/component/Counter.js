import { useEffect, useState } from "react";

const Counter = ({ target, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(target, 10);
        if (start === end) return;

        let incrementTime = Math.abs(Math.floor(duration / end));

        let timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [target, duration]);

    return <span>{count.toLocaleString()}</span>;
};

export default Counter;
