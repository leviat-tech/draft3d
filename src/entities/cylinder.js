import { CylinderGeometry, Mesh } from 'three';
import { configureInteractivity } from '../utils/helpers';
import { createMaterial, updateMaterial } from '../utils/material';
import { defineEntity } from '../defineEntity';


function getRadius(params) {
  const hasRadiusProp = typeof params.radius === 'number';

  return {
    radiusTop: hasRadiusProp ? params.radius : params.radiusTop,
    radiusBottom: hasRadiusProp ? params.radius : params.radiusBottom,
  };
}

export default defineEntity({
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
    const { length, segments, color, opacity } = params;
    const { radiusTop, radiusBottom } = getRadius(params);

    const material = createMaterial(color, opacity);
    const geometry = new CylinderGeometry(radiusTop, radiusBottom, length, segments);
    const mesh = new Mesh(geometry, material);

    configureInteractivity(mesh, params);

    return mesh;
  },
  update(object3d, newParams) {
    const { length, segments, color, opacity } = newParams;
    const { radiusTop, radiusBottom } = getRadius(newParams);

    updateMaterial(object3d, color, opacity);

    object3d.geometry?.dispose();
    object3d.geometry = new CylinderGeometry(radiusTop, radiusBottom, length, segments);

    configureInteractivity(object3d, newParams);
  },
});
