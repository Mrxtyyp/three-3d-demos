<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import dat from "dat.gui/build/dat.gui.module";
import TWEEN from "@tweenjs/tween.js";

let scene, render, camera, controls;
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

  camera.position.set(0, 30, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  render = new THREE.WebGLRenderer();

  render.setSize(window.innerWidth, window.innerHeight);

  document.getElementById("renderBox").appendChild(render.domElement);
}

/**
 * 生成圆点
 */
function getSpriteMap() {
  const canvas = document.createElement("canvas");
  const size = 10;
  canvas.width = size * 2;
  canvas.height = size * 2;
  const c = canvas.getContext("2d");
  const gradient = c.createRadialGradient(size, size, 0, size, size, size);
  gradient.addColorStop(0.1, "rgba(0, 255, 255, 1)");
  c.fillStyle = gradient;
  //   c.fillStyle = "#008800";
  c.arc(size, size, size / 2, 0, Math.PI * 2);
  c.fill();

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 带小格子矩形
const geometry = new THREE.BoxGeometry(10, 10, 10, 10, 10, 10);
const spritePointList = [];
// 创建点阵盒子
function createBoxSprite() {
  const position = geometry.attributes.position;

  console.log(geometry);
  for (let i = 0; i < position.count; i++) {
    const vector = new THREE.Vector3();
    vector.fromBufferAttribute(position, i);
    spritePointList.push({
      x: vector.x,
      y: vector.y,
      z: vector.z,
    });
    // 生成随机坐标
    const x = THREE.MathUtils.randFloatSpread(100);
    const y = THREE.MathUtils.randFloatSpread(100);
    const z = THREE.MathUtils.randFloatSpread(100);
    position.setXYZ(i, x, y, z);
  }
  // 点材质
  const material = new THREE.PointsMaterial({ map: getSpriteMap() });
  // 通过矩形面生成点位
  const points = new THREE.Points(geometry, material);
  geometry.attributes.position.needsUpdate = true;
  console.log(points);
  scene.add(points);
}

const gui = new dat.GUI();
const options = {
  startAnimation: false,
};
gui.add(options, "startAnimation").onChange((val) => {
  console.log(val);
  if (val) {
    randomSpriteToGeomery();
  } else {
    geomerySpriteToRandom();
  }
});

let runAnimate = false,
  runAnimateCount = 0;

// 随机粒子变成正方体粒子
function randomSpriteToGeomery() {
  console.log("start", runAnimate);
  if (runAnimate) return;
  runAnimate = true;
  TWEEN.removeAll();
  const geometryPosition = geometry.attributes.position;
  for (let i = 0; i < geometryPosition.count; i++) {
    const pointPosition = {
      x: geometryPosition.getX(i),
      y: geometryPosition.getY(i),
      z: geometryPosition.getZ(i),
    };
    console.log(pointPosition, spritePointList[i]);
    new TWEEN.Tween(pointPosition)
      .to(spritePointList[i], 2000)
      .onUpdate(function () {
        // geometry.attributes.position.setXYZ(
        //   i,
        //   pointPosition.x,
        //   pointPosition.y,
        //   pointPosition.z
        // );
        // geometry.attributes.position.needsUpdate = true;
        geometryPosition.setXYZ(
          i,
          pointPosition.x,
          pointPosition.y,
          pointPosition.z
        );
        // 该标志位指明当前 attribute 已经被修改过，且需要再次送入 GPU 处理。当开发者改变了该队列的值，则标志位需要设置为 true。
        geometryPosition.needsUpdate = true;
      })
      .start()
      .onComplete(() => {
        runAnimateCount++;
        // 所有动画执行完成
        if (runAnimateCount >= geometryPosition.count) {
          runAnimate = false;
          runAnimateCount = 0;
        }
      });
  }
}

// 正方体粒子变随机粒子
function geomerySpriteToRandom() {
  if (runAnimate) return;
  runAnimate = true;
  TWEEN.removeAll();
  const geometryPosition = geometry.attributes.position;
  for (let i = 0; i < geometryPosition.count; i++) {
    const pointPosition = spritePointList[i];
    const randomPosition = {
      x: THREE.MathUtils.randFloatSpread(100),
      y: THREE.MathUtils.randFloatSpread(100),
      z: THREE.MathUtils.randFloatSpread(100),
    };
    new TWEEN.Tween(pointPosition)
      .to(randomPosition, 2000)
      .onUpdate(function () {
        geometryPosition.setXYZ(
          i,
          pointPosition.x,
          pointPosition.y,
          pointPosition.z
        );
        // 该标志位指明当前 attribute 已经被修改过，且需要再次送入 GPU 处理。当开发者改变了该队列的值，则标志位需要设置为 true。
        geometryPosition.needsUpdate = true;
      })
      .start()
      .onComplete(() => {
        runAnimateCount++;
        console.log(runAnimateCount);
        // 所有动画执行完成
        if (runAnimateCount >= geometryPosition.count) {
          runAnimate = false;
          runAnimateCount = 0;
        }
      });
  }
}

function init() {
  initBasic();

  createBoxSprite();

  // 响应式界面
  window.addEventListener("resize", resizeListener);
}

function resizeListener() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  render.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  // 让场景旋转
  scene.rotation.y += 0.01;
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
</template>

<route>
    {
      name: "随机粒子聚拢生成立方体粒子"
    }
</route>
