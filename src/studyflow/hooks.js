import { useState, useEffect } from 'react';

export function useOnScreen(ref, rootMargin = '0px') {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIntersecting(true);
                    observer.disconnect();
                }
            },
            { rootMargin, threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref, rootMargin]);
    return isIntersecting;
}

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });
    const setValue = (value) => {
        try {
            const val = typeof value === 'function' ? value(storedValue) : value;
            setStoredValue(val);
            window.localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error(e);
        }
    };
    return [storedValue, setValue];
}
