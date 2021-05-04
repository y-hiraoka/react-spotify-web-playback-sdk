import { useEffect } from "react";

export function useEffectTimeout(
  effect: React.EffectCallback,
  deps: React.DependencyList,
  timeout: number = 1000,
) {
  useEffect(() => {
    const timeoutId = setTimeout(effect, timeout);

    return () => clearTimeout(timeoutId);
  }, deps);
}
