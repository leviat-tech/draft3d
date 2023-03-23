import {
  ExtrudeGeometry,
  Mesh,
} from 'three';
import { createMaterial, updateMaterial } from '../utils/material';
import { create3dPath, createCircle } from '../utils/geometry';


// Ensures cylinder renders smoothly
const curveSegments = 64;

export default {
  name: 'cylindricalPath',
  parameters: {
    tension: { name: 'tension', default: 0.5 },
    curveType: { name: 'curveType', default: 'catmullrom' },
    radius: { name: 'Radius', precision: 0.1, default: 0.2 },
    closed: { name: 'Closed', type: 'boolean', default: true },
    color: { name: 'Colour', type: 'color', default: '#6666aa' },
    steps: { name: 'steps', precision: 10, default: 100, min: 10 },
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
  },
  render(params) {
    const {
      radius, color, opacity, path, closed, steps, curveType, tension,
    } = params;
    const material = createMaterial(color, opacity);

    const route = create3dPath(path, closed, curveType, tension);

    const extrudeSettings = {
      curveSegments,
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
      radius, color, opacity, path, closed, steps, curveType, tension,
    } = newParams;

    updateMaterial(object3d, color, opacity);

    const route = create3dPath(path, closed, curveType, tension);
    const extrudeSettings = {
      curveSegments,
      steps,
      extrudePath: route,
    };
    const shape = createCircle(radius);
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);

    object3d.geometry?.dispose();
    object3d.geometry = geometry;
  },
};
