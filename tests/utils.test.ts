import { describe, test, expect } from "vitest";
import { isRef, ref, unref } from "vue";

import { unrefs, useReducer } from "../src/utils";

describe("unrefs", () => {
  test("should be defined", () => {
    expect(unrefs).toBeDefined();
  });

  test("returns", () => {
    const v1 = ref(1);
    const v2 = ref(2);
    const ref_arr = [v1, v2];
    const num_arr = [1, 2];

    expect(ref_arr.every((i) => isRef(i))).toBeTruthy();
    expect(unrefs(ref_arr).every((i) => isRef(i))).toBeFalsy();
    expect(unrefs(ref_arr)).toStrictEqual(num_arr);
  });

  test("empty", () => {
    expect(unrefs(undefined as any)).toStrictEqual([]);
    expect(unrefs({} as any)).toStrictEqual([]);
    expect(unrefs([])).toStrictEqual([]);
  });
});

describe("useReducer", () => {
  test("should be defined", () => {
    expect(useReducer).toBeDefined();
  });

  test("retuens - state", () => {
    const obj = { a: "A", b: 1 };

    const [state] = useReducer((a) => a, obj);
    expect(state).not.toStrictEqual(obj);
    expect(isRef(state)).toBeTruthy();
    expect(unref(state)).toStrictEqual(obj);
  });

  test("return - dispatch", () => {
    const [state, dispatch] = useReducer(
      (s: { num: number }, action: { type: "add" | "sub" }) => {
        const _type = action?.type;
        if (_type === "add") {
          return { num: s.num + 1 };
        }
        if (_type === "sub") {
          return { num: s.num - 1 };
        }
        throw new Error("type err");
      },
      { num: 0 },
    );
    expect(state.value.num).toBe(0);
    dispatch({ type: "add" });
    expect(state.value.num).toBe(1);
    dispatch({ type: "add" });
    dispatch({ type: "add" });
    expect(state.value.num).toBe(3);
    dispatch({ type: "sub" });
    expect(state.value.num).toBe(2);

    try {
      dispatch(undefined as any);
    } catch (error) {
      // ignore
    }
    expect(state.value.num).toBe(2);
  });
});
