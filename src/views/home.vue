<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

const demosRoutes = computed(() => {
  return router.getRoutes().filter((i) => i.path !== "/home");
});

const goRouter = (url) => {
  router.push(url);
};
</script>

<template>
  <h1>ThreeJs demos</h1>
  <div class="list-wrap">
    <ul class="list">
      <li
        v-for="item in demosRoutes"
        :key="item.path"
        @click="goRouter(item.path)"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.list-wrap {
  text-align: left;
}
.list {
  display: inline-block;
}
.list li {
  cursor: pointer;
}
</style>
