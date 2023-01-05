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

const createXMoment = (xLoads) => {
  const xMomentArrow = cylindricalArrow.render({ length: FORCE_ARROW_LENGTH, color: COLORS.GREEN });
  const xMomentText = createLabel(`Mx = ${xLoads.moment.value}`);
  const xMomentTextBox = createTextBox(xLoads.moment.onClick);

  return { xMomentArrow, xMomentText, xMomentTextBox };
};

const createYMoment = (yLoads) => {
  const yMomentArrow = cylindricalArrow.render({ length: FORCE_ARROW_LENGTH, color: COLORS.BLUE });
  const yMomentText = createLabel(`My = ${yLoads.moment.value}`);
  const yMomentTextBox = createTextBox(yLoads.moment.onClick);

  return { yMomentArrow, yMomentText, yMomentTextBox };
};

const createZMoment = (zLoads) => {
  const zMomentArrow = cylindricalArrow.render({ length: FORCE_ARROW_LENGTH, color: COLORS.RED });
  const zMomentText = createLabel(`Mz = ${zLoads.moment.value}`);
  const zMomentTextBox = createTextBox(zLoads.moment.onClick);

  return { zMomentArrow, zMomentText, zMomentTextBox };
};

const createXShear = (xLoads) => {
  const xShearArrow = roundedCylindricalArrow.render({ color: COLORS.GREEN });
  const xShearText = createLabel(`Vx = ${xLoads.shear.value}`);
  const xShearTextBox = createTextBox(xLoads.shear.onClick);

  return { xShearArrow, xShearText, xShearTextBox };
};

const createYShear = (yLoads) => {
  const yShearArrow = roundedCylindricalArrow.render({ color: COLORS.BLUE });
  const yShearText = createLabel(`Vy = ${yLoads.shear.value}`);
  const yShearTextBox = createTextBox(yLoads.shear.onClick);

  return { yShearArrow, yShearText, yShearTextBox };
};

const positionXMoment = ({ xMomentArrow, xAxisLength, xMomentText, xMomentTextBox, xLoads }) => {
  const { x, y } = xMomentText.geometry.boundingSphere.center;

  xMomentText.rotation.set(0, 0, 0);
  xMomentArrow.rotation.set(0, 0, 0);
  xMomentTextBox.rotation.set(0, 0, 0);

  const isNegativeLoad = xLoads.moment.value < 0;

  xMomentArrow.position.x = -(xAxisLength - (isNegativeLoad ? 0.5 : 0.7));
  xMomentArrow.rotateZ(isNegativeLoad ? -halfPI : halfPI);

  xMomentText.position.x = -(xAxisLength - 0.35);
  xMomentText.position.z = -0.1;
  xMomentText.rotateX(-halfPI);

  xMomentTextBox.geometry.dispose();
  xMomentTextBox.geometry = new BoxGeometry(x * 2, y * 2, 0.01);

  xMomentTextBox.position.x = -(xAxisLength - 0.35 - x);
  xMomentTextBox.position.z = -0.1 - y;
  xMomentTextBox.rotateX(halfPI);
};

const positionYMoment = ({ yMomentArrow, yAxisLength, yMomentTextBox, yMomentText, yLoads }) => {
  yMomentText.geometry.computeBoundingBox();

  const { x, y } = yMomentText.geometry.boundingBox.max;

  yMomentText.rotation.set(0, 0, 0);
  yMomentArrow.rotation.set(0, 0, 0);
  yMomentTextBox.rotation.set(0, 0, 0);

  const isNegativeLoad = yLoads.moment.value < 0;

  if (isNegativeLoad) {
    yMomentArrow.rotateX(-Math.PI);
  }
  yMomentArrow.position.y = yAxisLength - (isNegativeLoad ? 0.5 : 0.7);

  yMomentText.position.x = -0.1;
  yMomentText.position.y = yAxisLength - 0.8;
  yMomentText.rotateZ(halfPI);

  yMomentTextBox.geometry.dispose();
  yMomentTextBox.geometry = new BoxGeometry(x, y + 0.05, 0.01); // Add 0.05 to cover 'y' letter fully
  yMomentTextBox.position.y = yAxisLength - 0.8 + (x / 2);
  yMomentTextBox.position.x = -0.1 - y / 2;
  yMomentTextBox.rotateZ(halfPI);
};

