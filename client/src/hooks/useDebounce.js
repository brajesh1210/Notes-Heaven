import { useEffect, useState } from 'react';

/** Debounces a value (used by the search input) */
export const useDebounce = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
