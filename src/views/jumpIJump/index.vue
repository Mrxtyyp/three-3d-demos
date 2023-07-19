<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadGltf } from "../../utils/common";

import {
  createPlayer,
  pureColorIconBox,
  chartletBox,
  getLastBoxPosition,
  createRandomBox,
  getCenterPoint,
} from "./common";
import { pointInRange } from "./utils";

const gameStep = ref(0);
const showGameOverBox = ref(false);

let scene, render, camera, controls, planeMesh;

let player, waitingAnimate;
/**
 * 初始化常规配置
 */
function initBasic() {
  scene = new THREE.Scene();

  const width = document.getElementById("renderBox").clientWidth;
  const height = document.getElementById("renderBox").clientHeight;

  camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    -1000,
    2000
  );
  scene.add(camera);

  //   camera = new THREE.PerspectiveCamera(
  //     70,
  //     window.innerWidth / window.innerHeight,
  //     1,
  //     100000
  //   );

  camera.position.set(-500, 800, -500);
  camera.rotation.set(0, 0, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  render = new THREE.WebGLRenderer();

  render.setSize(window.innerWidth, window.innerHeight);
  // 设置像素比
  render.setPixelRatio(window.devicePixelRatio);
  // 设置背景颜色
  render.setClearColor(new THREE.Color(0x000000), 1);

  // 控制器  开启控制器之后，切换相机lookAt会失效 ****** 试了半天才发现
  //   controls = new OrbitControls(camera, render.domElement);
  //   controls.maxPolarAngle = Math.PI / 2;

  //   const axesHelper = new THREE.AxesHelper(500);

  //   scene.add(axesHelper);

  document.getElementById("renderBox").appendChild(render.domElement);
}

let directionalLight, hemisphereLight;
//创建灯光
const initLight = () => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  scene.add(directionalLight);
};

async function initBox() {
  // 初始化地板
  const plane = new THREE.PlaneGeometry(5000, 5000);
  const material = new THREE.MeshLambertMaterial({ color: 0x8797a4 });
  planeMesh = new THREE.Mesh(plane, material);
  planeMesh.rotation.x = -Math.PI / 2;
  planeMesh.position.set(0, -25, 0);
  scene.add(planeMesh);

  const cube1 = await pureColorIconBox(
    0x00ff00,
    "front",
    "/static/jump/game.png",
    30,
    0,
    0
  );
  const cube2 = await pureColorIconBox(
    0xff6600,
    "front",
    "/static/jump/game.png",
    30,
    150,
    0
  );
  scene.add(cube1);
  scene.add(cube2);

  //   //   全身背包图案盒子
  //   const cube3 = await chartletBox("/static/jump/bag.png", 150, 150);
  //   scene.add(cube3);

  //   //   红色金币盒子
  //   const cube4 = await pureColorIconBox(
  //     0xf64850,
  //     "front",
  //     "/static/jump/money.png",
  //     30,
  //     300,
  //     150
  //   );
  //   scene.add(cube4);

  //   const cube5 = await pureColorIconBox(
  //     0x8e8e8e,
  //     "top",
  //     "/static/jump/disk.png",
  //     90,
  //     300,
  //     300
  //   );
  //   scene.add(cube5);
}

function initUser() {
  player = createPlayer();
  scene.add(player);
}

let startTime;
/**
 * player 由静到动的过渡过程
 */
function toBeRunWaiting() {
  const option = {
    py: player.children[0].position.y,
    sx: player.children[1].scale.x,
    sy: player.children[1].scale.y,
    sz: player.children[1].scale.z,
  };
  waitingAnimate = new TWEEN.Tween(option)
    .to(
      {
        py: 50,
        sx: 1.5,
        sy: 0.6,
        sz: 1.5,
      },
      1200
    )
    .onUpdate(function (obj) {
      player.children[0].position.y = obj.py;
      player.children[1].scale.x = obj.sx;
      player.children[1].scale.y = obj.sy;
      player.children[1].scale.z = obj.sz;
      player.children[1].position.y = 25 + (obj.sy - 0.6) * 32;
    })
    .interpolation(TWEEN.Interpolation.Bezier)
    .start();

  startTime = new Date().getTime();
}

function runWaitingReset() {
  waitingAnimate.stop();
  const endTime = new Date().getTime();
  const jumpDistance =
    (endTime - startTime) / 100 <= 1
      ? 20
      : 50 + Math.round((endTime - startTime) / 100) * 20;
  jump(jumpDistance);
}

