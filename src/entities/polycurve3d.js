import { Mesh } from 'three';

import LayerSet from '../utils/LayerSet';
import { setInteractivity } from '../utils/helpers';
import { createMaterial, updateMaterial } from '../utils/material';
import { createExtrudeGeometry, createPolyCurve } from '../utils/geometry';


export default {
  name: 'polycurve3d',
  parameters: {
    depth: { name: 'Depth', precision: 0.1, default: 1 },
    color: { name: 'Colour', type: 'color', default: '#6666aa' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
    path: {
      name: 'Path',
      items: { type: 'curve', precision: 0.1, default: [0, 0] },
      default: [[0, 0],
        [1, 0],
        [2, 0, 1.5, 0.5],
        [3, 0],
        [3, 2],
        [2, 3, 3, 3],
        [0, 3],
      ],
    },
  },
  render(params) {
    const { depth, color, opacity, path, layer } = params;

    const shape = createPolyCurve(path);
    const material = createMaterial(color, opacity);
    const geometry = createExtrudeGeometry(shape, depth);

    const mesh = new Mesh(geometry, material);

    setInteractivity(mesh, params);

    mesh.layerName = layer;

    LayerSet.addToLayer(layer, mesh);

    return mesh;
  },
  update(object3d, newParams) {
    const { path, depth, color, opacity, layer } = newParams;

    updateMaterial(object3d, color, opacity);

    const newShape = createPolyCurve(path);
    LayerSet.addToLayer(layer, object3d);

    object3d.geometry?.dispose();
    object3d.geometry = createExtrudeGeometry(newShape, depth);
  },
};
