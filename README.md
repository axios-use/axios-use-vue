<br>
<p align="center">
<a href="https://github.com/axios-use/vue#gh-light-mode-only">
  <img src="https://raw.githubusercontent.com/axios-use/axios-use-vue/main/other/axios-use-vue.png#gh-light-mode-only" alt="@axios-use/vue - A Vue composition utilities for Axios. Lightweight and less change." width="460">
</a>
<a href="https://github.com/axios-use/vue#gh-dark-mode-only">
  <img src="https://raw.githubusercontent.com/axios-use/axios-use-vue/main/other/axios-use-vue-dark.png#gh-dark-mode-only" alt="@axios-use/vue - A Vue composition utilities for Axios. Lightweight and less change." width="460">
</a>
<br>
A Vue composition utilities for Axios. Lightweight, cancelable and less change.
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@axios-use/vue" target="__blank"><img src="https://img.shields.io/npm/v/@axios-use/vue.svg" alt="NPM version"></a>
<a href="https://packagephobia.com/result?p=%40axios-use%2Fvue" target="__blank"><img src="https://badgen.net/packagephobia/install/@axios-use/vue" alt="install size"></a>
<a href="https://bundlephobia.com/package/@axios-use/vue" target="__blank"><img src="https://badgen.net/bundlephobia/minzip/@axios-use/vue" alt="minzipped size"></a>
<a href="https://github.com/axios-use/axios-use-vue/blob/main/LICENSE" target="__blank"><img src="https://img.shields.io/github/license/axios-use/axios-use-vue" alt="license"></a>
</p>
<br>
<br>

<div align="center">
<pre>npm i <a href="https://www.npmjs.com/package/axios">axios</a> <a href="https://www.npmjs.com/package/@axios-use/vue"><b>@axios-use/vue</b></a></pre>
</div>
<br>
<br>

## Usage

### Quick Start

```vue
<script setup>
import { defineProps, toRef } from "vue";
import { useResource } from "@axios-use/vue";

const props = defineProps(["userId"]);
const userId = toRef(props, "userId");
const [reqState] = useResource((id) => ({ url: `/user/${id}` }), [userId]);
</script>

<template>
  <div v-if="reqState.error">{{ reqState.error?.message || "error" }}</div>
  <div v-else-if="reqState.isLoading === false">{{ reqState.data?.name }}</div>
  <div v-else>...</div>
</template>
```

```js
import { useRequest, useResource } from "@axios-use/vue";
```

### Options (optional)

| config   | type   | default | explain                                                       |
| -------- | ------ | ------- | ------------------------------------------------------------- |
| instance | object | `axios` | Axios instance. You can pass your axios with a custom config. |

```ts
import axios from "axios";
import AxiosUseVue from "@axios-use/vue";

import App from "./App.vue";

// custom Axios instance. https://github.com/axios/axios#creating-an-instance
const axiosInstance = axios.create({
  baseURL: "https://example.com/",
});

const app = createApp(App);
// custom instance
app.use(AxiosUseVue, { instance: axiosInstance });

app.mount("#app");
```

### useRequest

| option              | type            | explain                                          |
| ------------------- | --------------- | ------------------------------------------------ |
| fn                  | function        | get AxiosRequestConfig function                  |
| options.onCompleted | function        | This function is passed the query's result data. |
| options.onError     | function        | This function is passed an `RequestError` object |
| options.instance    | `AxiosInstance` | Customize the Axios instance of the current item |

```ts
// js
const [createRequest, { hasPending, cancel }] = useRequest((id) => ({
  url: `/user/${id}`,
  method: "DELETE",
}));

// ts
const [createRequest, { hasPending, cancel }] = useRequest((id: string) =>
  // response.data: Result. AxiosResponse<Result>
  request<Result>({
    url: `/user/${id}`,
    method: "DELETE",
  }),
);
```

```ts
interface CreateRequest {
  // Promise function
  ready: () => Promise<[Payload<T>, AxiosResponse]>;
  // Axios Canceler. clear current request.
  cancel: Canceler;
}

type HasPending = ComputedRef<boolean>;
// Axios Canceler. clear all pending requests(CancelTokenSource).
type Cancel = Canceler;
```

