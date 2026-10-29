import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const port = Number(env.VITE_PORT) || 3001;
  const apiTarget =
    env.VITE_API_BASE_URL || env.VITE_API_URL || "http://localhost:5000";
  const basePath = env.VITE_BASE_PATH || "/";
  const chunkLimit = Number(env.VITE_CHUNK_SIZE_WARNING_LIMIT) || 1000;

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    server: {
      port,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: chunkLimit,
    },
  };
});

