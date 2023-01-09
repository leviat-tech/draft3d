import { Vector3, Object3D, ArrowHelper } from 'three';

import { createText } from '../utils/geometry';


const COLORS = {
  RED: '#FF0000',
  BLUE: '#0000FF',
  GREEN: '#007500',
  BLACK: '#000000',
};

const AXIS_TEXT_SIZE = 0.1;

const HEAD_WIDTH = 0.1;
const HEAD_LENGTH = 0.2;

const ORIGIN = new Vector3(0, 0, 0);
const AXIS_EXTENSION = 1.5;

const halfPI = Math.PI / 2;

const calculeLength = (length) => (length) + 0.03;
const createArrow = (vector, length, color) => new ArrowHelper(vector, ORIGIN, length, color, HEAD_LENGTH, HEAD_WIDTH);

const createAxisesLength = (params) => ({
  xAxisLength: params.xAxisLength + AXIS_EXTENSION,
  yAxisLength: params.yAxisLength + AXIS_EXTENSION,
  zAxisLength: params.zAxisLength + AXIS_EXTENSION,
});

const createXAxis = (xAxisLength) => {
  const xAxis = createArrow(new Vector3(-1, 0, 0), xAxisLength, COLORS.GREEN);
  const xAxisLabel = createText('X', COLORS.GREEN, AXIS_TEXT_SIZE);
  xAxisLabel.setRotationFromAxisAngle(new Vector3(0, 1, 0), halfPI);

  return { xAxis, xAxisLabel };
};

const createYAxis = (yAxisLength) => {
  const yAxis = createArrow(new Vector3(0, 1, 0), yAxisLength, COLORS.BLUE);
  const yAxisLabel = createText('Y', COLORS.BLUE, AXIS_TEXT_SIZE);

  return { yAxis, yAxisLabel };
};

const createZAxis = (zAxisLength) => {
  const zAxis = createArrow(new Vector3(0, 0, -1), zAxisLength, COLORS.RED);
  const zAxisLabel = createText('Z', COLORS.RED, AXIS_TEXT_SIZE);

  return { zAxis, zAxisLabel };
};

export default {
  name: 'axes',
  parameters: {
    xAxisLength: { name: 'xAxisLength', default: 0.8, precision: 0.1 },
    yAxisLength: { name: 'yAxisLength', default: 0.8, precision: 0.1 },
    zAxisLength: { name: 'zAxisLength', default: 2, precision: 0.1 },
  },
  render(params) {
    const { xAxisLength, yAxisLength, zAxisLength } = createAxisesLength(params);

    const root = new Object3D();

    const { xAxis, xAxisLabel } = createXAxis(xAxisLength);
    const { yAxis, yAxisLabel } = createYAxis(yAxisLength);
    const { zAxis, zAxisLabel } = createZAxis(zAxisLength);

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
  update(root, params) {
    const { xAxisLength, yAxisLength, zAxisLength } = createAxisesLength(params);

    const [
      xAxis,
      yAxis,
      zAxis,
      xAxisLabel,
      yAxisLabel,
      zAxisLabel,
    ] = root.children;

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
