import { setupServer } from "msw/node";
import { rest } from "msw";
import axios from "axios";
import { request } from "../../src/request";

export const BASE_URL = "https://api-demo.axiosuse.org";

export const mockAxiosIns = axios.create({
  baseURL: BASE_URL,
});

export const mockAxiosInsForPkg = axios.create({
  baseURL: BASE_URL,
  headers: {
    "h-mock-xxx": "",
  },
});

export type MockDataUserItem = {
  id: string;
  name: string;
};

export type CommonResponse<T> = {
  data?: T;
  code: number;
  msg: string;
};

export const pkgData = <T>(
  data: T,
  code: number,
  msg = "",
): CommonResponse<T> => {
  return {
    data,
    code,
    msg,
  };
};

export const MOCK_DATA_USER_LIST: MockDataUserItem[] = [
  {
    id: "0",
    name: "user_name_00",
  },
  {
    id: "1",
    name: "user_name_01",
  },
  {
    id: "2",
    name: "user_name_02",
  },
];

export const getAPIFuncs = (widthBaseUrl?: boolean) => {
  const baseURL = widthBaseUrl ? BASE_URL : undefined;

  return {
    user: {
      list: () =>
        request<MockDataUserItem[]>({
          baseURL,
          method: "get",
          url: "/users",
        }),
      // for type checking
      anyTypeList: () => ({
        baseURL,
        method: "get",
        url: "/users",
      }),
      // for type checking
      anyTypeWithoutGenericityList: () =>
        request({
          baseURL,
          method: "get",
          url: "/users",
        }),
      get: (params?: { id: string }) =>
        request<MockDataUserItem>({
          baseURL,
          method: "get",
          url: `/user/${params?.id}`,
        }),
    },
  };
};

export const restHandlers = [
  rest.get(`${BASE_URL}/users`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(MOCK_DATA_USER_LIST));
  }),

  rest.get(`${BASE_URL}/user/:id`, (req, res, ctx) => {
    const _id = String(req.params.id);
    const _item = MOCK_DATA_USER_LIST.find((i) => i.id === _id);

    if (!_item) {
      return res(ctx.status(404), ctx.json({ msg: "not found" }));
    }

    if (req.headers.has("h-mock-xxx")) {
      return res(ctx.status(200), ctx.json(pkgData(_item, 0, "success")));
    }

    return res(ctx.status(200), ctx.json(_item));
  }),
];

export const server = setupServer(...restHandlers);
