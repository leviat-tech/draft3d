import {
  CylinderGeometry,
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

const radialAccuracy = 24;

export default {
  name: 'cylinder',
  parameters: {
    raduisTop: { name: 'Raduis Top', type: 'number', default: 2 },
    raduisBottom: { name: 'Raduis Bottom', type: 'number', default: 2 },
    length: { name: 'Length', type: 'number', default: 5 },
    color: { name: 'Colour', type: 'color', default: '#6666cc' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
  },
  render(params) {
    const { raduisTop, raduisBottom, length, color, opacity } = params;

    const material = createMaterial(color, opacity);

    const geometry = new CylinderGeometry(raduisTop, raduisBottom, length, radialAccuracy);

    return new Mesh(geometry, material);
  },
  update(object3d, newParams) {
    const { raduisTop, raduisBottom, length, color, opacity } = newParams;

    if (color) {
      object3d.material?.dispose();
      object3d.material.color = color;
      object3d.material = createMaterial(color, opacity);
    }

    object3d.geometry?.dispose();
    object3d.geometry = new CylinderGeometry(raduisTop, raduisBottom, length, radialAccuracy);
  },
};
