import { Vector3, Object3D, ArrowHelper } from 'three';
import { createSpriteText } from '../utils/geometry';
import { createMaterial } from '../utils/material';
import { defineEntity } from '../defineEntity';

const COLORS = {
  RED: '#FF0000',
  BLUE: '#0000FF',
  GREEN: '#007500',
  BLACK: '#000000',
};

const DEFAULT_AXIS_TEXT_SIZE = 0.1;
const DEFAULT_HEAD_WIDTH = 0.1;
const DEFAULT_HEAD_LENGTH = 0.2;
const ORIGIN = new Vector3(0, 0, 0);
const AXIS_EXTENSION = 1.5;
const halfPI = Math.PI / 2;

const calculateLength = (length) => length + 0.03;

const createArrow = (vector, length, color, headLength, headWidth) => {
  const arrow = new ArrowHelper(
    vector,
    ORIGIN,
    length,
    color,
    headLength,
    headWidth
  );
  arrow.cone.material.dispose();
  arrow.cone.material = createMaterial(color, 1);
  return arrow;
};

const createAxesLength = (params) => ({
  xAxisLength: params.xAxisLength + AXIS_EXTENSION,
  yAxisLength: params.yAxisLength + AXIS_EXTENSION,
  zAxisLength: params.zAxisLength + AXIS_EXTENSION,
});

const createXAxis = (xAxisLength, textSize, color, headLength, headWidth) => {
  const xAxis = createArrow(
    new Vector3(0, 0, -1),
    xAxisLength,
    color,
    headLength,
    headWidth
  );
  const xAxisLabel = createSpriteText('X', textSize, color);
  xAxisLabel.position.z = -xAxisLength - 0.1;

  return { xAxis, xAxisLabel };
};

const createYAxis = (yAxisLength, textSize, color, headLength, headWidth, leftHandCoord) => {
  const yAxis = createArrow(
    leftHandCoord ? new Vector3(1, 0, 0) : new Vector3(-1, 0, 0),
    yAxisLength,
    color,
    headLength,
    headWidth,
  );
  const yAxisLabel = createSpriteText('Y', textSize, color);
  yAxisLabel.position.x = leftHandCoord ? yAxisLength + 0.1 : -yAxisLength - 0.1;

  return { yAxis, yAxisLabel };
};

const createZAxis = (zAxisLength, textSize, color, headLength, headWidth) => {
  const zAxis = createArrow(
    new Vector3(0, 1, 0),
    zAxisLength,
    color,
    headLength,
    headWidth
  );
  const zAxisLabel = createSpriteText('Z', textSize, color);
  zAxisLabel.position.y = +zAxisLength + 0.1;

  return { zAxis, zAxisLabel };
};

export default defineEntity({
  name: 'axes',
  parameters: {
    xAxisLength: { name: 'X axisLength', default: 0.8, precision: 0.1 },
    yAxisLength: { name: 'Y axisLength', default: 0.8, precision: 0.1 },
    zAxisLength: { name: 'Z axisLength', default: 0.8, precision: 0.1 },
    textSize: {
      name: 'Text size',
      default: DEFAULT_AXIS_TEXT_SIZE,
      precision: 0.1,
    },
    xColor: { name: 'X color', default: COLORS.RED },
    yColor: { name: 'Y color', default: COLORS.GREEN },
    zColor: { name: 'Z color', default: COLORS.BLUE },
    headLength: { name: 'Head length', default: DEFAULT_HEAD_LENGTH },
    headWidth: { name: 'Head width', default: DEFAULT_HEAD_WIDTH },
    leftHandCoord: { name: 'Left hand coord', default: false },
  },
  render(params) {
    const {
      textSize, xColor, yColor, zColor, headLength, headWidth, leftHandCoord,
    } = params;
    const { xAxisLength, yAxisLength, zAxisLength } = createAxesLength(params);

    const root = new Object3D();

    const { xAxis, xAxisLabel } = createXAxis(
      xAxisLength,
      textSize,
      xColor,
      headLength,
      headWidth
    );
    const { yAxis, yAxisLabel } = createYAxis(
      yAxisLength,
      textSize,
      yColor,
      headLength,
      headWidth,
      leftHandCoord,
    );
    const { zAxis, zAxisLabel } = createZAxis(
      zAxisLength,
      textSize,
      zColor,
      headLength,
      headWidth
    );

    root.add(xAxis);
    root.add(yAxis);
    root.add(zAxis);

    root.add(xAxisLabel);
    root.add(yAxisLabel);
    root.add(zAxisLabel);

    (function setLabelPostions(retryCount = 0) {
      if (retryCount === 10) return;

      if (!xAxisLabel.geometry.boundingSphere) {
        const RETRY_INTERVAL = 50;
        return setTimeout(
          () => setLabelPostions(retryCount + 1),
          RETRY_INTERVAL
        );
      }

      xAxisLabel.position.z = -calculateLength(xAxisLength);
      xAxisLabel.position.x -= xAxisLabel.geometry.boundingSphere.center.x;
      xAxisLabel.rotateY(-halfPI);

      yAxisLabel.position.x = leftHandCoord? calculateLength(yAxisLength) : -calculateLength(yAxisLength);
      yAxisLabel.position.z -= yAxisLabel.geometry.boundingSphere.center.x;
      yAxisLabel.rotateY(-halfPI);

      zAxisLabel.position.y = calculateLength(zAxisLength);
      zAxisLabel.position.x -= zAxisLabel.geometry.boundingSphere.center.x;
    })();

    return root;
  },
  
});
