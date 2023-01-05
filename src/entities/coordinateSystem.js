import {
  Vector3, Object3D, ArrowHelper, BoxGeometry, MeshBasicMaterial, Mesh,
} from 'three';

import cylindricalArrow from './cylindricalArrow';
import roundedCylindricalArrow from './roundedCylindricalArrow';

import { createText, createTextGeometry } from '../utils/geometry';


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

const createTextBox = (onClick) => {
  const boxGeometry = new BoxGeometry(0, 0);
  const boxMaterial = new MeshBasicMaterial({ opacity: 0, transparent: true });
  const textBox = new Mesh(boxGeometry, boxMaterial);

  textBox.isInteractive = true;
  textBox.onClick = (e) => onClick(e);

  return textBox;
};

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

const createXForce = (xLoads) => {
  const xForceArrow = cylindricalArrow.render({ length: FORCE_ARROW_LENGTH, color: COLORS.GREEN });
  const xForceText = createLabel(`Vx = ${xLoads.force.value}`);
  const xForceTextBox = createTextBox(xLoads.force.onClick);

  return { xForceArrow, xForceText, xForceTextBox };
};

const createYForce = (yLoads) => {
  const yForceArrow = cylindricalArrow.render({ length: FORCE_ARROW_LENGTH, color: COLORS.BLUE });
  const yForceText = createLabel(`Vy = ${yLoads.force.value}`);
  const yForceTextBox = createTextBox(yLoads.force.onClick);

  return { yForceArrow, yForceText, yForceTextBox };
};

const createZForce = (zLoads) => {
  const zForceArrow = cylindricalArrow.render({ length: FORCE_ARROW_LENGTH, color: COLORS.RED });
  const zForceText = createLabel(`Vz = ${zLoads.force.value}`);
  const zForceTextBox = createTextBox(zLoads.force.onClick);

  return { zForceArrow, zForceText, zForceTextBox };
};

const createXMoment = (xLoads) => {
  const xMomentArrow = roundedCylindricalArrow.render({ color: COLORS.GREEN });
  const xMomentText = createLabel(`Mx = ${xLoads.moment.value}`);
  const xMomentTextBox = createTextBox(xLoads.moment.onClick);

  return { xMomentArrow, xMomentText, xMomentTextBox };
};

const createZMoment = (zLoads) => {
  const zMomentArrow = roundedCylindricalArrow.render({ color: COLORS.RED });
  const zMomentText = createLabel(`Mz = ${zLoads.moment.value}`);
  const zMomentTextBox = createTextBox(zLoads.moment.onClick);

  return { zMomentArrow, zMomentText, zMomentTextBox };
};

const positionXForce = ({ xForceArrow, xAxisLength, xForceText, xForceTextBox, xLoads }) => {
  const { x, y } = xForceText.geometry.boundingSphere.center;

  xForceText.rotation.set(0, 0, 0);
  xForceArrow.rotation.set(0, 0, 0);
  xForceTextBox.rotation.set(0, 0, 0);

  const isNegativeLoad = xLoads.force < 0;

  xForceArrow.position.x = -(xAxisLength - (isNegativeLoad ? 0.5 : 0.7));
  xForceArrow.rotateZ(isNegativeLoad ? -halfPI : halfPI);

  xForceText.position.x = -(xAxisLength - 0.35);
  xForceText.position.z = -0.1;
  xForceText.rotateX(-halfPI);

  xForceTextBox.geometry.dispose();
  xForceTextBox.geometry = new BoxGeometry(x * 2, y * 2, 0.01);

  xForceTextBox.position.x = -(xAxisLength - 0.35 - x);
  xForceTextBox.position.z = -0.1 - y;
  xForceTextBox.rotateX(halfPI);
};

const positionYForce = ({ yForceArrow, yAxisLength, yForceTextBox, yForceText, yLoads }) => {
  yForceText.geometry.computeBoundingBox();

  const { x, y } = yForceText.geometry.boundingBox.max;

  yForceText.rotation.set(0, 0, 0);
  yForceArrow.rotation.set(0, 0, 0);
  yForceTextBox.rotation.set(0, 0, 0);

  const isNegativeLoad = yLoads.force < 0;

  if (isNegativeLoad) {
    yForceArrow.rotateX(-Math.PI);
  }
  yForceArrow.position.y = yAxisLength - (isNegativeLoad ? 0.5 : 0.7);

  yForceText.position.x = -0.1;
  yForceText.position.y = yAxisLength - 0.8;
  yForceText.rotateZ(halfPI);

  yForceTextBox.geometry.dispose();
  yForceTextBox.geometry = new BoxGeometry(x, y + 0.05, 0.01); // Add 0.05 to cover 'y' letter fully
  yForceTextBox.position.y = yAxisLength - 0.8 + (x / 2);
  yForceTextBox.position.x = -0.1 - y / 2;
  yForceTextBox.rotateZ(halfPI);
};

