import type { ComputedRef } from "vue";
import { computed, unref, watch } from "vue";
import type { Canceler } from "axios";

import type { RequestConfigType } from "./context";
import type {
  Payload,
  BodyData,
  RequestError,
  Request,
  RequestAsyncFunc,
  RequestDispatcher,
  RequestCallbackFn,
} from "./request";
import { useRequest } from "./useRequest";
import type { FullRefArrayItem } from "./utils";
import { hasReactive, useReducer, unrefs } from "./utils";

const REQUEST_CLEAR_MESSAGE =
  "A new request has been made before completing the last one";

export type RequestState<T extends Request> = {
  data?: Payload<T, true>;
  response?: Payload<T>;
  error?: RequestError<Payload<T>, BodyData<T>>;
  isLoading?: boolean;
};

export type UseResourceResultState<T extends Request> = ComputedRef<
  RequestState<T>
>;

export type UseResourceResult<T extends Request, A extends boolean = false> = [
  /** Response data group */
  UseResourceResultState<T>,
  /** A function that enables you to re-execute the request. And pass in new variables */
  A extends true ? RequestAsyncFunc<T> : RequestDispatcher<T>,
  /** A function that enables you to re-execute the request. Keep the latest variables */
  () => Canceler | undefined,
  /** A function that cancel the request */
  Canceler,
];

export type UseResourceOptions<
  T extends Request,
  A extends boolean = false,
> = Pick<RequestConfigType, "instance" | "getResponseItem"> &
  RequestCallbackFn<T> & {
    /** Conditional Fetching */
    filter?: (...args: Parameters<T>) => boolean;
    defaultState?: RequestState<T>;
    /** Control the return value of the request */
    asyncReq?: A;
  };

function getDefaultStateLoading<T extends Request>(
  requestParams?: Parameters<T> | false,
  filter?: (...args: Parameters<T>) => boolean,
) {
  if (requestParams) {
    if (filter && typeof filter === "function") {
      return filter(...requestParams);
    }
    return true;
  }
  return undefined;
}

type Action<T extends Request> =
  | { type: "success"; data: Payload<T, true>; response: Payload<T> }
  | { type: "error"; error: RequestError<Payload<T>, BodyData<T>> }
  | { type: "reset" | "start" };

function getNextState<T extends Request>(
  state: RequestState<T>,
  action: Action<T>,
): RequestState<T> {
  const response = action.type === "success" ? action.response : state.response;

  return {
    data: action.type === "success" ? action.data : state.data,
    response,
    error: action.type === "error" ? action.error : undefined,
    isLoading: action.type === "start",
  };
}

export type RequestDepsParameters<T extends Request> =
  | Parameters<T>
  | FullRefArrayItem<Parameters<T>>
  | ComputedRef<Parameters<T>>;

export function useResource<T extends Request, A extends boolean = false>(
  fn: T,
  requestParams?: RequestDepsParameters<T> | false,
  options?: UseResourceOptions<T, A>,
): UseResourceResult<T, A> {
  const [createRequest, { clear }] = useRequest(fn, {
    onCompleted: options?.onCompleted,
    onError: options?.onError,
    instance: options?.instance,
    getResponseItem: options?.getResponseItem,
  });

  const [state, dispatch] = useReducer(getNextState, {
    isLoading: getDefaultStateLoading<T>(
      requestParams ? (unrefs(requestParams) as Parameters<T>) : requestParams,
      options?.filter,
    ),
    ...options?.defaultState,
  });

  const _reqDispatcher = (...args: Parameters<T>) => {
    clear(REQUEST_CLEAR_MESSAGE);

    const { ready, cancel } = createRequest(...args);

    dispatch({ type: "start" });
    ready()
      .then(([data, response]) => {
        dispatch({ type: "success", data, response });
      })
      .catch((e) => {
        const error = e as RequestError<Payload<T>, BodyData<T>>;
        if (!error.isCancel) {
          dispatch({ type: "error", error });
        }
      });

    return cancel;
  };
  const _reqAsync = async (...args: Parameters<T>) => {
    clear(REQUEST_CLEAR_MESSAGE);

    const { ready } = createRequest(...args);

    try {
      dispatch({ type: "start" });
      const [data, response] = await ready();
      dispatch({ type: "success", data, response });
      return [data, response];
    } catch (e) {
      const error = e as RequestError<Payload<T>, BodyData<T>>;
      if (!error.isCancel) {
        dispatch({ type: "error", error });
      }
      throw e;
    }
  };
  const request = (...args: Parameters<T>) =>
    options?.asyncReq ? _reqAsync(...args) : _reqDispatcher(...args);

  const refresh = () => {
    const _args = unrefs(requestParams || []) as Parameters<T>;
    const _filter =
      typeof options?.filter === "function" ? options.filter(..._args) : true;

    if (_filter) {
      return _reqDispatcher(..._args);
    }

    return undefined;
  };

  const cancel = (message?: string) => {
    dispatch({ type: "reset" });
    clear(message);
  };

  const _paramsDeps = computed(() =>
    requestParams ? unrefs(requestParams) : requestParams,
  );
  watch(
    _paramsDeps,
    (params) => {
      if (params) {
        refresh();
      }
    },
    {
      immediate: true,
      deep: hasReactive(requestParams),
    },
  );

  const rtnState = computed<RequestState<T>>(() => unref(state));

  return [rtnState, request, refresh, cancel] as UseResourceResult<T, A>;
}