const positionZMoment = ({ zMomentArrow, zMomentText, zMomentTextBox, zAxisLength, zLoads }) => {
  const { x, y } = zMomentText.geometry.boundingSphere.center;

  zMomentText.rotation.set(0, 0, 0);
  zMomentArrow.rotation.set(0, 0, 0);
  zMomentTextBox.rotation.set(0, 0, 0);

  const isNegativeLoad = zLoads.moment.value < 0;

  zMomentText.position.x = -0.1;
  zMomentArrow.rotateX(isNegativeLoad ? halfPI : -halfPI);

  zMomentArrow.position.z = -(zAxisLength - (isNegativeLoad ? 0.5 : 0.7));
  zMomentText.position.z = -(zAxisLength - 0.8);
  zMomentText.rotateX(-halfPI);
  zMomentText.rotateZ(halfPI);

  zMomentTextBox.geometry.dispose();
  zMomentTextBox.geometry = new BoxGeometry(x * 2, y * 2, 0.01);

  zMomentTextBox.position.z = -(zAxisLength - 0.8) - x;
  zMomentTextBox.position.x = -0.1 - y;
  zMomentTextBox.rotateX(-halfPI);
  zMomentTextBox.rotateZ(halfPI);
};

const positionXShear = ({ xShearArrow, xShearText, xShearTextBox, xAxisLength, xLoads }) => {
  const { x, y } = xShearText.geometry.boundingSphere.center;

  xShearArrow.rotation.set(0, 0, 0);
  xShearText.rotation.set(0, 0, 0);
  xShearTextBox.rotation.set(0, 0, 0);

  const isNegativeLoad = xLoads.shear.value < 0;

  xShearArrow.position.x = -(xAxisLength - 1);
  xShearArrow.rotateY(isNegativeLoad ? halfPI : -halfPI);
  xShearText.rotateX(-halfPI);
  xShearText.rotateZ(halfPI);
  xShearText.position.z = 0.2;
  xShearText.position.x = -(xAxisLength - 1.2);

  xShearTextBox.geometry.dispose();
  xShearTextBox.geometry = new BoxGeometry(x * 2, y * 2, 0.01);

  xShearTextBox.position.x = -(xAxisLength - 1.2) - y;
  xShearTextBox.rotateX(halfPI);
  xShearTextBox.rotateZ(halfPI);
};

