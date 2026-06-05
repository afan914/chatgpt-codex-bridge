import { resolve } from "node:path";
import { defineConfig } from "vite";

const extensionRoot = process.cwd();

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(extensionRoot, "src/content/index.ts"),
      name: "ChatGPTCodexBridgeContentScript",
      formats: ["iife"],
      fileName: () => "content.js"
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
