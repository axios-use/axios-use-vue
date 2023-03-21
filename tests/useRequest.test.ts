import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";

import { useRequest } from "../src";
import {
  getAPIFuncs,
  mockAxiosIns,
  MOCK_DATA_USER_LIST,
} from "./setup/mock-request";
import { mount } from "./setup/mount";

describe("useRequest", () => {
  test("should be defined", () => {
    expect(useRequest).toBeDefined();
  });

  test("check response", async () => {
    const [createRequest] = useRequest(getAPIFuncs(true).user.list);

    const [data, response] = await createRequest().ready();
    expect(data).toStrictEqual(MOCK_DATA_USER_LIST);
    expect(response.data).toStrictEqual(MOCK_DATA_USER_LIST);
    expect(response.status).toBe(200);
  });

  test("inline instance", async () => {
    const [createRequest] = useRequest(getAPIFuncs().user.list, {
      instance: mockAxiosIns,
      onCompleted: (d, r) => {
        expect(d).toStrictEqual(MOCK_DATA_USER_LIST);
        expect(r.data).toStrictEqual(MOCK_DATA_USER_LIST);
        expect(r.status).toBe(200);
      },
    });
    const [data, response] = await createRequest().ready();
    expect(data).toStrictEqual(MOCK_DATA_USER_LIST);
    expect(response.data).toStrictEqual(MOCK_DATA_USER_LIST);
    expect(response.status).toBe(200);
  });

  test("cancel", async () => {
    const okFn = vi.fn();
    const errFn = vi.fn();

    const [createRequest, { hasPending }] = useRequest(
      getAPIFuncs(true).user.list,
      {
        onCompleted: () => {
          okFn();
        },
        onError: () => {
          errFn();
        },
      },
    );

    const { ready, cancel } = createRequest();

    expect(okFn).toBeCalledTimes(0);
    expect(errFn).toBeCalledTimes(0);

    ready()
      .then(() => {
        // don't call
        expect(1).toBe(2);
      })
      .catch((err) => {
        expect(err.isCancel).toBeTruthy();
        expect(err.message).toBe("mock_cancel");
      })
      .finally(() => {
        expect(okFn).toBeCalledTimes(0);
        expect(errFn).toBeCalledTimes(1);
      });
    cancel("mock_cancel");
    expect(okFn).toBeCalledTimes(0);
    expect(errFn).toBeCalledTimes(0);
    expect(hasPending.value).toBeTruthy();
  });

  test("clear - onUnmounted", () => {
    const Component = defineComponent({
      setup() {
        const okFn = vi.fn();
        const errFn = vi.fn();

        const [createRequest] = useRequest(getAPIFuncs(true).user.list, {
          onCompleted: () => {
            okFn();
          },
          onError: () => {
            errFn();
          },
        });

        expect(okFn).toBeCalledTimes(0);
        expect(errFn).toBeCalledTimes(0);

        createRequest()
          .ready()
          .catch((err) => {
            expect(err.isCancel).toBeTruthy();
          })
          .finally(() => {
            expect(okFn).toBeCalledTimes(0);
            expect(errFn).toBeCalledTimes(1);
          });

        return () => h("div");
      },
    });

    const comp = mount(Component);
    comp.unmount();
  });
});
