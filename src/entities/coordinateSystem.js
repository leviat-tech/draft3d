import { Vector3, Object3D, ArrowHelper } from 'three';

import cylindricalArrow from './cylindricalArrow';
import roundedCylindricalArrow from './roundedCylindricalArrow';

import { createText } from '../utils/geometry';


const COLORS = {
  RED: '#FF0000',
  BLUE: '#0000FF',
  GREEN: '#007500',
  BLACK: '#000000',
};

const AXIS_TEXT_SIZE = 0.1;
const LABEL_TEXT_SIZE = 0.1;

const HEAD_WIDTH = 0.1;
const HEAD_LENGTH = 0.2;

const ORIGIN = new Vector3(0, 0, 0);
const FORCE_ARROW_LENGTH = 0.2;
const AXIS_EXTENSION = 1.5;

const halfPI = Math.PI / 2;

const calculeLength = (length) => (length) + 0.03;
const createArrow = (vector, length, color) => new ArrowHelper(vector, ORIGIN, length, color, HEAD_LENGTH, HEAD_WIDTH);
const createLabel = (text) => createText(text, COLORS.BLACK, LABEL_TEXT_SIZE);

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

const createXForceArrow = (xLoads) => {
  const xForceArrow = cylindricalArrow.render({ length: FORCE_ARROW_LENGTH, color: COLORS.GREEN });
  const xForceArrowLabel = createLabel(`Vx = ${xLoads.force}`);
  xForceArrowLabel.rotateX(-halfPI);

  return { xForceArrow, xForceArrowLabel };
};

const createYForceArrow = (yLoads) => {
  const yForceArrow = cylindricalArrow.render({ length: FORCE_ARROW_LENGTH, color: COLORS.BLUE });
  const yForceArrowLabel = createLabel(`Vy = ${yLoads.force}`);
  yForceArrowLabel.rotateZ(halfPI);

  return { yForceArrow, yForceArrowLabel };
};

const createZForceArrow = (zLoads) => {
  const zForceArrow = cylindricalArrow.render({ length: FORCE_ARROW_LENGTH, color: COLORS.RED });
  const zForceArrowLabel = createLabel(`Vz = ${zLoads.force}`);
  zForceArrowLabel.rotateX(-halfPI);
  zForceArrowLabel.rotateZ(halfPI);

  return { zForceArrow, zForceArrowLabel };
};

const createXMomentArrow = (xLoads) => {
  const xMomentArrow = roundedCylindricalArrow.render({ color: COLORS.GREEN });
  const xMomentArrowLabel = createLabel(`Mx = ${xLoads.moment}`);

  return { xMomentArrow, xMomentArrowLabel };
};

const createZMomentArrow = (zLoads) => {
  const zMomentArrow = roundedCylindricalArrow.render({ color: COLORS.RED });
  const zMomentArrowLabel = createLabel(`Mz = ${zLoads.moment}`);

  return { zMomentArrow, zMomentArrowLabel };
};

const positionXForceArrow = ({ xForceArrow, xAxisLength, xForceArrowLabel, xLoads }) => {
  xForceArrow.rotation.set(0, 0, 0);

  const isNegativeLoad = xLoads.force < 0;

  xForceArrow.position.x = -(xAxisLength - (isNegativeLoad ? 0.5 : 0.7));
  xForceArrow.rotateZ(isNegativeLoad ? -halfPI : halfPI);

  xForceArrowLabel.position.x = -(xAxisLength - 0.35);
  xForceArrowLabel.position.z = -0.1;
};

const positionYForceArrow = ({ yForceArrow, yAxisLength, yForceArrowLabel, yLoads }) => {
  yForceArrow.rotation.set(0, 0, 0);

  const isNegativeLoad = yLoads.force < 0;

  if (isNegativeLoad) {
    yForceArrow.rotateX(-Math.PI);
  }
  yForceArrow.position.y = yAxisLength - (isNegativeLoad ? 0.5 : 0.7);

  yForceArrowLabel.position.x = -0.1;
  yForceArrowLabel.position.y = yAxisLength - 0.8;
};

const positionZForceArrow = ({ zForceArrow, zForceArrowLabel, zAxisLength, zLoads }) => {
  zForceArrow.rotation.set(0, 0, 0);

  const isNegativeLoad = zLoads.force < 0;

  zForceArrowLabel.position.x = -0.1;
  zForceArrow.rotateX(zLoads.force < 0 ? halfPI : -halfPI);

  zForceArrow.position.z = -(zAxisLength - (isNegativeLoad ? 0.5 : 0.7));
  zForceArrowLabel.position.z = -(zAxisLength - 0.8);
};

const positionXMomentArrow = ({ xMomentArrow, xMomentArrowLabel, xAxisLength, xLoads }) => {
  xMomentArrow.rotation.set(0, 0, 0);
  xMomentArrowLabel.rotation.set(0, 0, 0);

  const isNegativeLoad = xLoads.moment < 0;

  xMomentArrow.position.x = -(xAxisLength - 1);
  xMomentArrow.rotateY(isNegativeLoad ? halfPI : -halfPI);
  xMomentArrowLabel.rotateX(-halfPI);
  xMomentArrowLabel.rotateZ(halfPI);
  xMomentArrowLabel.position.z = 0.2;
  xMomentArrowLabel.position.x = -(xAxisLength - 1.2);
};

