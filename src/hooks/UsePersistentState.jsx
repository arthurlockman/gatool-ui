import localforage from "localforage";
import { useState, useEffect } from "react";

export const usePersistentState = (key, defaultValue) => {
    const [value, setValue] = useState(defaultValue);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(false);
        let cancelled = false;
        async function load() {
            try {
                const saved = await localforage.getItem(key);
                if (cancelled) return;
                if (saved !== null) {
                    try {
                        const initial = JSON.parse(saved);
                        // Check for null/undefined explicitly to preserve false, 0, empty string, etc.
                        setValue(
                            initial !== null && initial !== undefined ? initial : defaultValue
                        );
                    } catch (e) {
                        // If parsing fails, use default value
                        setValue(defaultValue);
                    }
                }
            } finally {
                if (!cancelled) {
                    setHydrated(true);
                }
            }
        }
        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    useEffect(() => {
        if (!hydrated) return;
        localforage.setItem(key, JSON.stringify(value));
    }, [key, value, hydrated]);

    return [value, setValue];
};
