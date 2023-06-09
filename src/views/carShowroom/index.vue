<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadGltf } from "../../utils/common";

let scene, render, camera, controls;

// 车身颜色数组
const colorAry = [
  "rgb(216, 27, 67)",
  "rgb(142, 36, 170)",
  "rgb(81, 45, 168)",
  "rgb(48, 63, 159)",
  "rgb(30, 136, 229)",
  "rgb(0, 137, 123)",
  "rgb(67, 160, 71)",
  "rgb(251, 192, 45)",
  "rgb(245, 124, 0)",
  "rgb(230, 74, 25)",
  "rgb(233, 30, 78)",
  "rgb(156, 39, 176)",
  "rgb(0, 0, 0)",
];
/**
 * 初始化常规配置
 */
function initBasic() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    100000
  );

  camera.position.set(500, 500, 500);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  render = new THREE.WebGLRenderer();

  render.setSize(window.innerWidth, window.innerHeight);
  // 设置像素比
  render.setPixelRatio(window.devicePixelRatio);
  // 设置背景颜色
  render.setClearColor(new THREE.Color(0x000000), 1);

  // 控制器
  controls = new OrbitControls(camera, render.domElement);
  // 阻尼惯性
  //   controls.enableDamping = true;
  controls.autoRotate = true;

  document.getElementById("renderBox").appendChild(render.domElement);
}

let directionalLight, hemisphereLight;
//创建灯光
const initLight = () => {
  directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(-4, 8, 4);
  hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.4);
  hemisphereLight.position.set(0, 8, 0);
  scene.add(directionalLight);
  scene.add(hemisphereLight);
};

async function initCar() {
  const model = await loadGltf("/static/model/tesla/scene.gltf");
  scene.add(model.scene);
}

//开始自动转动
const startAutoRotate = () => {
  controls.autoRotate = true;
};
//停止转动
const stopAutoRotate = () => {
  controls.autoRotate = false;
};

const setCarColor = (color) => {
  const currentColor = new THREE.Color(color);
  scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("door_")) {
        child.material.color.set(currentColor);
      }
    }
  });
};

function init() {
  initBasic();

  initLight();

  initCar();

  // 响应式界面
  window.addEventListener("resize", resizeListener);
}

function resizeListener() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  render.setSize(window.innerWidth, window.innerHeight);
  // 设置像素比
  render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function animate() {
  controls.update();
  render.render(scene, camera);
  requestAnimationFrame(animate);
}

onMounted(() => {
  init();
  animate();
});
</script>

<template>
  <div id="renderBox">
    <div class="controlBtn">
      <div>
        <button @click="startAutoRotate()">开始旋转</button>
        <button @click="stopAutoRotate()">停止</button>
      </div>
      <div class="colors">
        <div
          @click="setCarColor(item)"
          v-for="item in colorAry"
          :key="item"
          :style="{ backgroundColor: item }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style>
.controlBtn {
  position: fixed;
  width: 100%;
  bottom: 0;
  left: 0;
  padding: 10px;
}
.controlBtn button {
  margin: 0 10px;
}

.colors {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 20px 0;
}

.colors div {
  width: 20px;
  height: 20px;
  margin: 5px;
  cursor: pointer;
}
</style>

<route>
    {
      name: "汽车展厅"
    }
</route>
