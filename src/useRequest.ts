import type { ComputedRef } from "vue";
import { computed, shallowRef, unref, onUnmounted } from "vue";
import type {
  AxiosError,
  AxiosInstance,
  Canceler,
  CancelToken,
  CancelTokenSource,
} from "axios";
import axios from "axios";

import { getUseRequestConfig } from "./context";

import type {
  RequestFactory,
  RequestCallbackFn,
  Request,
  Payload,
  BodyData,
} from "./request";
import { createRequestError } from "./request";

export type UseRequestOptions<T extends Request> = RequestCallbackFn<T> & {
  instance?: AxiosInstance;
  /** custom returns the value of `data`(index 0). @default (r) => r?.data */
  getResponseItem?: (res?: any) => unknown;
};

export type UseRequestResult<T extends Request> = [
  RequestFactory<T>,
  {
    /** Whether there are pending requests in the current `useRequest` */
    hasPending: ComputedRef<boolean>;
    /** Cancel all requests for the current `useRequest` */
    clear: Canceler;
  },
];

export function useRequest<T extends Request>(
  fn: T,
  options?: UseRequestOptions<T>,
): UseRequestResult<T> {
  const requestConfig = getUseRequestConfig();
  const _axiosIns = options?.instance || requestConfig.instance;

  const sources = shallowRef<CancelTokenSource[]>([]);
  const hasPending = computed(() => unref(sources).length > 0);
  const { onCompleted, onError } = options || {};

  const removeCancelToken = (token: CancelToken) => {
    const _sources = unref(sources);
    if (token && _sources.length > 0) {
      sources.value = _sources.filter((s) => s.token !== token);
    }
  };

  const clear = (message?: string) => {
    const _sources = unref(sources);
    if (_sources.length > 0) {
      _sources.map((s) => s.cancel(message));
      sources.value = [];
    }
  };

  onUnmounted(() => {
    clear();
  });

  const request = (...args: Parameters<T>) => {
    const _config = fn(...args);
    // for browser compatibility
    const _source = axios.CancelToken.source();

    const ready = () => {
      sources.value = [...unref(sources), _source];

      return _axiosIns({ ..._config, cancelToken: _source.token })
        .then((res) => {
          removeCancelToken(_source.token);

          const _data = (
            options?.getResponseItem
              ? options.getResponseItem(res as Payload<T>)
              : requestConfig.getResponseItem(res)
          ) as Payload<T, true>;
          onCompleted?.(_data, res as Payload<T>);
          return [_data, res as Payload<T>] as const;
        })
        .catch((err: AxiosError<Payload<T>, BodyData<T>>) => {
          removeCancelToken(_source.token);

          const _error = createRequestError(err);
          onError?.(_error);

          throw _error;
        });
    };

    return { ready, cancel: _source.cancel };
  };

  return [request, { clear, hasPending }];
}
