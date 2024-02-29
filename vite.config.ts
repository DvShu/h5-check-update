import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "./",
		copyPublicDir: false,
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: resolve(__dirname, "src/main.ts"),
			name: "h5_check_update",
			// the proper extensions will be added
			fileName: "index",
			formats: ["es"],
		},
	},
});
