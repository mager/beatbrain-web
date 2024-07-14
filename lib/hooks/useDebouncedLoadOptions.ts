import { useRef, useCallback } from "react";

const useDebouncedLoadOptions = (loadOptions, delay = 200) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedLoadOptions = useCallback(
    (inputValue, callback) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        const options = await loadOptions(inputValue);
        callback(options);
      }, delay);
    },
    [loadOptions, delay]
  );

  return debouncedLoadOptions;
};

export default useDebouncedLoadOptions;
