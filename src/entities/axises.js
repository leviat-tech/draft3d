import {
  Vector3,
  Object3D,
  ArrowHelper,
} from 'three';

import cylindricalArrow from './cylindricalArrow';

import { createText } from '../utils/geometry';


const COLORS = {
  RED: '#FF0000',
  BLUE: '#0000FF',
  GREEN: '#007500',
};

const TEXT_SIZE = 0.1;
const HEAD_WIDTH = 0.1;
const HEAD_LENGTH = 0.2;
const ORIGIN = new Vector3(0, 0, 0);

const calculeLength = (length) => (length) + 0.03;
const createArrow = (vector, length, color) => new ArrowHelper(vector, ORIGIN, length, color, HEAD_LENGTH, HEAD_WIDTH);

export default {
  name: 'axises',
  parameters: {
    xAxisLength: { name: 'xAxisLength', default: 2, precision: 0.1 },
    yAxisLength: { name: 'yAxisLength', default: 2, precision: 0.1 },
    zAxisLength: { name: 'zAxisLength', default: 3, precision: 0.1 },
    xLoads: {
      name: 'xLoads',
      default: {
        force: {
          value: 100,
        },
        moment: {
          value: 0,
        },
      },
    },
    yLoads: {
      name: 'yLoads',
      default: {
        force: {
          value: 100,
        },
        moment: {
          value: 0,
        },
      },
    },
    zLoads: {
      name: 'zLoads',
      default: {
        force: {
          value: 100,
        },
        moment: {
          value: 0,
        },
      },
    },
  },
  render(params) {
    const { PI } = Math;
    const {
      xAxisLength, yAxisLength, zAxisLength, xLoads, yLoads, zLoads,
    } = params;

    const root = new Object3D();

    const xAxis = createArrow(new Vector3(-1, 0, 0), xAxisLength, COLORS.GREEN);
    const xAxisLabel = createText('X', COLORS.GREEN, TEXT_SIZE);
    xAxisLabel.setRotationFromAxisAngle(new Vector3(0, 1, 0), PI / -2);

    const yAxis = createArrow(new Vector3(0, 1, 0), yAxisLength, COLORS.BLUE);
    const yAxisLabel = createText('Y', COLORS.BLUE, TEXT_SIZE);

    const zAxis = createArrow(new Vector3(0, 0, -1), zAxisLength, COLORS.RED);
    const zAxisLabel = createText('Z', COLORS.RED, TEXT_SIZE);

    // FORCES
    const xCylindricalArrow = cylindricalArrow.render({ length: 0.2, color: 'green' });
    const xCylindricalArrowLabel = createText(`Vx = ${xLoads.force.value}`, 'black', 0.07);
    xCylindricalArrowLabel.rotateX(PI / -2);

    const yCylindricalArrow = cylindricalArrow.render({ length: 0.2, color: 'blue' });
    const yCylindricalArrowLabel = createText(`Vy = ${xLoads.force.value}`, 'black', 0.07);
    yCylindricalArrowLabel.rotateZ(PI / 2);


    const zCylindricalArrow = cylindricalArrow.render({ length: 0.2, color: 'red' });
    const zCylindricalArrowLabel = createText(`Vz = ${zLoads.force.value}`, 'black', 0.07);
    zCylindricalArrowLabel.rotateX(PI / -2);

    requestAnimationFrame(() => {
      xAxisLabel.position.x = -calculeLength(xAxisLength);
      xAxisLabel.position.z -= xAxisLabel.geometry.boundingSphere.center.x;

      yAxisLabel.position.y = calculeLength(yAxisLength);
      yAxisLabel.position.x -= yAxisLabel.geometry.boundingSphere.center.x;

      zAxisLabel.position.z = -calculeLength(zAxisLength);
      zAxisLabel.position.x -= zAxisLabel.geometry.boundingSphere.center.x;

      // FORCES
      xCylindricalArrow.position.x = xAxisLength * -0.7;
      xCylindricalArrowLabel.position.x = xAxisLength * -0.8;
      xCylindricalArrowLabel.position.z -= 0.1;


      yCylindricalArrow.position.y = yAxisLength * 0.7;
      yCylindricalArrowLabel.position.y = yAxisLength * 0.6;
      yCylindricalArrowLabel.position.x -= 0.1;


      zCylindricalArrow.position.z = zAxisLength * -0.7;
      zCylindricalArrowLabel.position.z = zAxisLength * -0.7;
      zCylindricalArrowLabel.position.x += 0.1;


      xCylindricalArrow.rotateZ(xLoads.force.value < 0 ? PI / -2 : PI / 2);

      if (yLoads.force.value < 0) {
        yCylindricalArrow.rotateX(PI / -2);
      }

      zCylindricalArrow.rotateX(zLoads.force.value < 0 ? PI / 2 : PI / -2);
    });


    root.add(xAxis);
    root.add(yAxis);
    root.add(zAxis);

    root.add(xAxisLabel);
    root.add(yAxisLabel);
    root.add(zAxisLabel);

    root.add(new Object3D().add(xCylindricalArrow).add(xCylindricalArrowLabel));
    root.add(new Object3D().add(yCylindricalArrow).add(yCylindricalArrowLabel));
    root.add(new Object3D().add(zCylindricalArrow).add(zCylindricalArrowLabel));

    return root;
  },
  update(root, newParams) {
    const { xAxisLength, yAxisLength, zAxisLength } = newParams;
    const [xAxis, yAxis, zAxis, xAxisLabel, yAxisLabel, zAxisLabel] = root.children;

    xAxis.setLength(xAxisLength, HEAD_LENGTH, HEAD_WIDTH);
    yAxis.setLength(yAxisLength, HEAD_LENGTH, HEAD_WIDTH);
    zAxis.setLength(zAxisLength, HEAD_LENGTH, HEAD_WIDTH);

    requestAnimationFrame(() => {
      xAxisLabel.position.x = -calculeLength(xAxisLength);
      yAxisLabel.position.y = calculeLength(yAxisLength);
      zAxisLabel.position.z = -calculeLength(zAxisLength);
    });
  },
};
