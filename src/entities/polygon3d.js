import { Mesh, EllipseCurve, Path } from 'three';

import { configureInteractivity } from '../utils/helpers';
import { createMaterial, updateMaterial } from '../utils/material';
import { createExtrudeGeometry, createPolygon } from '../utils/geometry';
import { defineEntity } from '../defineEntity';


function addHoleToShape(params, shape) {
  const { holes: { radius, position } } = params;

  if (radius) {
    const circle = new EllipseCurve(
      position[0], position[1],
      radius, radius,
      0, 2 * Math.PI,
      false,
      0,
    );

    shape.holes.push(new Path().setFromPoints(circle.getPoints(200)));
  }
}

export default defineEntity({
  name: 'polygon3d',
  parameters: {
    depth: { name: 'Depth', precision: 0.1, default: 1 },
    color: { name: 'Colour', type: 'color', default: '#6666aa' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
    holes: {
      name: 'Holes',
      default: {
        position: [0, 0],
        radius: 0,
      },
    },
    path: {
      name: 'Path',
      items: { type: 'point', precision: 0.1, default: [0, 0] },
      default: [
        [0, 0],
        [2, 0],
        [2, 2],
        [1.5, 2],
        [1.5, 1],
        [1.3, 1],
        [1.3, 2],
        [0.8, 2],
        [0, 0],
      ],
    },
  },
  render(params) {
    const { depth, color, opacity, path } = params;

    const shape = createPolygon(path);

    addHoleToShape(params, shape);

    const material = createMaterial(color, opacity);

    const geometry = createExtrudeGeometry(shape, depth);

    const mesh = new Mesh(geometry, material);

    configureInteractivity(mesh, params);

    return mesh;
  },
  update(object3d, newParams) {
    const { path, depth, color, opacity } = newParams;

    updateMaterial(object3d, color, opacity);

    const newShape = createPolygon(path);

    addHoleToShape(newParams, newShape);

    object3d.geometry?.dispose();
    object3d.geometry = createExtrudeGeometry(newShape, depth);

    configureInteractivity(object3d, newParams);
  },
});
