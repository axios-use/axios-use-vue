import { describe, it, expect, expectTypeOf } from "vitest";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { Payload, Resource } from "../src";
import { request, _request, createRequestError } from "../src";

const config1 = { url: "/config1", method: "GET" } as AxiosRequestConfig;
const config2 = {
  url: "/config2",
  method: "GET",
  params: { page: 2, size: 10 },
} as AxiosRequestConfig;

describe("request", () => {
  it("should be defined", () => {
    expect(request).toBeDefined();
  });

  it("value", () => {
    expect(request(config1)).toStrictEqual(config1);
    expect(request(config2)).toStrictEqual(config2);
  });
});

describe("createRequestError", () => {
  it("should be defined", () => {
    expect(createRequestError).toBeDefined();
  });

  it("value", () => {
    const err1 = {
      config: config1,
      code: 401,
      response: { data: [1, 2], status: 400 },
    };
    expect(createRequestError(err1 as any).code).toEqual(err1.code);
    expect(createRequestError(err1 as any).data).toEqual(err1.response?.data);
    expect(createRequestError(err1 as any).isCancel).toBeFalsy();

    const err2 = {
      config: config1,
      code: 401,
      response: { data: { code: 2001, data: [1, 2] }, status: 400 },
    };
    expect(createRequestError(err2 as any).code).toEqual(
      err2.response?.data?.code,
    );
    expect(createRequestError(err2 as any).data).toEqual(err2.response?.data);
    expect(createRequestError(err2 as any).isCancel).toBeFalsy();

    const err3 = {
      config: config1,
      response: { status: 400 },
    };
    expect(createRequestError(err3 as any).code).toEqual(400);
    expect(createRequestError(err3 as any).data).toBeUndefined();

    expect(createRequestError(undefined as any).code).toBeUndefined();
    expect(createRequestError(undefined as any).data).toBeUndefined();
    expect(createRequestError(undefined as any).original).toBeUndefined();

    expect(createRequestError({} as any).code).toBeUndefined();
    expect(createRequestError({} as any).data).toBeUndefined();
    expect(createRequestError({} as any).original).toStrictEqual({});
  });
});

describe("type checking", () => {
  type DataType = { a: string; b?: number };
  type ItemType = { z: string[] };
  type DataType2 = DataType & { data?: ItemType };
  const rq0 = () => _request<DataType>({});
  const rq1 = () => request<DataType>({});
  const rq2 = () => _request<DataType2>({});

  it("request", () => {
    expectTypeOf(rq0()).toEqualTypeOf<Resource<DataType, any>>();
    expectTypeOf(rq1()).toEqualTypeOf<
      Resource<AxiosResponse<DataType>, any, "data">
    >();

    const c0 = null as unknown as Payload<typeof rq0>;
    expectTypeOf(c0).toEqualTypeOf<DataType | undefined>();
    const c1 = null as unknown as Payload<typeof rq0, true>;
    expectTypeOf(c1).toEqualTypeOf<undefined>();

    const c2 = null as unknown as Payload<typeof rq1>;
    expectTypeOf(c2).toEqualTypeOf<AxiosResponse<DataType, any>>();
    const c3 = null as unknown as Payload<typeof rq1, true>;
    expectTypeOf(c3).toEqualTypeOf<DataType | undefined>();

    const c4 = null as unknown as Payload<typeof rq2>;
    expectTypeOf(c4).toEqualTypeOf<DataType2 | undefined>();
    const c5 = null as unknown as Payload<typeof rq2, true>;
    expectTypeOf(c5).toEqualTypeOf<ItemType | undefined>();
  });
});
