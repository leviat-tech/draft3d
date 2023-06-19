import {
  EllipseCurve, ConeGeometry, Mesh, CatmullRomCurve3, ExtrudeGeometry, Vector3, Object3D,
} from 'three';

import { createCircle } from '../utils/geometry';

import { createMaterial, updateMaterial } from '../utils/material';
import { defineEntity } from '../defineEntity.js';


const { PI } = Math;

export default defineEntity({
  name: 'roundedCylindricalArrow',
  parameters: {
    color: { name: 'color', default: '#6666aa' },
  },
  render(params) {
    const { color } = params;
    const curve = new EllipseCurve(
      0, 0, // ax, aY
      0.1, 0.1, // xRadius, yRadius
      0, PI - (PI / 10), // aStartAngle, aEndAngle
      false, // aClockwise
      0, // aRotation
    );

    const points = [];
    curve.getPoints(50).forEach((point) => {
      points.push(new Vector3(...point));
    });

    const material = createMaterial(color, 1);

    const curve2 = new CatmullRomCurve3(points);

    const extrudeSettings = {
      steps: 100,
      extrudePath: curve2,
    };
    const geometry = new ExtrudeGeometry(createCircle(0.02), extrudeSettings);

    const cone = new Mesh(new ConeGeometry(0.03, 0.05, 32), material);
    cone.rotateZ(174 * (PI / 180));
    cone.position.y += 0.015;
    cone.position.x -= 0.096;

    const mesh = new Mesh(geometry, material);

    const object3D = new Object3D();

    object3D.add(mesh);
    object3D.add(cone);

    return object3D;
  },
  update(root, params) {
    root.children.forEach((object3D) => {
      updateMaterial(object3D, params.color, 1);
    });
  },
});
