import { describe, expect, test } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { computed, defineComponent, h, ref, unref } from "vue";

import { useResource } from "../src";
import { getAPIFuncs, MOCK_DATA_USER_LIST } from "./setup/mock-request";

describe("useResource", () => {
  test("should be defined", () => {
    expect(useResource).toBeDefined();
  });

  test("response", async () => {
    const Component = defineComponent({
      setup() {
        const id = ref("1");
        const params = computed(() => ({ id: unref(id) }));
        const [res] = useResource(getAPIFuncs(true).user.get, [params]);

        expect(unref(res).isLoading).toBeTruthy();
        expect(unref(res).data).toBeUndefined();
        expect(unref(res).response).toBeUndefined();
        expect(unref(res).error).toBeUndefined();

        const onAdd = () => {
          id.value = String(Number(unref(id)) + 1);
        };

        return () =>
          h("div", [
            h("button", { "data-t-id": "add", onClick: onAdd }, "add"),
            h(
              "div",
              { "data-t-id": "res.data" },
              JSON.stringify(res.value.data),
            ),
            h("div", { "data-t-id": "res.isLoading" }, res.value.isLoading),
          ]);
      },
    });

    const wrapper = mount(Component);

    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe("");
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBeTruthy();

    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe(
      JSON.stringify(MOCK_DATA_USER_LIST.find((i) => i.id === "1")),
    );
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("false");

    wrapper.get('[data-t-id="add"]').trigger("click");

    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe(
      JSON.stringify(MOCK_DATA_USER_LIST.find((i) => i.id === "2")),
    );
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("false");
  });

  test("options: filter", async () => {
    const Component = defineComponent({
      setup() {
        const [res, request, refresh, cancel] = useResource(
          getAPIFuncs(true).user.get,
          false,
          {
            filter: (p) => Boolean(p?.id),
          },
        );

        expect(unref(res).isLoading).toBeUndefined();
        expect(unref(res).data).toBeUndefined();
        expect(unref(res).response).toBeUndefined();
        expect(unref(res).error).toBeUndefined();

        return () =>
          h("div", [
            h("button", {
              "data-t-id": "request_1",
              onClick: () => request({ id: "1" }),
            }),
            h("button", {
              "data-t-id": "request_2",
              onClick: () => request({ id: "2" }),
            }),
            h("button", {
              "data-t-id": "request_null",
              onClick: () => request(undefined),
            }),
            h("button", { "data-t-id": "refresh", onClick: () => refresh() }),
            h("button", {
              "data-t-id": "cancel",
              onClick: () => cancel(),
            }),
            h(
              "div",
              { "data-t-id": "res.data" },
              JSON.stringify(res.value.data),
            ),
            h("div", { "data-t-id": "res.isLoading" }, res.value.isLoading),
          ]);
      },
    });

    const wrapper = mount(Component);
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe("");
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("");

    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe("");
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("");

    wrapper.get('[data-t-id="refresh"]').trigger("click");
    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe("");
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("");

    wrapper.get('[data-t-id="request_null"]').trigger("click");
    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe("");
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("false");

    wrapper.get('[data-t-id="request_1"]').trigger("click");
    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe(
      JSON.stringify(MOCK_DATA_USER_LIST.find((i) => i.id === "1")),
    );
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("false");

    wrapper.get('[data-t-id="request_2"]').trigger("click");
    wrapper.get('[data-t-id="cancel"]').trigger("click");
    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe(
      JSON.stringify(MOCK_DATA_USER_LIST.find((i) => i.id === "1")),
    );
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("false");

    wrapper.get('[data-t-id="request_2"]').trigger("click");
    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe(
      JSON.stringify(MOCK_DATA_USER_LIST.find((i) => i.id === "2")),
    );
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("false");
  });

  test("options: ", async () => {
    const Component = defineComponent({
      setup() {
        const [res, request] = useResource(getAPIFuncs(true).user.get, [], {
          filter: (p) => Boolean(p?.id),
          defaultState: { data: {} as any },
        });

        expect(unref(res).isLoading).toBeFalsy();
        expect(unref(res).data).toStrictEqual({});
        expect(unref(res).response).toBeUndefined();
        expect(unref(res).error).toBeUndefined();

        return () =>
          h("div", [
            h("button", {
              "data-t-id": "request_1",
              onClick: () => request({ id: "1" }),
            }),
            h(
              "div",
              { "data-t-id": "res.data" },
              JSON.stringify(res.value.data),
            ),
            h("div", { "data-t-id": "res.isLoading" }, res.value.isLoading),
          ]);
      },
    });

    const wrapper = mount(Component);
    wrapper.get('[data-t-id="request_1"]').trigger("click");
    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe(
      JSON.stringify(MOCK_DATA_USER_LIST.find((i) => i.id === "1")),
    );
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("false");
  });
});