function jump(jumpDistance) {
  console.info(jumpDistance);
  // 人先恢复原样
  const option = {
    py: player.children[0].position.y,
    sx: player.children[1].scale.x,
    sy: player.children[1].scale.y,
    sz: player.children[1].scale.z,
    cy: 25,
  };
  const animate1 = new TWEEN.Tween(option)
    .to(
      {
        py: 70,
        sx: 1,
        sy: 1,
        sz: 1,
        cy: 40,
      },
      50
    )
    .onUpdate(function (obj) {
      player.children[0].position.y = obj.py;
      player.children[1].scale.x = obj.sx;
      player.children[1].scale.y = obj.sy;
      player.children[1].scale.z = obj.sz;
      player.children[1].position.y = obj.cy;
    })
    .interpolation(TWEEN.Interpolation.Bezier);

  const lastBoxPosition = getLastBoxPosition();
  const option1 = {
    x: player.position.x,
    y: 25,
    z: player.position.z,
  };
  let animate2, toOption;
  //   横纵向跳跃
  if (lastBoxPosition.direction === 1) {
    toOption = {
      x: [
        player.position.x + jumpDistance * 0.5,
        player.position.x + jumpDistance,
      ],
      y: [150, 0],
      z: [player.position.z, player.position.z],
    };
  } else {
    toOption = {
      x: [player.position.x, player.position.x],
      y: [150, 0],
      z: [
        player.position.z + jumpDistance * 0.5,
        player.position.z + jumpDistance,
      ],
    };
  }

  animate2 = new TWEEN.Tween(option1)
    .to(toOption, 500)
    .onUpdate((obj) => {
      player.position.x = obj.x;
      player.position.y = obj.y;
      player.position.z = obj.z;
    })
    .onComplete(async () => {
      const status = pointInRange(player.position.x, player.position.z);
      console.info("jump finish === ", status);
      if (status) {
        const randomBox = await createRandomBox();
        gameStep.value++;
        scene.add(randomBox);
        adjustCamera();
      } else {
        console.info("game over");
        showGameOverBox.value = true;
      }
    })
    .interpolation(TWEEN.Interpolation.Bezier);
  animate1.chain(animate2);
  animate1.start();
}

// 调整相机位置
function adjustCamera() {
  const centerP = getCenterPoint();
  console.info(centerP);
  let animate;
  if (centerP.direction === 1) {
    const distance = centerP.x - planeMesh.position.x;
    animate = new TWEEN.Tween({
      x: planeMesh.position.x,
      cameraX: camera.position.x,
    })
      .to(
        {
          x: centerP.x,
          cameraX: camera.position.x + distance,
        },
        500
      )
      .onUpdate((obj) => {
        planeMesh.position.x = obj.x;
        camera.position.x = obj.cameraX;
        camera.lookAt(obj.x, 0, centerP.z);
      });
  } else {
    const distance = centerP.z - planeMesh.position.z;
    animate = new TWEEN.Tween({
      z: planeMesh.position.z,
      cameraZ: camera.position.z,
    })
      .to(
        {
          z: centerP.z,
          cameraZ: camera.position.z + distance,
        },
        500
      )
      .onUpdate((obj) => {
        planeMesh.position.z = obj.z;
        camera.position.z = obj.cameraZ;
        camera.lookAt(centerP.x, 0, obj.z);
      });
  }

  animate.start();
}

// 重置游戏
function resetGame() {
  console.info(scene.children);
  //   cene.children.forEach((item) => {
  //     if (item.isObject3D) {
  //       scene.remove(item);
  //     }
  //   });
  location.reload();
}

function init() {
  initBasic();

  initLight();

  initUser();

  initBox();

  document
    .getElementById("renderBox")
    .addEventListener("mousedown", function () {
      toBeRunWaiting();
    });

  document.getElementById("renderBox").addEventListener("mouseup", function () {
    runWaitingReset();
  });

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
  //   controls.update();
  TWEEN.update();
  render.render(scene, camera);
  requestAnimationFrame(animate);
}

onMounted(() => {
  init();
  animate();
});
</script>

<template>
  <div id="renderBox"></div>
  <div class="result" v-if="showGameOverBox">
    <div>
      <p>本次得分</p>
      <h3>{{ gameStep }}</h3>

      <div class="restart" @click="resetGame()">重新开始</div>
    </div>
  </div>
</template>

<style>
.result {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
}
.result p {
  font-size: 20px;
}
.result h3 {
  font-size: 40px;
  font-weight: bold;
}
.result .restart {
  padding: 10px 20px;
  border-radius: 10px;
  background-color: #ffffff;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
}
</style>

<route>
    {
      name: "跳一跳小游戏"
    }
</route>
