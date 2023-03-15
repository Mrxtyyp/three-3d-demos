import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Pages({
      // 自动读取src/views下的vue文件，生成路由信息，默认路由路径'/‘
      dirs: [{ dir: "src/views", baseRoute: "/" }],
      // 异步方式加载路由组件
      importMode: "async",
    }),
  ],
});
