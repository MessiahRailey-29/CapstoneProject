// hooks/useTabTransition.ts
import { useDeferredValue, useState, useEffect, useTransition } from 'react';

export function useTabTransition<T>(value: T, delayMs: number = 0) {
  const [isPending, startTransition] = useTransition();
  const [deferredValue, setDeferredValue] = useState(value);

  useEffect(() => {
    // Keep old content visible during transition
    startTransition(() => {
      if (delayMs > 0) {
        setTimeout(() => {
          setDeferredValue(value);
        }, delayMs);
      } else {
        setDeferredValue(value);
      }
    });
  }, [value, delayMs]);

  return { deferredValue, isPending };
}

// Usage in tab screens:
// const { deferredValue: deferredData, isPending } = useTabTransition(data, 100);
// Render deferredData instead of data to prevent flash