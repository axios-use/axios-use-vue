import type { InjectionKey } from "vue";
import { getCurrentInstance, inject } from "vue";

import type { AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";

import type { App } from "../demi";

const INJECT_INSIDE_WARN_MSG =
  "[@axios-use/vue warn]: getUseRequestConfig() can only be used inside setup() or functional components.";

export type RequestConfigType = {
  /** Axios instance. You can pass your axios with a custom config. */
  instance?: AxiosInstance;
  /** custom `data` value. @default response['data'] */
  getResponseItem?: (res?: any) => unknown;
};

export const AXIOS_USE_VUE_PROVIDE_KEY = Symbol(
  "axios_use_vue_config",
) as InjectionKey<RequestConfigType>;

export const setUseRequestConfig = (app: App, options?: RequestConfigType) => {
  const _version = Number(app.version.split(".")[0]);
  // for vue2
  if (_version === 2) {
    app.mixin({
      beforeCreate() {
        if (!this._provided) {
          const _cache = {};
          Object.defineProperty(this, "_provided", {
            get: () => _cache,
            set: (v) => Object.assign(_cache, v),
          });
        }
        this._provided[AXIOS_USE_VUE_PROVIDE_KEY as any] = options;
      },
    });
  } else {
    app.provide(AXIOS_USE_VUE_PROVIDE_KEY, options);
  }
};

const defaultGetResponseData = (res: AxiosResponse) => res?.data;

export const getUseRequestConfig = (): RequestConfigType &
  Required<Pick<RequestConfigType, "instance" | "getResponseItem">> => {
  const _isInside = Boolean(getCurrentInstance());
  if (!_isInside) {
    console.warn(INJECT_INSIDE_WARN_MSG);
  }

  const { instance = axios, getResponseItem = defaultGetResponseData } =
    _isInside ? inject<RequestConfigType>(AXIOS_USE_VUE_PROVIDE_KEY, {}) : {};

  return { instance, getResponseItem };
};
