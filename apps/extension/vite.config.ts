import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const extensionRoot = process.cwd();

function copyManifestPlugin(): Plugin {
  return {
    name: "copy-extension-manifest",
    closeBundle() {
      mkdirSync(resolve(extensionRoot, "dist"), { recursive: true });
      copyFileSync(resolve(extensionRoot, "manifest.json"), resolve(extensionRoot, "dist", "manifest.json"));
      copyFileSync(resolve(extensionRoot, "dist", "src", "popup", "popup.html"), resolve(extensionRoot, "dist", "popup.html"));
    }
  };
}

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  resolve: {
    alias: {
      "@chatgpt-codex-bridge/shared": resolve(extensionRoot, "../../packages/shared/src/index.ts")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(extensionRoot, "src/popup/popup.html"),
        serviceWorker: resolve(extensionRoot, "src/background/serviceWorker.ts")
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
