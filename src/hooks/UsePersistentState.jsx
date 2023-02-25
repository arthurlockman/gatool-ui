import localforage from "localforage";
import { useState, useEffect } from "react";

export const usePersistentState = (key, defaultValue) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        async function load() {
            const saved = await localforage.getItem(key);
            const initial = JSON.parse(saved);
            setValue(initial || defaultValue);
        }
        load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        localforage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};
