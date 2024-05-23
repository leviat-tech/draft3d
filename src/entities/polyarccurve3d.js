import { Mesh } from 'three';

import { CSG } from 'three-csg-ts';
import { configureInteractivity } from '../utils/helpers';
import { createMaterial } from '../utils/material';
import { createExtrudeGeometry, createPolyArcCurve } from '../utils/geometry';
import { defineEntity } from '../defineEntity';


export default defineEntity({
  name: 'polyarccurve3d',
  parameters: {
    depth: { name: 'Depth', precision: 0.1, default: 1 },
    color: { name: 'Colour', type: 'color', default: '#6666aa' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
    path: {
      name: 'Path',
      items: { type: 'curve', precision: 0.1, default: [0, 0] },
      default: [
        [0.5, 0, 0],
        [2.5, 0, 0.414213562373095],
        [3, 0.5, 0],
        [3, 1.5, -0.414213562373095],
        [2.5, 2, 0],
        [0.5, 2, -2.414213562373095],
        [0, 1.5, 0],
        [0, 0.5, 2.414213562373095],
      ],
    },
    cutouts: { name: 'Cutouts', default: [] },
  },
  render(params) {
    const { depth, color, opacity, path, cutouts } = params;

    const shape = createPolyArcCurve(path);
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
