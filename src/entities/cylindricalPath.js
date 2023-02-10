import {
  ExtrudeGeometry,
  Mesh,
} from 'three';
import { createMaterial, updateMaterial } from '../utils/material';
import { create3dPath, createCircle } from '../utils/geometry';


export default {
  name: 'cylindricalPath',
  parameters: {
    radius: { name: 'Radius', precision: 0.1, default: 0.2 },
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
        [0, 0.5],
      ],
    },
    closed: { name: 'Closed', type: 'boolean', default: true },
    steps: { name: 'steps', precision: 10, default: 100, min: 10 },
  },
  render(params) {
    const {
      radius, color, opacity, path, closed, steps,
    } = params;
    const material = createMaterial(color, opacity);

    const route = create3dPath(path, closed);
    const extrudeSettings = {
      steps,
      extrudePath: route,
    };
    const shape = createCircle(radius);
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);

    const mesh = new Mesh(geometry, material);

    return mesh;
  },
  update(object3d, newParams) {
    const {
      radius, color, opacity, path, closed, steps,
    } = newParams;

    updateMaterial(object3d, color, opacity);

    const route = create3dPath(path, closed);
    const extrudeSettings = {
      steps,
      extrudePath: route,
    };
    const shape = createCircle(radius);
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);

    object3d.geometry?.dispose();
    object3d.geometry = geometry;
  },
};
