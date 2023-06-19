import { BoxGeometry, Mesh } from 'three';

import { configureInteractivity } from '../utils/helpers';
import { createMaterial, updateMaterial } from '../utils/material';
import defineEntity from '../defineEntity.js';


export default defineEntity({
  name: 'box',
  parameters: {
    dimensions: { name: 'Dimensions', type: 'dimension', default: [2, 2, 2] },
    color: { name: 'Colour', type: 'color', default: '#6666cc' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
  },
  render(params) {
    const { dimensions, color, opacity } = params;

    const material = createMaterial(color, opacity);

    const geometry = new BoxGeometry(...dimensions);

    const mesh = new Mesh(geometry, material);

    configureInteractivity(mesh, params);

    return mesh;
  },
  update(object3d, newParams) {
    const { dimensions, color, opacity } = newParams;

    if (color) {
      updateMaterial(object3d, color, opacity);
    }

    object3d.geometry?.dispose();
    object3d.geometry = new BoxGeometry(...dimensions);

    configureInteractivity(object3d, newParams);
  },
});
