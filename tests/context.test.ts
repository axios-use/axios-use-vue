import { describe, expect, test } from "vitest";
import { defineComponent, h, provide } from "vue";
import Vue2, {
  defineComponent as defineComponent2,
  inject as inject2,
  getCurrentInstance as getCurrentInstance2,
} from "vue2";
import axios from "axios";

import {
  AXIOS_USE_VUE_PROVIDE_KEY,
  getUseRequestConfig,
  setUseRequestConfig,
  type RequestConfigType,
} from "../src/context";
import AxioUseVue from "../src";
import { mockAxiosIns } from "./setup/mock-request";
import { mount, mountVue2 } from "./setup/mount";

describe("context", () => {
  test("should be defined", () => {
    expect(getUseRequestConfig).toBeDefined();
    expect(setUseRequestConfig).toBeDefined();
    expect(AXIOS_USE_VUE_PROVIDE_KEY).toBeDefined();
  });

  test("getUseRequestConfig", () => {
    const ChildComponent = defineComponent({
      setup() {
        const { instance } = getUseRequestConfig();
        expect(instance).not.toBe(axios);
        expect(instance).toBe(mockAxiosIns);

        return () => h("div");
      },
    });

    const RootComponent = defineComponent({
      setup() {
        const { instance } = getUseRequestConfig();
        expect(instance).toBe(axios);
        expect(instance).not.toBe(mockAxiosIns);

        provide(AXIOS_USE_VUE_PROVIDE_KEY, { instance: mockAxiosIns });

        return () => h(ChildComponent);
      },
    });

    mount(RootComponent);
    expect(mockAxiosIns).not.toBe(axios);
  });

  test("setUseRequestConfig", () => {
    const Component = defineComponent({
      setup() {
        const { instance } = getUseRequestConfig();
        expect(instance).not.toBe(axios);
        expect(instance).toBe(mockAxiosIns);

        return () => h("div");
      },
    });

    mount(Component, (app) => {
      setUseRequestConfig(app, { instance: mockAxiosIns });
    });
  });

  test("setUseRequestConfig (vue 2)", () => {
    const Component = defineComponent2({
      setup() {
        const _val = inject2<RequestConfigType>(AXIOS_USE_VUE_PROVIDE_KEY, {});

        expect(_val.instance).not.toBe(axios);
        expect(_val.instance).toBe(mockAxiosIns);

        return () => h("div");
      },
    });
    Vue2.use(AxioUseVue as any, { instance: mockAxiosIns });
    mountVue2(Component);
  });

  test("setUseRequestConfig (vue 2 - empty _provided)", () => {
    const Component = defineComponent2({
      setup() {
        const _val = inject2<RequestConfigType>(AXIOS_USE_VUE_PROVIDE_KEY, {});

        expect(_val.instance).not.toBe(axios);
        expect(_val.instance).toBe(mockAxiosIns);

        const vm = getCurrentInstance2();

        expect(
          (vm?.proxy as any)._provided[AXIOS_USE_VUE_PROVIDE_KEY as any]
            ?.instance,
        ).toBe(mockAxiosIns);

        return () => h("div");
      },
    });

    Vue2.use(
      {
        install(app, options) {
          app.mixin({
            beforeCreate() {
              (this as any)._provided = null;
            },
          });
          setUseRequestConfig(app as any, options);
        },
      },
      { instance: mockAxiosIns },
    );
    mountVue2(Component);
  });

  test("setUseRequestConfig (vue 2 - _provided set)", () => {
    const Component = defineComponent2({
      setup() {
        return () => h("div");
      },
    });

    Vue2.use(
      {
        install(app, options) {
          setUseRequestConfig(app as any, options);
          app.mixin({
            beforeCreate() {
              (this as any)._provided = null;
            },
          });
        },
      },
      { instance: mockAxiosIns },
    );
    mountVue2(Component);
  });

  test("install plugin", () => {
    const Component = defineComponent({
      setup() {
        const { instance } = getUseRequestConfig();
        expect(instance).not.toBe(axios);
        expect(instance).toBe(mockAxiosIns);

        return () => h("div");
      },
    });

    mount(Component, (app) => {
      app.use(AxioUseVue, { instance: mockAxiosIns });
    });
  });
});

describe("config - getResponseItem", () => {
  test("default value", () => {
    const Component = defineComponent({
      setup() {
        const { getResponseItem } = getUseRequestConfig();
        expect(getResponseItem).toBeDefined();
        expect(getResponseItem({ data: 1 })).toBe(1);
        expect(getResponseItem({})).toBeUndefined();
        expect(getResponseItem()).toBeUndefined();

        return () => h("div");
      },
    });

    mount(Component);
  });

  test("custom", () => {
    const fn = (r) => ({
      o: r,
      d: r?.data,
      msg: r?.message || r?.statusText || r?.status,
    });
    const Component = defineComponent({
      setup() {
        const { getResponseItem } = getUseRequestConfig();
        expect(getResponseItem).toBeDefined();
        expect(getResponseItem({ data: 1 })).toStrictEqual(fn({ data: 1 }));
        expect(getResponseItem({})).toStrictEqual(fn({}));
        expect(getResponseItem()).toStrictEqual(fn(undefined));

        return () => h("div");
      },
    });

    mount(Component, (app) => {
      app.use(AxioUseVue, { getResponseItem: fn });
    });
  });
});
