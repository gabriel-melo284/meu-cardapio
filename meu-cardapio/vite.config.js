import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",           // garante paths absolutos em produção
  build: { outDir: "dist" }
});
