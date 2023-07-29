<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";

import { loadGltf } from "../../utils/common";

let scene, render, camera, controls, firstPersonControls;

const clock = new THREE.Clock();

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

  camera.position.set(0, 1500, 7000);
  camera.lookAt(scene.position);

  render = new THREE.WebGLRenderer();

  render.setSize(window.innerWidth, window.innerHeight);
  // 设置像素比
  render.setPixelRatio(window.devicePixelRatio);
  // 设置背景颜色
  render.setClearColor(new THREE.Color(0x000000), 1);

  // 控制器
  //   controls = new OrbitControls(camera, render.domElement);

  //   const axesHelper = new THREE.AxesHelper(500);

  //   scene.add(axesHelper);

  firstPersonControls = new FirstPersonControls(camera, render.domElement);
  firstPersonControls.lookSpeed = 0.05;
  firstPersonControls.movementSpeed = 1000;
  firstPersonControls.lookVertical = false;
  firstPersonControls.activeLook = false;
  firstPersonControls.lookAt(scene.position);

  document.getElementById("renderBox").appendChild(render.domElement);
}

function initGreenGrassland() {
  const texture = new THREE.TextureLoader().load(
    "/static/grassHouse/grass.jpg"
  );
  //   横纵向都重复，分别重复5次
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  const plane = new THREE.PlaneGeometry(50000, 50000);
  const planeMertiral = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(plane, planeMertiral);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);
}

//创建灯光
const initLight = () => {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(-4, 8, 4);
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.4);
  hemisphereLight.position.set(0, 8, 0);
  scene.add(directionalLight);
  scene.add(hemisphereLight);
};

function initHouse() {
  //   scene.fog = new THREE.Fog(0xededed, 5000, 20000);
  //  地板
  initFloor();
  // 墙面
  const wall1 = initWall();
  wall1.position.set(-2500, 2500, 0);
  scene.add(wall1);
  // 墙面
  const wall2 = initWall();
  wall2.position.set(2500, 2500, 0);
  scene.add(wall2);
  // 背墙
  initBackendWall();
  // 门墙
  initFrontWall();

  // 门
  createDoor();
  // 窗
  createWindow();

  // 初始化屋顶
  initRoof("left");
  initRoof("right");
}

function initFloor() {
  const texture = new THREE.TextureLoader().load(
    "/static/grassHouse/floor1.jpeg"
  );
  //   横纵向都重复，分别重复5次
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  const plane = new THREE.PlaneGeometry(5000, 5000);
  const planeMertiral = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(plane, planeMertiral);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 5, 0);
  scene.add(mesh);
}

function initWall() {
  const shape = new THREE.Shape();
  shape.moveTo(-2500, 0);
  shape.lineTo(-2500, 2500);
  shape.lineTo(0, 2500);
  shape.lineTo(1250, 0);
  shape.lineTo(0, -2500);
  shape.lineTo(-2500, -2500);
  shape.lineTo(-2500, 0);
  const texture = new THREE.TextureLoader().load(
    "/static/grassHouse/wall1.jpeg"
  );
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(0.0005, 0.0005);
  const geometry = new THREE.ExtrudeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.z = Math.PI / 2;
  mesh.rotation.y = Math.PI / 2;
  return mesh;
}

function initBackendWall() {
  const shape = new THREE.Shape();
  shape.moveTo(-2500, 2500);
  shape.lineTo(2500, 2500);
  shape.lineTo(2500, 0);
  shape.lineTo(-2500, 0);
  shape.lineTo(-2500, 2500);
  const texture = new THREE.TextureLoader().load(
    "/static/grassHouse/wall1.jpeg"
  );
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(0.0005, 0.0005);
  const geometry = new THREE.ExtrudeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, -2500);
  scene.add(mesh);
}

function initFrontWall() {
  const shape = new THREE.Shape();
  shape.moveTo(-2500, 2500);
  shape.lineTo(2500, 2500);
  shape.lineTo(2500, 0);
  shape.lineTo(-2500, 0);
  shape.lineTo(-2500, 2500);

  const window = new THREE.Path();
  window.moveTo(300, 700);
  window.lineTo(1300, 700);
  window.lineTo(1300, 1600);
  window.lineTo(300, 1600);
  window.lineTo(300, 700);
  shape.holes.push(window);

  const door = new THREE.Path();
  door.moveTo(-2000, 0);
  door.lineTo(-2000, 1400);
  door.lineTo(-1200, 1400);
  door.lineTo(-1200, 0);
  door.lineTo(-2000, 0);
  shape.holes.push(door);

  const texture = new THREE.TextureLoader().load(
    "/static/grassHouse/wall1.jpeg"
  );
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(0.0005, 0.0005);
  const geometry = new THREE.ExtrudeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 2500);
  scene.add(mesh);
}

function createDoor() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, 1400);
  shape.lineTo(800, 1400);
  shape.lineTo(800, 0);
  shape.lineTo(0, 0);

  const hole = new THREE.Path();
  hole.moveTo(50, 0);
  hole.lineTo(50, 1350);
  hole.lineTo(750, 1350);
  hole.lineTo(750, 0);
  hole.lineTo(50, 0);
  shape.holes.push(hole);

  const extrudeGeometry = new THREE.ExtrudeGeometry(shape);

  var extrudeMaterial = new THREE.MeshBasicMaterial({ color: "silver" });

  var mesh = new THREE.Mesh(extrudeGeometry, extrudeMaterial);
  mesh.rotation.y = Math.PI * 2;
  mesh.position.set(-2000, 0, 2500);

  scene.add(mesh);

  return mesh;
}

function createWindow() {
  const window = new THREE.Shape();
  window.moveTo(0, 0);
  window.lineTo(1000, 0);
  window.lineTo(1000, 900);
  window.lineTo(0, 900);
  window.lineTo(0, 0);

  const hole = new THREE.Path();
  hole.moveTo(50, 50);
  hole.lineTo(950, 50);
  hole.lineTo(950, 850);
  hole.lineTo(50, 850);
  hole.lineTo(50, 50);
  window.holes.push(hole);

  const extrudeGeometry = new THREE.ExtrudeGeometry(window);

  var extrudeMaterial = new THREE.MeshBasicMaterial({ color: "silver" });

  var mesh = new THREE.Mesh(extrudeGeometry, extrudeMaterial);
  mesh.rotation.y = Math.PI * 2;
  mesh.position.set(300, 700, 2500);

  scene.add(mesh);

  return mesh;
}

// 初始化房顶
function initRoof(direction) {
  const texture = new THREE.TextureLoader().load("/static/grassHouse/roof.jpg");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  const geometry = new THREE.BoxGeometry(5500, 2900, 100);
  const meterial = new THREE.MeshBasicMaterial({ color: "gray" });
  const meterialMap = new THREE.MeshBasicMaterial({ map: texture });
  const faceAll = [
    meterial,
    meterial,
    meterial,
    meterial,
    meterial,
    meterialMap,
  ];
  const mesh = new THREE.Mesh(geometry, faceAll);
  if (direction === "left") {
    mesh.position.set(0, 3160, 1275);
    mesh.rotation.x = Math.PI / 2 + Math.PI / 6.8;
  } else {
    mesh.position.set(0, 3160, -1275);
    mesh.rotation.x = Math.PI - Math.PI / 2 - Math.PI / 6.8;
  }

  scene.add(mesh);
  return mesh;
}
function init() {
  initBasic();
  initLight();
  initGreenGrassland();
  initHouse();
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
  const delta = clock.getDelta();
  firstPersonControls.update(delta);
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
      name: "草地房屋"
    }
</route>
