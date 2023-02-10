import { Mesh } from 'three';

import LayerSet from '../utils/LayerSet';
import { configureInteractivity } from '../utils/helpers';
import { createMaterial, updateMaterial } from '../utils/material';
import { createExtrudeGeometry, createPolygon } from '../utils/geometry';


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
    const { depth, color, opacity, path, layer } = params;

    const shape = createPolygon(path);
    const material = createMaterial(color, opacity);
    const geometry = createExtrudeGeometry(shape, depth);

    const mesh = new Mesh(geometry, material);

    configureInteractivity(mesh, params);

    LayerSet.addToLayer(layer, mesh);

    return mesh;
  },
  update(object3d, newParams) {
    const { path, depth, color, opacity, layer } = newParams;

    updateMaterial(object3d, color, opacity);

    const newShape = createPolygon(path);
    LayerSet.addToLayer(layer, object3d);

    object3d.geometry?.dispose();
    object3d.geometry = createExtrudeGeometry(newShape, depth);

    configureInteractivity(object3d, newParams);
  },
};