const positionZMomentArrow = ({ zMomentArrow, zMomentArrowLabel, zAxisLength, zLoads }) => {
  zMomentArrow.rotation.set(0, 0, 0);
  zMomentArrowLabel.rotation.set(0, 0, 0);

  const isNegativeLoad = zLoads.moment < 0;

  if (!isNegativeLoad) {
    zMomentArrow.rotateY(Math.PI);
  }

  zMomentArrow.position.z = -(zAxisLength - 1.1);
  zMomentArrowLabel.rotateX(-halfPI);
  zMomentArrowLabel.position.z = -(zAxisLength - 1.3);
  zMomentArrowLabel.position.x = -0.2;
};

export default {
  name: 'coordinateSystem',
  parameters: {
    xAxisLength: { name: 'xAxisLength', default: 0.8, precision: 0.1 },
    yAxisLength: { name: 'yAxisLength', default: 0.8, precision: 0.1 },
    zAxisLength: { name: 'zAxisLength', default: 2, precision: 0.1 },
    xLoads: {
      name: 'xLoads',
      default: {
        force: 0,
        moment: 0,
      },
    },
    yLoads: {
      name: 'yLoads',
      default: {
        force: 0,
      },
    },
    zLoads: {
      name: 'zLoads',
      default: {
        force: 0,
        moment: 0,
      },
    },
  },
  render(params) {
    const { xLoads, yLoads, zLoads } = params;

    // Add extension to ensure forces visibility
    const { xAxisLength, yAxisLength, zAxisLength } = createAxisesLength(params);

    const root = new Object3D();

    const { xAxis, xAxisLabel } = createXAxis(xAxisLength);
    const { yAxis, yAxisLabel } = createYAxis(yAxisLength);
    const { zAxis, zAxisLabel } = createZAxis(zAxisLength);

    const { xForceArrow, xForceArrowLabel } = createXForceArrow(xLoads);
    const { yForceArrow, yForceArrowLabel } = createYForceArrow(yLoads);
    const { zForceArrow, zForceArrowLabel } = createZForceArrow(zLoads);

    const { xMomentArrow, xMomentArrowLabel } = createXMomentArrow(xLoads);
    const { zMomentArrow, zMomentArrowLabel } = createZMomentArrow(zLoads);

    requestAnimationFrame(() => {
      xAxisLabel.position.x = -calculeLength(xAxisLength);
      xAxisLabel.position.z -= xAxisLabel.geometry.boundingSphere.center.x;

      yAxisLabel.position.y = calculeLength(yAxisLength);
      yAxisLabel.position.x -= yAxisLabel.geometry.boundingSphere.center.x;

      zAxisLabel.position.z = -calculeLength(zAxisLength);
      zAxisLabel.position.x -= zAxisLabel.geometry.boundingSphere.center.x;

      // FORCES
      positionXForceArrow({ xForceArrow, xAxisLength, xForceArrowLabel, xLoads });
      positionYForceArrow({ yForceArrow, yAxisLength, yForceArrowLabel, yLoads });
      positionZForceArrow({ zForceArrow, zForceArrowLabel, zAxisLength, zLoads });

      // MOMENTS
      positionXMomentArrow({ xMomentArrow, xMomentArrowLabel, xAxisLength, xLoads });
      positionZMomentArrow({ zMomentArrow, zMomentArrowLabel, zAxisLength, zLoads });
    });


    root.add(xAxis);
    root.add(yAxis);
    root.add(zAxis);

    root.add(xAxisLabel);
    root.add(yAxisLabel);
    root.add(zAxisLabel);

    root.add(new Object3D().add(xForceArrow).add(xForceArrowLabel));
    root.add(new Object3D().add(yForceArrow).add(yForceArrowLabel));
    root.add(new Object3D().add(zForceArrow).add(zForceArrowLabel));

    root.add(new Object3D().add(xMomentArrow).add(xMomentArrowLabel));
    root.add(new Object3D().add(zMomentArrow).add(zMomentArrowLabel));

    return root;
  },
  update(root, params) {
    const { xLoads, yLoads, zLoads } = params;
    const { xAxisLength, yAxisLength, zAxisLength } = createAxisesLength(params);

    const [
      xAxis,
      yAxis,
      zAxis,
      xAxisLabel,
      yAxisLabel,
      zAxisLabel,
      { children: xForceArrow },
      { children: yForceArrow },
      { children: zForceArrow },
      { children: xMomentArrow },
      { children: zMomentArrow },
    ] = root.children;

    xAxis.setLength(xAxisLength, HEAD_LENGTH, HEAD_WIDTH);
    yAxis.setLength(yAxisLength, HEAD_LENGTH, HEAD_WIDTH);
    zAxis.setLength(zAxisLength, HEAD_LENGTH, HEAD_WIDTH);

    requestAnimationFrame(() => {
      xAxisLabel.position.x = -calculeLength(xAxisLength);
      yAxisLabel.position.y = calculeLength(yAxisLength);
      zAxisLabel.position.z = -calculeLength(zAxisLength);

      positionXForceArrow({ xForceArrow: xForceArrow[0], xForceArrowLabel: xForceArrow[1], xAxisLength, xLoads });
      positionYForceArrow({ yForceArrow: yForceArrow[0], yForceArrowLabel: yForceArrow[1], yAxisLength, yLoads });
      positionZForceArrow({ zForceArrow: zForceArrow[0], zForceArrowLabel: zForceArrow[1], zAxisLength, zLoads });
      positionXMomentArrow({ xMomentArrow: xMomentArrow[0], xMomentArrowLabel: xMomentArrow[1], xAxisLength, xLoads });
      positionZMomentArrow({ zMomentArrow: zMomentArrow[0], zMomentArrowLabel: zMomentArrow[1], zAxisLength, zLoads });

    });
  },
};
