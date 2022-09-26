import {
  BoxGeometry,
  Mesh,
} from 'three';
import { createMaterial, updateMaterial } from '../utils/material';

import LayerSet from '../utils/LayerSet';


export default {
  name: 'box',
  parameters: {
    dimensions: { name: 'Dimensions', type: 'dimension', default: [2, 2, 2] },
    color: { name: 'Colour', type: 'color', default: '#6666cc' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
    layer: { name: 'Layer', type: 'string', default: 'default' },
  },
  render(params) {
    const { dimensions, color, opacity, layer } = params;

    const material = createMaterial(color, opacity);

    const geometry = new BoxGeometry(...dimensions);

    const mesh = new Mesh(geometry, material);
    LayerSet.addToLayer(layer, mesh);
    return mesh;
  },
  update(object3d, newParams) {
    const { dimensions, color, opacity, layer } = newParams;

    if (color) {
      updateMaterial(object3d, color, opacity);
    }
    LayerSet.addToLayer(layer, object3d);

    object3d.geometry?.dispose();
    object3d.geometry = new BoxGeometry(...dimensions);
  },
};
