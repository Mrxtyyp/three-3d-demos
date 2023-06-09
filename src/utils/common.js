import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * 加载fbx模型
 * @param {*} url
 */
export const loadFbx = (url) => {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load(
      url,
      function (model) {
        resolve(model);
      },
      function () {},
      function (err) {
        reject(err);
      }
    );
  });
};

/**
 * 加载GLTF模型
 * @param {*} url
 * @returns
 */
export const loadGltf = (url) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        resolve(gltf);
      },
      function () {},
      (err) => {
        reject(err);
      }
    );
  });
};
