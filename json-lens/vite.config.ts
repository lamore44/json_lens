import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const astraEndpoint = env.VITE_ASTRA_ENDPOINT;

  return {
    plugins: [react(), tailwindcss()],
    server: astraEndpoint
      ? {
          proxy: {
            "/astra": {
              target: astraEndpoint,
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/astra/, ""),
            },
          },
        }
      : undefined,
  };
});