const positionYShear = ({ yShearArrow, yShearText, yShearTextBox, yAxisLength, yLoads }) => {
  const { x, y } = yShearText.geometry.boundingSphere.center;

  yShearText.rotation.set(0, 0, 0);
  yShearArrow.rotation.set(0, 0, 0);
  yShearTextBox.rotation.set(0, 0, 0);

  const isNegativeLoad = yLoads.shear.value < 0;

  if (isNegativeLoad) {
    yShearArrow.rotateZ(Math.PI);
  }
  yShearArrow.rotateX(halfPI);
  yShearArrow.position.y = yAxisLength - 0.9;

  yShearText.position.y = yAxisLength - 1.1;
  yShearText.position.x = -0.2;

  yShearTextBox.geometry.dispose();
  yShearTextBox.geometry = new BoxGeometry(x * 2, y * 2, 0.01);

  yShearTextBox.position.y = yAxisLength - 1.1 + y;
  yShearTextBox.position.x = 0.2 - x;
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
        moment: {
          value: 0,
          onClick: () => { },
        },
        shear: {
          value: 0,
          onClick: () => { },
        },
      },
    },
    yLoads: {
      name: 'yLoads',
      default: {
        moment: {
          value: 0,
          onClick: () => { },
        },
        shear: {
          value: 0,
          onClick: () => { },
        },
      },
    },
    zLoads: {
      name: 'zLoads',
      default: {
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

    const { xMomentArrow, xMomentText, xMomentTextBox } = createXMoment(xLoads);
    const { yMomentArrow, yMomentText, yMomentTextBox } = createYMoment(yLoads);
    const { zMomentArrow, zMomentText, zMomentTextBox } = createZMoment(zLoads);

    const { xShearArrow, xShearText, xShearTextBox } = createXShear(xLoads);
    const { yShearArrow, yShearText, yShearTextBox } = createYShear(yLoads);


    requestAnimationFrame(() => {
      xAxisLabel.position.x = -calculeLength(xAxisLength);
      xAxisLabel.position.z -= xAxisLabel.geometry.boundingSphere.center.x;

      yAxisLabel.position.y = calculeLength(yAxisLength);
      yAxisLabel.position.x -= yAxisLabel.geometry.boundingSphere.center.x;

      zAxisLabel.position.z = -calculeLength(zAxisLength);
      zAxisLabel.position.x -= zAxisLabel.geometry.boundingSphere.center.x;

      // FORCES
      positionXMoment({ xMomentArrow, xMomentText, xMomentTextBox, xAxisLength, xLoads });

      positionYMoment({ yMomentArrow, yMomentText, yMomentTextBox, yAxisLength, yLoads });

      positionZMoment({ zMomentArrow, zMomentText, zMomentTextBox, zAxisLength, zLoads });

      // MOMENTS
      positionXShear({ xShearArrow, xShearText, xShearTextBox, xAxisLength, xLoads });

      positionYShear({ yShearArrow, yShearText, yShearTextBox, yAxisLength, yLoads });
    });


    root.add(xAxis);
    root.add(yAxis);
    root.add(zAxis);

    root.add(xAxisLabel);
    root.add(yAxisLabel);
    root.add(zAxisLabel);

    root.add(new Object3D().add(xMomentArrow).add(xMomentText).add(xMomentTextBox));
    root.add(new Object3D().add(yMomentArrow).add(yMomentText).add(yMomentTextBox));
    root.add(new Object3D().add(zMomentArrow).add(zMomentText).add(zMomentTextBox));

    root.add(new Object3D().add(xShearArrow).add(xShearText).add(xShearTextBox));
    root.add(new Object3D().add(yShearArrow).add(yShearText).add(yShearTextBox));

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
      { children: [xMomentArrow, xMomentText, xMomentTextBox] },
      { children: [yMomentArrow, yMomentText, yMomentTextBox] },
      { children: [zMomentArrow, zMomentText, zMomentTextBox] },
      { children: [xShearArrow, xShearText, xShearTextBox] },
      { children: [yShearArrow, yShearText, yShearTextBox] },
    ] = root.children;

    xAxis.setLength(xAxisLength, HEAD_LENGTH, HEAD_WIDTH);
    yAxis.setLength(yAxisLength, HEAD_LENGTH, HEAD_WIDTH);
    zAxis.setLength(zAxisLength, HEAD_LENGTH, HEAD_WIDTH);

    xMomentText.geometry.dispose();
    xMomentText.geometry = createTextGeometry(`Mx = ${xLoads.moment.value}`, LABEL_TEXT_SIZE);

    yMomentText.geometry.dispose();
    yMomentText.geometry = createTextGeometry(`My = ${yLoads.moment.value}`, LABEL_TEXT_SIZE);

    zMomentText.geometry.dispose();
    zMomentText.geometry = createTextGeometry(`Mz = ${zLoads.moment.value}`, LABEL_TEXT_SIZE);

    xShearText.geometry.dispose();
    xShearText.geometry = createTextGeometry(`Vx = ${xLoads.shear.value}`, LABEL_TEXT_SIZE);

    yShearText.geometry.dispose();
    yShearText.geometry = createTextGeometry(`Vy = ${yLoads.shear.value}`, LABEL_TEXT_SIZE);

    requestAnimationFrame(() => {
      xAxisLabel.position.x = -calculeLength(xAxisLength);
      yAxisLabel.position.y = calculeLength(yAxisLength);
      zAxisLabel.position.z = -calculeLength(zAxisLength);

      positionXMoment({ xMomentArrow, xMomentText, xMomentTextBox, xAxisLength, xLoads });

      positionYMoment({ yMomentArrow, yMomentText, yMomentTextBox, yAxisLength, yLoads });

      positionZMoment({ zMomentArrow, zMomentText, zMomentTextBox, zAxisLength, zLoads });

      positionXShear({ xShearArrow, xShearText, xShearTextBox, xAxisLength, xLoads });

      positionYShear({ yShearArrow, yShearText, yShearTextBox, yAxisLength, yLoads });
    });
  },
};