const positionZForce = ({ zForceArrow, zForceText, zForceTextBox, zAxisLength, zLoads }) => {
  const { x, y } = zForceText.geometry.boundingSphere.center;

  zForceText.rotation.set(0, 0, 0);
  zForceArrow.rotation.set(0, 0, 0);
  zForceTextBox.rotation.set(0, 0, 0);

  const isNegativeLoad = zLoads.force < 0;

  zForceText.position.x = -0.1;
  zForceArrow.rotateX(zLoads.force < 0 ? halfPI : -halfPI);

  zForceArrow.position.z = -(zAxisLength - (isNegativeLoad ? 0.5 : 0.7));
  zForceText.position.z = -(zAxisLength - 0.8);
  zForceText.rotateX(-halfPI);
  zForceText.rotateZ(halfPI);

  zForceTextBox.geometry.dispose();
  zForceTextBox.geometry = new BoxGeometry(x * 2, y * 2, 0.01);

  zForceTextBox.position.z = -(zAxisLength - 0.8) - x;
  zForceTextBox.position.x = -0.1 - y;
  zForceTextBox.rotateX(-halfPI);
  zForceTextBox.rotateZ(halfPI);
};

const positionXMoment = ({ xMomentArrow, xMomentText, xMomentTextBox, xAxisLength, xLoads }) => {
  const { x, y } = xMomentText.geometry.boundingSphere.center;

  xMomentArrow.rotation.set(0, 0, 0);
  xMomentText.rotation.set(0, 0, 0);
  xMomentTextBox.rotation.set(0, 0, 0);

  const isNegativeLoad = xLoads.moment < 0;

  xMomentArrow.position.x = -(xAxisLength - 1);
  xMomentArrow.rotateY(isNegativeLoad ? halfPI : -halfPI);
  xMomentText.rotateX(-halfPI);
  xMomentText.rotateZ(halfPI);
  xMomentText.position.z = 0.2;
  xMomentText.position.x = -(xAxisLength - 1.2);

  xMomentTextBox.geometry.dispose();
  xMomentTextBox.geometry = new BoxGeometry(x * 2, y * 2, 0.01);

  xMomentTextBox.position.x = -(xAxisLength - 1.2) - y;
  xMomentTextBox.rotateX(halfPI);
  xMomentTextBox.rotateZ(halfPI);
};

