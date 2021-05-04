import { renderHook } from "@testing-library/react-hooks";
import { useEffectTimeout } from "../src/useEffectTimeout";

jest.useFakeTimers();

test("useUpdateEffectTimeout without timeout argument.", () => {
  let effectCount = 0;

  const { rerender } = renderHook(
    ({ count }: { count: number }) => {
      useEffectTimeout(() => {
        effectCount++;
      }, [count]);
    },
    { initialProps: { count: 0 } },
  );

  jest.advanceTimersByTime(1000);

  expect(effectCount).toEqual(1);

  rerender({ count: 1 });

  expect(effectCount).toEqual(1);

  jest.advanceTimersByTime(1000);

  expect(effectCount).toEqual(2);
});

test("useUpdateEffectTimeout with timeout argument.", () => {
  let effectCount = 0;

  const { rerender } = renderHook(
    ({ count }: { count: number }) => {
      useEffectTimeout(
        () => {
          effectCount++;
        },
        [count],
        2000,
      );
    },
    { initialProps: { count: 0 } },
  );

  jest.advanceTimersByTime(2000);

  expect(effectCount).toEqual(1);

  rerender({ count: 1 });

  expect(effectCount).toEqual(1);

  jest.advanceTimersByTime(2000);

  expect(effectCount).toEqual(2);
});
