import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Reads and writes a single key in the URL search params.
 * Returns [value, setter] similar to useState.
 */
export function useSearchParamState(
  key: string,
  defaultValue = "",
): [string, (value: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next && next !== defaultValue) {
            params.set(key, next);
          } else {
            params.delete(key);
          }
          return params;
        },
        { replace: true },
      );
    },
    [key, defaultValue, setSearchParams],
  );

  return [value, setValue];
}
