import { describe, expect, test, expectTypeOf } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import type { AxiosResponse } from "axios";
import { computed, defineComponent, h, ref, unref, reactive } from "vue";

import { useResource, _request } from "../src";
import type { MockDataUserItem } from "./setup/mock-request";
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

        const _unref_res = unref(res);
        expect(_unref_res.isLoading).toBeTruthy();
        expect(_unref_res.data).toBeUndefined();
        expect(_unref_res.response).toBeUndefined();
        expect(_unref_res.error).toBeUndefined();

        expectTypeOf(_unref_res.data).toEqualTypeOf<
          MockDataUserItem | undefined
        >();
        expectTypeOf(_unref_res.response).toEqualTypeOf<
          AxiosResponse<MockDataUserItem> | undefined
        >();

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

  test("options: defaultState", async () => {
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

  test("reactive parameter", async () => {
    const Component = defineComponent({
      setup() {
        const params = reactive({ id: "1" });
        const [res] = useResource(getAPIFuncs(true).user.get, [params], {
          filter: (p) => Boolean(p?.id),
        });

        expect(unref(res).isLoading).toBeTruthy();
        expect(unref(res).data).toBeUndefined();
        expect(unref(res).response).toBeUndefined();
        expect(unref(res).error).toBeUndefined();

        const handleChangeId = () => {
          params.id = "2";
        };

        return () =>
          h("div", [
            h("button", {
              "data-t-id": "change_id",
              onClick: handleChangeId,
            }),
            h(
              "div",
              { "data-t-id": "res.data" },
              JSON.stringify(res.value.data),
            ),
            h("div", { "data-t-id": "res.isLoading" }, res.value.isLoading),
            h("div", { "data-t-id": "params.id" }, params.id),
          ]);
      },
    });

    const wrapper = mount(Component);
    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe(
      JSON.stringify(MOCK_DATA_USER_LIST.find((i) => i.id === "1")),
    );
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("false");
    expect(wrapper.get('[data-t-id="params.id"]').text()).toBe("1");

    wrapper.get('[data-t-id="change_id"]').trigger("click");
    await flushPromises();
    expect(wrapper.get('[data-t-id="res.data"]').text()).toBe(
      JSON.stringify(MOCK_DATA_USER_LIST.find((i) => i.id === "2")),
    );
    expect(wrapper.get('[data-t-id="res.isLoading"]').text()).toBe("false");
    expect(wrapper.get('[data-t-id="params.id"]').text()).toBe("2");
  });

  test("types: custom response type", async () => {
    const Component = defineComponent({
      setup() {
        const id = ref("1");

        const [res] = useResource(
          (i: string) =>
            _request<MockDataUserItem>({
              method: "get",
              url: `/user/${i}`,
            }),
          [id],
        );

        const _unref_res = unref(res);

        expectTypeOf(_unref_res.data).toEqualTypeOf<undefined>();
        expectTypeOf(_unref_res.response).toEqualTypeOf<
          MockDataUserItem | undefined
        >();

        return () => h("div");
      },
    });

    mount(Component);
  });
});
