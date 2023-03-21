import { describe, expect, test } from "vitest";
import { defineComponent, h, provide } from "vue";
import axios from "axios";

import {
  AXIOS_USE_VUE_PROVIDE_KEY,
  getUseRequestConfig,
  setUseRequestConfig,
} from "../src/context";
import AxioUseVue from "../src";
import { mockAxiosIns } from "./setup/mock-request";
import { mount } from "./setup/mount";

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
