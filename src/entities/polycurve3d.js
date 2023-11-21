import { Mesh } from 'three';

import { configureInteractivity } from '../utils/helpers';
import { createMaterial } from '../utils/material';
import { createExtrudeGeometry, createPolyCurve } from '../utils/geometry';
import { defineEntity } from '../defineEntity';

import { CSG } from 'three-csg-ts';

export default defineEntity({
  name: 'polycurve3d',
  parameters: {
    depth: { name: 'Depth', precision: 0.1, default: 1 },
    color: { name: 'Colour', type: 'color', default: '#6666aa' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
    path: {
      name: 'Path',
      items: { type: 'curve', precision: 0.1, default: [0, 0] },
      default: [
        [0, 0],
        [1, 0],
        [2, 0, 1.5, 0.5],
        [3, 0],
        [3, 2],
        [2, 3, 3, 3],
        [0, 3],
      ],
    },
    cutouts: { name: 'Cutouts', default: [] },
  },
  render(params) {
    const { depth, color, opacity, path, cutouts } = params;

    const shape = createPolyCurve(path);
    const material = createMaterial(color, opacity);
    const geometry = createExtrudeGeometry(shape, depth);

    const mesh = new Mesh(geometry, material);

    const result = cutouts?.reduce((acc, cutout) => {
      if (cutout && cutout?.isMesh) {
        acc.updateMatrix();
        cutout.updateMatrix();

        acc = CSG.subtract(acc, cutout);

        return acc;
      }
    }, mesh) || mesh;

    configureInteractivity(result, params);

    return result;
  },
});
