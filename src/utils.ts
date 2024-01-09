import type { ComputedRef, Ref } from "vue";
import { isReactive, readonly, ref, unref } from "vue";

type Reducer<S, A> = (prevState: S, action: A) => S;
type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any>
  ? S
  : never;
type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<
  any,
  infer A
>
  ? A
  : never;

/**
 *
 * @param reducer
 * @param initialArg
 */
export function useReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialArg: ReducerState<R>,
): [Readonly<Ref<ReducerState<R>>>, (action: ReducerAction<R>) => void] {
  const state = ref(initialArg);
  const dispatch = (action: ReducerAction<R>) => {
    state.value = reducer(state.value, action);
  };

  return [readonly(state) as Readonly<Ref<ReducerState<R>>>, dispatch];
}

// compatibility (vue < 3.3)
type MaybeRef<T = any> = T | Ref<T>;
export type UnRef<T> = T extends Ref<infer U> ? U : T;
export type FullRefArrayItem<T extends any[]> = {
  [K in keyof T]: MaybeRef<T[K]>;
};
export type UnRefArrayItem<T extends any[]> = { [K in keyof T]: UnRef<T[K]> };

/**
 * `unref` for ref group
 * @param arr
 */
export function unrefs<T extends any[]>(
  arr: FullRefArrayItem<T> | ComputedRef<T> | unknown[],
): UnRefArrayItem<T> {
  if (arr && Array.isArray(arr)) {
    return arr.map((a) => unref(a)) as UnRefArrayItem<T>;
  }
  return [] as unknown as UnRefArrayItem<T>;
}

/**
 * check whether `reactive` value exists
 */
export function hasReactive<T>(args: T) {
  if (args && Array.isArray(args)) {
    return args.some(isReactive);
  }
  return false;
}
