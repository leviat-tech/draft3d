import {
  MeshPhongMaterial,
  DoubleSide,
} from 'three';


export function createMaterial(color, opacity) {
  return new MeshPhongMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    side: DoubleSide,
  });
}

export function updateMaterial(object3d, color, opacity) {
  object3d.material?.dispose();
  object3d.material = createMaterial(color, opacity);
}
