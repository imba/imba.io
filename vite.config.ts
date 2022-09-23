import { imba } from "vite-plugin-imba";
import { defineConfig } from "vite";
import GithubActionsReporter from "vitest-github-actions-reporter-temp";
import path from "path";

export default defineConfig({
  plugins: [imba()],
  resolve: {
	alias: {
		"icons": path.resolve(__dirname, "./src/assets/icons/"),
		"codicons": path.resolve(__dirname, "./src/assets/codicons/"),
	},
    extensions: [ '.imba', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  define: {
    "import.meta.vitest": "undefined",
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
