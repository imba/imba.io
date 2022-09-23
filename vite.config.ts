import { defineConfig } from "vite";
import { imba } from "vite-plugin-imba";
import GithubActionsReporter from "vitest-github-actions-reporter-temp";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
const target = ["es2020"]; // needed to support bigint
export default defineConfig({
  plugins: [
    visualizer({
      emitFile: true,
      file: "stats.html",
	//   template: "network"
    }),
    imba(),
  ],
  resolve: {
    alias: {
      "icons": path.resolve(__dirname, "./src/assets/icons/"),
      "codicons": path.resolve(__dirname, "./src/assets/codicons/"),
    },
    extensions: [".imba", ".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  optimizeDeps: {
    esbuildOptions: {
      target,
    },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
  build: {
    target,
    rollupOptions: {
      output: {
        manualChunks: {
          compiler: ['imba/compiler'],
		  imba: ['imba'],
		  ref: ['./data/reference.js'],
		  content: ['./data/content.json'],
        },
      },
    },
  },
  test: {
    globals: true,
    include: ["**/*.{test,spec}.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    includeSource: ["src/**/*.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    environment: "jsdom",
    setupFiles: ["./test/setup.imba"],
    reporters: process.env.GITHUB_ACTIONS
      ? new GithubActionsReporter()
      : "default",
  },
});
