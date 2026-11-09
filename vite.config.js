import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  server: { port: 3000, host: "0.0.0.0" },
  build: {
    target: "es2020",
    rollupOptions: { output: { manualChunks: { phaser: ["phaser"] } } },
  },
});
