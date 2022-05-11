import {
  Mesh,
  Shape,
} from 'three';
import { createMaterial, updateMaterial } from '../utils/material';
import { createExtrudeGeometry } from '../utils/geometry';


function createPolygon(path) {
  const shape = new Shape();

  shape.moveTo(...path[0]);

  path.slice(1).forEach((point) => {
    shape.lineTo(...point);
  });

  return shape;
}

export default {
  name: 'polygon3d',
  parameters: {
    depth: { name: 'Depth', precision: 0.1, default: 1 },
    color: { name: 'Colour', type: 'color', default: '#6666aa' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
    path: {
      name: 'Path',
      items: { type: 'point', precision: 0.1, default: [0, 0] },
      default: [
        [0, 0],
        [2, 0],
        [1, 1],
        [2, 2],
        [0, 2],
        [0, 0],
      ],
    },
  },
  render(params) {
    const { depth, color, opacity, path } = params;

    const shape = createPolygon(path);
    const material = createMaterial(color, opacity);
    const geometry = createExtrudeGeometry(shape, depth);

    return new Mesh(geometry, material);
  },
  update(object3d, newParams) {
    const { path, depth, color, opacity } = newParams;

    updateMaterial(object3d, color, opacity);

    const newShape = createPolygon(path);

    object3d.geometry?.dispose();
    object3d.geometry = createExtrudeGeometry(newShape, depth);
  },
};
