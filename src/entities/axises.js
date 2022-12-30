import {
  Vector3,
  Object3D,
  ArrowHelper,
} from 'three';

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
    yAxisLength: { name: 'yAxisLength', default: 1, precision: 0.1 },
    zAxisLength: { name: 'zAxisLength', default: 3, precision: 0.1 },
  },
  render(params) {
    const { xAxisLength, yAxisLength, zAxisLength } = params;

    const root = new Object3D();

    const xAxis = createArrow(new Vector3(-1, 0, 0), xAxisLength, COLORS.GREEN);
    const xAxisLabel = createText('X', COLORS.GREEN, TEXT_SIZE);
    xAxisLabel.setRotationFromAxisAngle(new Vector3(0, 1, 0), Math.PI / -2);

    const yAxis = createArrow(new Vector3(0, 1, 0), yAxisLength, COLORS.BLUE);
    const yAxisLabel = createText('Y', COLORS.BLUE, TEXT_SIZE);

    const zAxis = createArrow(new Vector3(0, 0, -1), zAxisLength, COLORS.RED);
    const zAxisLabel = createText('Z', COLORS.RED, TEXT_SIZE);

    requestAnimationFrame(() => {
      xAxisLabel.position.x = -calculeLength(xAxisLength);
      xAxisLabel.position.z -= xAxisLabel.geometry.boundingSphere.center.x;

      yAxisLabel.position.y = calculeLength(yAxisLength);
      yAxisLabel.position.x -= yAxisLabel.geometry.boundingSphere.center.x;

      zAxisLabel.position.z = -calculeLength(zAxisLength);
      zAxisLabel.position.x -= zAxisLabel.geometry.boundingSphere.center.x;
    });

    root.add(xAxis);
    root.add(yAxis);
    root.add(zAxis);

    root.add(xAxisLabel);
    root.add(yAxisLabel);
    root.add(zAxisLabel);

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
