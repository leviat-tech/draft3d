import {
  MeshPhongMaterial,
  DoubleSide, Color, MeshBasicMaterial,
} from 'three';


export function createMaterial(color, opacity, isBasic = false) {
  const MaterialConstructor = isBasic ? MeshBasicMaterial : MeshPhongMaterial;

  return new MaterialConstructor({
    color,
    transparent: opacity < 1,
    opacity,
    side: DoubleSide,
  });
}

export function updateMaterial(object3d, color, opacity) {
  const { material } = object3d;
  const newColor = new Color(color);

  if (material && material.color.equals(newColor) && material.opacity === opacity) return;

  material?.dispose();
  object3d.material = createMaterial(color, opacity);
}
