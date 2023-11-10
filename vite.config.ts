import { resolve } from "path";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const externals = {
  vue: "Vue",
  axios: "Axios",
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    target: ["es2015"],
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
      },
    },
    rollupOptions: {
      external: Object.keys(externals),
      output: [
        {
          format: "cjs",
          dir: "lib",
          preserveModules: true,
        },
        {
          format: "es",
          dir: "esm",
          preserveModules: true,
        },
        {
          globals: externals,
          format: "umd",
          dir: "dist",
          name: "AxiosUseVue",
          preserveModules: false,
          entryFileNames: "axios-use-vue.umd.js",
          sourcemap: true,
        },
      ],
    },
  },
});