const positionZMoment = ({ zMomentArrow, zMomentText, zMomentTextBox, zAxisLength, zLoads }) => {
  const { x, y } = zMomentText.geometry.boundingSphere.center;

  zMomentText.rotation.set(0, 0, 0);
  zMomentArrow.rotation.set(0, 0, 0);
  zMomentTextBox.rotation.set(0, 0, 0);

  const isNegativeLoad = zLoads.moment < 0;

  if (!isNegativeLoad) {
    zMomentArrow.rotateY(Math.PI);
  }

  zMomentArrow.position.z = -(zAxisLength - 1.1);
  zMomentText.position.z = -(zAxisLength - 1.3);
  zMomentText.position.x = -0.2;
  zMomentText.rotateX(-halfPI);

  zMomentTextBox.geometry.dispose();
  zMomentTextBox.geometry = new BoxGeometry(x * 2, y * 2, 0.01);

  zMomentTextBox.position.z = -(zAxisLength - 1.3) - y;
  zMomentTextBox.rotateX(-halfPI);
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
        force: {
          value: 0,
          onClick: () => { console.log('x force clicked'); },
        },
        moment: {
          value: 0,
          onClick: () => { console.log('x moment clicked'); },
        },
      },
    },
    yLoads: {
      name: 'yLoads',
      default: {
        force: {
          value: 0,
          onClick: () => { console.log('y force clicked'); },
        },
      },
    },
    zLoads: {
      name: 'zLoads',
      default: {
        force: {
          value: 0,
          onClick: () => { },
        },
        moment: {
          value: 0,
          onClick: () => { },
        },
      },
    },
  },
  render(params) {
    const { xLoads, yLoads, zLoads } = params;

    const { xAxisLength, yAxisLength, zAxisLength } = createAxisesLength(params);

    const root = new Object3D();

    const { xAxis, xAxisLabel } = createXAxis(xAxisLength);
    const { yAxis, yAxisLabel } = createYAxis(yAxisLength);
    const { zAxis, zAxisLabel } = createZAxis(zAxisLength);

    const { xForceArrow, xForceText, xForceTextBox } = createXForce(xLoads);
    const { yForceArrow, yForceText, yForceTextBox } = createYForce(yLoads);
    const { zForceArrow, zForceText, zForceTextBox } = createZForce(zLoads);

    const { xMomentArrow, xMomentText, xMomentTextBox } = createXMoment(xLoads);
    const { zMomentArrow, zMomentText, zMomentTextBox } = createZMoment(zLoads);


    requestAnimationFrame(() => {
      xAxisLabel.position.x = -calculeLength(xAxisLength);
      xAxisLabel.position.z -= xAxisLabel.geometry.boundingSphere.center.x;

      yAxisLabel.position.y = calculeLength(yAxisLength);
      yAxisLabel.position.x -= yAxisLabel.geometry.boundingSphere.center.x;

      zAxisLabel.position.z = -calculeLength(zAxisLength);
      zAxisLabel.position.x -= zAxisLabel.geometry.boundingSphere.center.x;

      // FORCES
      positionXForce({ xForceArrow, xForceText, xForceTextBox, xAxisLength, xLoads });

      positionYForce({ yForceArrow, yForceText, yForceTextBox, yAxisLength, yLoads });

      positionZForce({ zForceArrow, zForceText, zForceTextBox, zAxisLength, zLoads });

      // MOMENTS
      positionXMoment({ xMomentArrow, xMomentText, xMomentTextBox, xAxisLength, xLoads });

      positionZMoment({ zMomentArrow, zMomentText, zMomentTextBox, zAxisLength, zLoads });
    });


    root.add(xAxis);
    root.add(yAxis);
    root.add(zAxis);

    root.add(xAxisLabel);
    root.add(yAxisLabel);
    root.add(zAxisLabel);

    root.add(new Object3D().add(xForceArrow).add(xForceText).add(xForceTextBox));
    root.add(new Object3D().add(yForceArrow).add(yForceText).add(yForceTextBox));
    root.add(new Object3D().add(zForceArrow).add(zForceText).add(zForceTextBox));

    root.add(new Object3D().add(xMomentArrow).add(xMomentText).add(xMomentTextBox));
    root.add(new Object3D().add(zMomentArrow).add(zMomentText).add(zMomentTextBox));

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
      { children: [xForceArrow, xForceText, xForceTextBox] },
      { children: [yForceArrow, yForceText, yForceTextBox] },
      { children: [zForceArrow, zForceText, zForceTextBox] },
      { children: [xMomentArrow, xMomentText, xMomentTextBox] },
      { children: [zMomentArrow, zMomentText, zMomentTextBox] },
    ] = root.children;

    xAxis.setLength(xAxisLength, HEAD_LENGTH, HEAD_WIDTH);
    yAxis.setLength(yAxisLength, HEAD_LENGTH, HEAD_WIDTH);
    zAxis.setLength(zAxisLength, HEAD_LENGTH, HEAD_WIDTH);

    xForceText.geometry.dispose();
    xForceText.geometry = createTextGeometry(`Vx = ${xLoads.force.value}`, LABEL_TEXT_SIZE);

    yForceText.geometry.dispose();
    yForceText.geometry = createTextGeometry(`Vy = ${yLoads.force.value}`, LABEL_TEXT_SIZE);

    zForceText.geometry.dispose();
    zForceText.geometry = createTextGeometry(`Vz = ${zLoads.force.value}`, LABEL_TEXT_SIZE);

    xMomentText.geometry.dispose();
    xMomentText.geometry = createTextGeometry(`Mx = ${xLoads.moment.value}`, LABEL_TEXT_SIZE);

    zMomentText.geometry.dispose();
    zMomentText.geometry = createTextGeometry(`Mz = ${zLoads.moment.value}`, LABEL_TEXT_SIZE);

    requestAnimationFrame(() => {
      xAxisLabel.position.x = -calculeLength(xAxisLength);
      yAxisLabel.position.y = calculeLength(yAxisLength);
      zAxisLabel.position.z = -calculeLength(zAxisLength);

      positionXForce({ xForceArrow, xForceText, xForceTextBox, xAxisLength, xLoads });

      positionYForce({ yForceArrow, yForceText, yForceTextBox, yAxisLength, yLoads });

      positionZForce({ zForceArrow, zForceText, zForceTextBox, zAxisLength, zLoads });

      positionXMoment({ xMomentArrow, xMomentText, xMomentTextBox, xAxisLength, xLoads });

      positionZMoment({ zMomentArrow, zMomentText, zMomentTextBox, zAxisLength, zLoads });
    });
  },
};
