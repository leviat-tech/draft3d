import { CylinderGeometry, Mesh } from 'three';

import LayerSet from '../utils/LayerSet';
import { setInteractivity } from '../utils/helpers';
import { createMaterial, updateMaterial } from '../utils/material';


const radialAccuracy = 24;

export default {
  name: 'cylinder',
  parameters: {
    radiusTop: { name: 'radius Top', type: 'number', default: 2 },
    radiusBottom: { name: 'radius Bottom', type: 'number', default: 2 },
    length: { name: 'Length', type: 'number', default: 5 },
    color: { name: 'Colour', type: 'color', default: '#6666cc' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
  },
  render(params) {
    const {
      radiusTop, radiusBottom, length, color, opacity, layer,
    } = params;

    const material = createMaterial(color, opacity);

    const geometry = new CylinderGeometry(radiusTop, radiusBottom, length, radialAccuracy);

    const mesh = new Mesh(geometry, material);

    setInteractivity(mesh, params);

    mesh.layerName = layer;

    LayerSet.addToLayer(layer, mesh);

    return mesh;
  },
  update(object3d, newParams) {
    const {
      radiusTop, radiusBottom, length, color, opacity, layer,
    } = newParams;

    updateMaterial(object3d, color, opacity);
    LayerSet.addToLayer(layer, object3d);

    object3d.geometry?.dispose();
    object3d.geometry = new CylinderGeometry(radiusTop, radiusBottom, length, radialAccuracy);
  },
};
