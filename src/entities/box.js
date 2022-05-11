import {
  BoxGeometry,
  DoubleSide,
  MeshPhongMaterial,
  Mesh,
} from 'three';


function createMaterial(color, opacity) {
  return new MeshPhongMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    side: DoubleSide,
  });
}

export default {
  name: 'box',
  parameters: {
    dimensions: { name: 'Dimensions', type: 'dimension', default: [2, 2, 2] },
    color: { name: 'Colour', type: 'color', default: '#6666cc' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
  },
  render(params) {
    const { dimensions, color, opacity } = params;

    const material = createMaterial(color, opacity);

    const geometry = new BoxGeometry(...dimensions);

    return new Mesh(geometry, material);
  },
  update(object3d, newParams) {
    const { dimensions, color, opacity } = newParams;

    if (color) {
      object3d.material?.dispose();
      object3d.material.color = color;
      object3d.material = createMaterial(color, opacity);
    }

    object3d.geometry?.dispose();
    object3d.geometry = new BoxGeometry(...dimensions);
  },
};
