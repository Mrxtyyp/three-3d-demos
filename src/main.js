import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import { createRouter, createWebHistory } from "vue-router";
// 这里就是vite-plugin-pages生成的路由信息，正常使用即可
import routes from "virtual:generated-pages";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).mount("#app");
