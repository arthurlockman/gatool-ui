import { useState, useEffect } from "react";

export const usePersistentState = (key, defaultValue) => {
    const [value, setValue] = useState(() => {
        const saved = localStorage.getItem(key);
        const initial = JSON.parse(saved);
        return initial || defaultValue;
    });

    useEffect(() => {
        // storing input name
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};
