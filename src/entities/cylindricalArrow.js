import {
  ConeGeometry, CylinderGeometry, Mesh, Object3D,
} from 'three';

import { createMaterial, updateMaterial } from '../utils/material';
import { defineEntity } from '../defineEntity';


export default defineEntity({
  name: 'cylindricalArrow',
  parameters: {
    color: { name: 'color', default: '#6666aa' },
    length: { name: 'length', default: 0.1, precision: 0.1 },
    radius: { name: 'radius', default: 0.02, precision: 0.02 },
    coneHeight: { name: 'coneHeight', default: 0.1, precision: 0.1 },
  },
  render(params) {
    const { length, color, radius, coneHeight } = params;
    const object3D = new Object3D();

    const cylinderGeometry = new CylinderGeometry(radius, radius, length, 32);
    const coneGeometry = new ConeGeometry(radius * 2, coneHeight, 32);

    const material = createMaterial(color, 1);
    const cylinder = new Mesh(cylinderGeometry, material);
    const cone = new Mesh(coneGeometry, material);

    requestAnimationFrame(() => {
      cylinder.position.y += length / 2;
      cone.position.y += length;
    });

    object3D.add(cylinder);
    object3D.add(cone);

    return object3D;
  },
  update(root, params) {
    const [cylinder, cone] = root.children;
    const { length, color, radius, coneHeight } = params;

    updateMaterial(cylinder, color, 1);
    updateMaterial(cone, color, 1);

    cylinder.geometry.dispose();
    cylinder.geometry = new CylinderGeometry(radius, radius, length, 32);
    cone.geometry = new ConeGeometry(radius * 2, coneHeight, 32);

    requestAnimationFrame(() => {
      cone.position.set(0, 0, 0);
      cylinder.position.set(0, 0, 0);

      cylinder.position.y += length / 2;
      cone.position.y = length;
    });
  },
});
