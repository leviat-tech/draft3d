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
  },
  render(params) {
    const { length, color } = params;
    const object3D = new Object3D();

    const cylinderGeometry = new CylinderGeometry(0.02, 0.02, length, 32);
    const coneGeometry = new ConeGeometry(0.04, 0.1, 32);

    const material = createMaterial(color, 1);
    const cylinder = new Mesh(cylinderGeometry, material);
    const cone = new Mesh(coneGeometry, material);

    requestAnimationFrame(() => {
      cylinder.position.y += length / 2;
      cone.position.y += 0.05 + length;
    });

    object3D.add(cylinder);
    object3D.add(cone);

    return object3D;
  },
  update(root, params) {
    const [cylinder, cone] = root.children;
    const { length, color } = params;

    updateMaterial(cylinder, color, 1);
    updateMaterial(cone, color, 1);

    cylinder.geometry.dispose();
    cylinder.geometry = new CylinderGeometry(0.02, 0.02, length, 32);

    requestAnimationFrame(() => {
      cone.position.set(0, 0, 0);
      cylinder.position.set(0, 0, 0);

      cylinder.position.y += length / 2;
      cone.position.y = length;
    });
  },
});
