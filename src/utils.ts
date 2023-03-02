import { readonly, ref } from "vue";

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
) {
  const state = ref(initialArg);
  const dispatch = (action: ReducerAction<R>) => {
    state.value = reducer(state.value, action);
  };

  return [readonly(state), dispatch] as const;
}
