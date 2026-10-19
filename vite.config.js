
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5174,
  },

  build: {
    chunkSizeWarningLimit: 1000,

    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/]react(?:-dom)?[\\/]/,
            },
            {
              name: "mui-vendor",
              test: /node_modules[\\/]@mui[\\/]/,
            },
          ],
        },
      },
    },
  },
});
