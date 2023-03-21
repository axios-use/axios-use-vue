import type { App, Component, ComponentPublicInstance } from "vue";
import { createApp } from "vue";

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
