import * as THREE from "three";
import { asyncLoadImg } from "../../utils/common";

// 立方体的长宽高
const CubeConfig = {
  width: 100,
  height: 50,
  length: 100,
};

export const getCubeConfig = () => CubeConfig;

/**
 * 创建一个游戏运动小人
 * @returns THREE.Object3D 对象
 */
export const createPlayer = () => {
  // 头部
  const geometry = new THREE.SphereGeometry(10, 32, 32);
  const texture = new THREE.TextureLoader().load("/static/jump/head.png");
  const material = new THREE.MeshLambertMaterial({ map: texture });
  const head = new THREE.Mesh(geometry, material);
  head.castShadow = true;
  head.position.set(0, 70, 0);
  head.castShadow = true;

  // 身体
  const geometryBody = new THREE.CylinderGeometry(4, 10, 32, 32);
  const textureBody = new THREE.TextureLoader().load("/static/jump/bottom.png");
  const materialBody = new THREE.MeshLambertMaterial({ map: textureBody });
  const body = new THREE.Mesh(geometryBody, materialBody);
  body.castShadow = true;
  body.position.set(0, 40, 0);
  body.castShadow = true;

  // 组合成一个three 3d对象
  const group = new THREE.Object3D();
  group.add(head, body);

  return group;
};

const centerPoint = {
  x: 0,
  z: 0,
  direction: 1,
};

export const getCenterPoint = () => centerPoint;

const lastBoxPosition = {
  x: 150,
  z: 0,
  direction: 1,
};

export const getLastBoxPosition = () => lastBoxPosition;

/**
 * 随机创建一个盒子方向随机
 * @returns
 */
export const createRandomBox = async () => {
  centerPoint.x = lastBoxPosition.x;
  centerPoint.z = lastBoxPosition.z;
  centerPoint.direction = lastBoxPosition.direction;
  const index = Math.floor(Math.random() * 4);
  // 方向
  const direction = Math.floor(Math.random() * 2);
  const distance = 100 + (1 + Math.floor(Math.random() * 7)) * 20; //140~380
  if (direction === 1) {
    lastBoxPosition.x += distance;
  } else {
    lastBoxPosition.z += distance;
  }
  lastBoxPosition.direction = direction;
  return await randomBox(index, lastBoxPosition.x, lastBoxPosition.z);
};

export const randomBox = async (index, x, z) => {
  console.info(index, x, z);
  let box;
  switch (index) {
    case 0:
      box = await pureColorIconBox(
        0x00ff00,
        "front",
        "/static/jump/game.png",
        30,
        x,
        z
      );
      break;
    case 1:
      box = await pureColorIconBox(
        0xff6600,
        "front",
        "/static/jump/game.png",
        30,
        x,
        z
      );
      break;
    case 2:
      box = await chartletBox("/static/jump/bag.png", x, z);
      break;
    case 3:
      box = await pureColorIconBox(
        0xf64850,
        "front",
        "/static/jump/money.png",
        30,
        x,
        z
      );
      break;
    case 4:
      box = await pureColorIconBox(
        0x8e8e8e,
        "top",
        "/static/jump/disk.png",
        90,
        x,
        z
      );
      break;
  }

  return box;
};

/**
 * 纯色正方体+居中正方形图标
 * @param {*} color 立方体颜色
 * @param {*} position 图标位置 front top
 * @param {*} iconSize 图标大小
 * @param {*} x x坐标
 * @param {*} z z坐标
 * @returns
 */
export const pureColorIconBox = async (
  color,
  position,
  iconPath,
  iconSize,
  x = 0,
  z = 0
) => {
  if (iconSize > 100) return null;

  const loadImg = await asyncLoadImg(iconPath);
  var canvas = document.createElement("canvas");
  if (position === "top") {
    canvas.width = 100;
    canvas.height = 100;
  } else {
    canvas.width = 100;
    canvas.height = 50;
  }

  var ctx = canvas.getContext("2d");
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `#${("000000" + color.toString(16)).slice(-6)}`;
  ctx.fill();
  // 计算绘画起点
  const iconStartX = (canvas.width - iconSize) / 2;
  const iconStartY = (canvas.height - iconSize) / 2;
  ctx.drawImage(loadImg, iconStartX, iconStartY, iconSize, iconSize);

  const texture = new THREE.CanvasTexture(canvas);
  const planeGeometry = new THREE.PlaneGeometry(canvas.width, canvas.height);
  const planeMaterial = new THREE.MeshLambertMaterial({ map: texture });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  const geometry = new THREE.BoxGeometry(
    CubeConfig.width,
    CubeConfig.height,
    CubeConfig.length
  );
  const material = new THREE.MeshLambertMaterial({
    color: color,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, 0, z);

  if (position === "top") {
    plane.position.set(x, 25.1, z);
    plane.rotation.x = -Math.PI / 2;
    plane.rotation.z = -Math.PI / 2;
  } else {
    plane.position.set(x - 50.1, 0, z);
    plane.rotation.y = -Math.PI / 2;
  }

  const group = new THREE.Object3D();
  group.add(cube, plane);

  return group;
};

/**
 * 贴图box盒子
 * @param {*} img
 */
export const chartletBox = (img, x, z) => {
  return new Promise((resolve, reject) => {
    const texture = new THREE.TextureLoader().load(img);
    const geometry = new THREE.BoxGeometry(
      CubeConfig.width,
      CubeConfig.height,
      CubeConfig.length
    );
    const material = new THREE.MeshLambertMaterial({
      map: texture,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, 0, z);
    resolve(cube);
  });
};
