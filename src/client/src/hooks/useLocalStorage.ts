import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for managing localStorage with React state
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get stored value or use initial
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Dispatch event for cross-tab synchronization
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, value: valueToStore },
          })
        );
      } catch (error) {
        console.error(`Error saving localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        if (e.key === key && e.newValue) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.error(
              `Error parsing storage change for key "${key}":`,
              error
            );
          }
        }
      } else {
        const detail = (e as CustomEvent).detail;
        if (detail.key === key) {
          setStoredValue(detail.value);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener(
      'local-storage',
      handleStorageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange as EventListener
      );
      window.removeEventListener(
        'local-storage',
        handleStorageChange as EventListener
      );
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing sessionStorage
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error saving sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
