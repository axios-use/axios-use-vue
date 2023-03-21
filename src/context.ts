import type { App } from "vue";
import { getCurrentInstance, inject } from "vue";

import type { AxiosInstance } from "axios";
import axios from "axios";

export const AXIOS_USE_VUE_PROVIDE_KEY = "__axios_use_vue_config";
const INJECT_INSIDE_WARN_MSG =
  "[@axios-use/vue warn]: getUseRequestConfig() can only be used inside setup() or functional components.";

export type RequestConfigType = {
  /** Axios instance. You can pass your axios with a custom config. */
  instance?: AxiosInstance;
};

export const setUseRequestConfig = (app: App, options?: RequestConfigType) => {
  app.provide(AXIOS_USE_VUE_PROVIDE_KEY, options);
};

export const getUseRequestConfig = (): RequestConfigType &
  Required<Pick<RequestConfigType, "instance">> => {
  const _isInside = Boolean(getCurrentInstance());
  if (!_isInside) {
    console.warn(INJECT_INSIDE_WARN_MSG);
  }

  const { instance = axios } = _isInside
    ? inject<RequestConfigType>(AXIOS_USE_VUE_PROVIDE_KEY, {})
    : {};

  return { instance };
};
