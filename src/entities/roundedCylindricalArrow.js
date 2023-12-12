import {
  EllipseCurve, ConeGeometry, Mesh, CatmullRomCurve3, ExtrudeGeometry, Vector3, Object3D,
} from 'three';

import { createCircle } from '../utils/geometry';

import { createMaterial, updateMaterial } from '../utils/material';
import { defineEntity } from '../defineEntity';


const { PI } = Math;

const radialSegments = 32;

export default defineEntity({
  name: 'roundedCylindricalArrow',
  parameters: {
    color: { name: 'color', default: '#6666aa' },
    circleRadius: { name: 'circleRadius', default: 0.01, precision: 0.01 },
    circledArrowConeHeight: { name: 'circledArrowConeHeight', default: 0.05, precision: 0.01 },
    coneRadius: { name: 'coneRadius', default: 0.03, precision: 0.01 },
    ellipseCurveRadius: { name: 'ellipseCurveRadius', default: 0.1, precision: 0.01 },
    rotateZAngle: { name: 'rotateZAngle', default: 174, precision: 1 },
    positionX: { name: 'positionX', default: 0.015, precision: 0.01 },
    positionZ: { name: 'positionZ', default: 0.096, precision: 0.01 },
  },
  render(params) {
    const {
      color,
      circleRadius,
      circledArrowConeHeight,
      coneRadius,
      ellipseCurveRadius,
      rotateZAngle,
      positionX,
      positionZ,
    } = params;
    const curve = new EllipseCurve(
      0, 0, // ax, aY
      ellipseCurveRadius, ellipseCurveRadius, // xRadius, yRadius
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
    const geometry = new ExtrudeGeometry(createCircle(circleRadius), extrudeSettings);

    const cone = new Mesh(new ConeGeometry(coneRadius, circledArrowConeHeight, radialSegments), material);
    cone.rotateZ(rotateZAngle * (PI / 180));
    cone.position.y += positionX;
    cone.position.x -= positionZ;

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
