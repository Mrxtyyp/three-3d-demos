import { getCubeConfig, getLastBoxPosition } from "./common";

/**
 * 检查当前位置在不在区间中
 * @param {*} x
 * @param {*} z
 * @returns boolean true false
 */
export const pointInRange = (x, z) => {
  const lastP = getLastBoxPosition();
  const cubeConf = getCubeConfig();
  return isInRange(
    {
      x,
      z,
    },
    {
      minX: lastP.x - cubeConf.width / 2,
      maxX: lastP.x + cubeConf.width / 2,
      minZ: lastP.z - cubeConf.length / 2,
      maxZ: lastP.z + cubeConf.length / 2,
    }
  );
};

function isInRange(point, range) {
  const { x, z } = point;
  const { minX, minZ, maxX, maxZ } = range;
  return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
}
