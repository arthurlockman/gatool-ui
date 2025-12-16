import localforage from "localforage";
import { useState, useEffect } from "react";

export const usePersistentState = (key, defaultValue) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        async function load() {
            const saved = await localforage.getItem(key);
            if (saved !== null) {
                try {
                    const initial = JSON.parse(saved);
                    // Check for null/undefined explicitly to preserve false, 0, empty string, etc.
                    setValue(initial !== null && initial !== undefined ? initial : defaultValue);
                } catch (e) {
                    // If parsing fails, use default value
                    setValue(defaultValue);
                }
            } else {
                setValue(defaultValue);
            }
        }
        load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        localforage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};
