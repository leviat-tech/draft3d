import { CylinderGeometry, Mesh } from 'three';

import { configureInteractivity } from '../utils/helpers';
import { createMaterial, updateMaterial } from '../utils/material';


const radialAccuracy = 12;

export default {
  name: 'cylinder',
  parameters: {
    radius: { name: 'Radius', type: 'number' },
    radiusTop: { name: 'Radius Top', type: 'number', default: 2 },
    radiusBottom: { name: 'Radius Bottom', type: 'number', default: 2 },
    segments: { name: 'Segments', type: 'number', default: 24 },
    length: { name: 'Length', type: 'number', default: 5 },
    color: { name: 'Colour', type: 'color', default: '#6666cc' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
  },
  render(params) {
    const { radius, length, segments, color, opacity } = params;

    const radiusTop = radius || params.radiusTop;
    const radiusBottom = radius || params.radiusBottom;

    const material = createMaterial(color, opacity);

    const geometry = new CylinderGeometry(radiusTop, radiusBottom, length, segments);

    const mesh = new Mesh(geometry, material);

    configureInteractivity(mesh, params);

    return mesh;
  },
  update(object3d, newParams) {
    const {
      radius, length, color, opacity,
    } = newParams;

    const radiusTop = radius || newParams.radiusTop;
    const radiusBottom = radius || newParams.radiusBottom;

    updateMaterial(object3d, color, opacity);

    object3d.geometry?.dispose();
    object3d.geometry = new CylinderGeometry(radiusTop, radiusBottom, length, radialAccuracy);

    configureInteractivity(object3d, newParams);
  },
};
