import { defineConfig } from "vite";

const githubPagesBase = "/nordgold-hr-demo/";

export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? githubPagesBase : "/"
}));