```ts
// options: onCompleted, onError
const [createRequest, { hasPending, cancel }] = useRequest(
  (id) => ({
    url: `/user/${id}`,
    method: "DELETE",
  }),
  {
    onCompleted: (data, response) => console.info(data, response),
    onError: (err) => console.info(err),
  },
);
```

### useResource

| option               | type            | explain                                                             |
| -------------------- | --------------- | ------------------------------------------------------------------- |
| fn                   | function        | get AxiosRequestConfig function                                     |
| parameters           | array \| false  | `fn` function parameters. effect dependency list                    |
| options.filter       | function        | Request filter. if return a falsy value, will not start the request |
| options.defaultState | object          | Initialize the state value. `{data, response, error, isLoading}`    |
| options.onCompleted  | function        | This function is passed the query's result data.                    |
| options.onError      | function        | This function is passed an `RequestError` object                    |
| options.instance     | `AxiosInstance` | Customize the Axios instance of the current item                    |

```ts
// js
const [reqState, fetch, refresh, cancel] = useResource((id) => ({
  url: `/user/${id}`,
  method: "GET",
}));

// ts
const [reqState, fetch, refresh] = useResource((id: string) =>
  // response.data: Result. AxiosResponse<Result>
  request<Result>({
    url: `/user/${id}`,
    method: "GET",
  }),
);
```

```ts
type ReqState = ComputedRef<{
  // Result
  data?: Payload<T>;
  // axios response
  response?: AxiosResponse;
  // normalized error
  error?: RequestError;
  isLoading: boolean;
}>;

// `options.filter` will not be called
type Fetch = (...args: Parameters<T>) => Canceler;

// 1. Same as `fetch`. But no parameters required. Inherit `useResource` parameters
// 2. Will call `options.filter`
type Refresh = () => Canceler | undefined;
type Cancel = Canceler;
```

The request can also be triggered passing its arguments as dependencies to the _useResource_ hook.

```js
const userId = ref("001");

const [reqState] = useResource(
  (id) => ({
    url: `/user/${id}`,
    method: "GET",
  }),
  [userId],
);

// no parameters
const [reqState] = useResource(
  () => ({
    url: "/users/",
    method: "GET",
  }),
  [],
);

// conditional
const [reqState, request] = useResource(
  (id) => ({
    url: `/user/${id}`,
    method: "GET",
  }),
  [userId],
  {
    filter: (id) => id !== "12345",
  },
);

request("12345"); // custom request is still useful

// ComputedRef parameter
const params = computed(() => ({ id: unref(userId) }));
const [reqState, request] = useResource(
  ({ id }) => ({
    url: `/user/${id}`,
    method: "GET",
  }),
  [params],
);

// options: onCompleted, onError
const [reqState] = useResource(
  () => ({
    url: "/users/",
    method: "GET",
  }),
  [],
  {
    onCompleted: (data, response) => console.info(data, response),
    onError: (err) => console.info(err),
  },
);
```

### other

#### request

The `request` function allows you to define the response type coming from it. It also helps with creating a good pattern on defining your API calls and the expected results. It's just an identity function that accepts the request config and returns it. Both `useRequest` and `useResource` extract the expected and annotated type definition and resolve it on the `response.data` field.

```ts
const api = {
  getUsers: () => {
    return request<Users>({
      url: "/users",
      method: "GET",
    });
  },

  getUserInfo: (userId: string) => {
    return request<UserInfo>({
      url: `/users/${userId}`,
      method: "GET",
    });
  },
};
```

You can also use these `request` functions directly in `axios`.

```ts
const usersRes = await axios(api.getUsers());

const userRes = await axios(api.getUserInfo("ID001"));
```

#### createRequestError

The `createRequestError` normalizes the error response. This function is used internally as well. The `isCancel` flag is returned, so you don't have to call **axios.isCancel** later on the promise catch block.

```ts
interface RequestError<T> {
  data?: T;
  message: string;
  code?: string | number;
  isCancel: boolean;
  original: AxiosError<T>;
}
```

## License

[MIT](./LICENSE)
