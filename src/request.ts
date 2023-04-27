import type {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  Canceler,
} from "axios";
import axios from "axios";

export type _ResponseDataItemType<T> = T extends AxiosResponse<infer D1>
  ? D1
  : T extends { data: infer D2 } | { data?: infer D2 }
  ? D2
  : undefined;

export interface Resource<T, D = any, W = AxiosResponse>
  extends AxiosRequestConfig<D> {
  _payload?: W extends AxiosResponse ? AxiosResponse<T, D> : T;
}

export type Request<T = any, D = any, W = any> = (
  ...args: any[]
) => Resource<T, D, W>;

export type Payload<T extends Request, Check = false> = Check extends true
  ? _ResponseDataItemType<ReturnType<T>["_payload"]>
  : ReturnType<T>["_payload"];
export type BodyData<T extends Request> = ReturnType<T>["data"];

export interface RequestFactory<T extends Request> {
  (...args: Parameters<T>): {
    cancel: Canceler;
    ready: () => Promise<readonly [Payload<T, true>, NonNullable<Payload<T>>]>;
  };
}

export interface RequestDispatcher<T extends Request> {
  (...args: Parameters<T>): Canceler;
}

/**
 * Normalize the error response returned from `@axios-use/vue`
 */
export interface RequestError<
  T = any,
  D = any,
  E = AxiosError<T, D> | AxiosResponse<T, D>,
> {
  data?: T;
  message: string;
  code?: string | number;
  isCancel: boolean;
  original: E;
}

export type RequestCallbackFn<T extends Request> = {
  /**
   * A callback function that's called when your request successfully completes with zero errors.
   * This function is passed the request's result `data` and `response`.
   */
  onCompleted?: (
    data: Payload<T, true>,
    response: NonNullable<Payload<T>>,
  ) => void;
  /**
   * A callback function that's called when the request encounters one or more errors.
   * This function is passed an `RequestError` object that contains either a networkError object or a `AxiosError`, depending on the error(s) that occurred.
   */
  onError?: (err: RequestError<Payload<T>, BodyData<T>>) => void;
};

/**
 * For TypeScript type deduction
 */
export function _request<T, D = any, W = false>(
  config: AxiosRequestConfig<D>,
): Resource<T, D, W> {
  return config;
}

/**
 * For TypeScript type deduction
 */
export const request = <T, D = any, W = AxiosResponse<T, D>>(
  config: AxiosRequestConfig<D>,
) => _request<T, D, W>(config);

export function createRequestError<
  T = any,
  D = any,
  E = AxiosError<T, D> | AxiosResponse<T, D>,
>(error: E): RequestError<T, D, E> {
  const axiosErr = error as unknown as AxiosError<T, D>;
  const axiosRes = error as unknown as AxiosResponse<T, D>;

  const data = axiosErr?.response?.data ?? axiosRes?.data;
  const code =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ((data as any)?.code as string) ??
    axiosErr?.code ??
    axiosErr?.response?.status ??
    axiosRes?.status;

  const message =
    axiosErr?.message || axiosErr?.response?.statusText || axiosRes?.statusText;

  return {
    code,
    data,
    message,
    isCancel: axios.isCancel(error),
    original: error,
  };
}
