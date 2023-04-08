import type { App, Component, ComponentPublicInstance } from "vue";
import { createApp } from "vue";
import type { Component as ComponentV2 } from "vue2";
import Vue2 from "vue2";

export function mount<T extends Component>(
  Component: T,
  before?: (app: App) => void,
) {
  const el = document.createElement("div");
  const app = createApp(Component);

  if (before && typeof before === "function") {
    before(app);
  }

  const unmount = () => app.unmount();
  const comp = app.mount(el) as ComponentPublicInstance & {
    unmount: () => void;
  };
  comp.unmount = unmount;

  return comp;
}

export function mountVue2<T extends ComponentV2>(Component: T) {
  const app = new Vue2({
    render: (h) => h(Component),
  });
  const el = document.createElement("div");
  app.$mount(el);

  return app;
}
