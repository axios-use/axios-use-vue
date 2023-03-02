import type { App } from "vue";
import { inject } from "vue";

import type { AxiosInstance } from "axios";
import axios from "axios";

export const AXIOS_USE_VUE_PROVIDE_KEY = "__axios_use_vue_options";

export type RequestConfigType = {
  instance?: AxiosInstance;
};

export const setUseRequestConfig = (app: App, options?: RequestConfigType) => {
  app.provide(AXIOS_USE_VUE_PROVIDE_KEY, options);
};

export const getUseRequestConfig = (): RequestConfigType &
  Required<Pick<RequestConfigType, "instance">> => {
  const { instance = axios } =
    inject<RequestConfigType>(AXIOS_USE_VUE_PROVIDE_KEY) || {};

  return { instance };
};
