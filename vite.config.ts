import { resolve } from "node:path";
import { defineConfig } from "vite";

const githubPagesBase = "/nordgold-hr-demo/";

export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? githubPagesBase : "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        heroMaskDemo: resolve(__dirname, "hero-mask-demo/index.html"),
        scrollAnimationsDemo: resolve(__dirname, "scroll-animations-demo/index.html")
      }
    }
  }
}));
