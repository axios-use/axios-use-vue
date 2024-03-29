import type { Plugin } from "../demi";

import type { RequestConfigType } from "./context";
import { setUseRequestConfig } from "./context";

const _plugin: Plugin<[RequestConfigType?]> = {
  install(app, options) {
    setUseRequestConfig(app, options);
  },
};

export default _plugin;
