import {
  BoxGeometry,
  Vector3,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  LineBasicMaterial,
  Line,
  BufferGeometry,
  Path,
} from 'three';

import {
  createPolyLine,
  createPolyLineGeometry,
  createText,
  createTextGeometry,
} from '../utils/geometry';
import { configureInteractivity } from '../utils/helpers';
import { defineEntity } from '../defineEntity';

function getTextValue({ length, prefix, suffix, formatter }) {
  const lengthAsString = formatter(length) || length.toFixed(2);

  return [prefix, lengthAsString, suffix].filter((val) => val).join(' ');
}

function setTextPosition(textObject, textBox, params, retryCount = 0) {
  const textOffset = 0.05;

  if (retryCount === 10) return;

  if (!textObject.geometry.boundingSphere) {
    const RETRY_INTERVAL = 100;
    return setTimeout(() => {
      setTextPosition(textObject, textBox, params, retryCount + 1);
    }, RETRY_INTERVAL);
  }
  const { x, y } = textObject.geometry.boundingSphere.center;

  textObject.position.x = params.length / 2 - x;
  textObject.position.z = params.extension + params.textSize + textOffset;

  textBox.position.x = params.length / 2;
  textBox.position.z = params.extension + params.textSize / 2 + textOffset;

  textBox.geometry.dispose();

  textBox.geometry = new BoxGeometry(x * 2, y * 2, 0);
}

function createCrosshair(crosshairParams) {
  const { plotPoint, color, size, extension } = crosshairParams;
  const circleGeometry = new BufferGeometry().setFromPoints(
    new Path().absarc(plotPoint, 0, size, 0, Math.PI * 2).getSpacedPoints(32)
  );

  const circleMaterial = new LineBasicMaterial({ color });
  const crosshair = new Line(circleGeometry, circleMaterial);
  crosshair.position.z = extension;
  crosshair.rotation.set(Math.PI / 2, 0, 0);

  return crosshair;
}

function createCrosshairs(params) {
  const { length, textSize, color, extension } = params;

  // Overflow lines
  const overflowLineLength = textSize / 4;

  const startXAxisOverflowPoints = [
    [0, 0, extension],
    [-overflowLineLength, 0, extension],
  ];
  const startXAxisLine = createPolyLine(startXAxisOverflowPoints, '#ff0000');

  const startZAxisOverflowPoints = [
    [0, 0, extension],
    [0, 0, extension + overflowLineLength],
  ];
  const startZAxisLine = createPolyLine(startZAxisOverflowPoints, '#00ff00');

  // Circles
  const crosshairDefaults = {
    plotPoint: 0,
    color,
    size: textSize / 8,
    extension,
  };

  const startCrosshair = createCrosshair(crosshairDefaults);

  const endCrosshair = createCrosshair({
    ...crosshairDefaults,
    plotPoint: length,
    extension,
  });

  return [startXAxisLine, startZAxisLine, startCrosshair, endCrosshair];
}

export default defineEntity({
  name: 'alignedDim',
  parameters: {
    formatter: { name: 'Formatter', default: () => {} },
    textSize: { name: 'Text Size', precision: 0.01, default: 0.1 },
    color: { name: 'Colour', type: 'color', default: '#000000' },
    length: { name: 'Length', precision: 0.05, default: 2 },
    prefix: { name: 'Prefix', default: '' },
    suffix: { name: 'Suffix', default: '' },
    onClick: { name: 'onClick', default: () => {} },
    isInteractive: { name: 'Interactive', default: true },
    extension: { name: 'Extension', precision: 0.05, default: 0.1 },
  },
  render(params) {
    const root = new Object3D();

    const { length, textSize, color, extension } = params;

    // Render line
    const points = [
      [0, 0, 0],
      [0, 0, extension],
      [length, 0, extension],
      [length, 0, 0],
    ];
    const lineObject = createPolyLine(points);
    root.add(lineObject);

    // Render text
    const textValue = getTextValue(params);
    const textObject = createText(textValue, color, textSize);
    // Set initial rotation
    textObject.setRotationFromAxisAngle(new Vector3(1, 0, 0), Math.PI / -2);
    root.add(textObject);

    // Text surface for pointer capture
    const boxGeometry = new BoxGeometry(0, 0);
    const boxMaterial = new MeshBasicMaterial({
      opacity: 0,
      transparent: true,
    });
    const textBox = new Mesh(boxGeometry, boxMaterial);
    textBox.setRotationFromAxisAngle(new Vector3(1, 0, 0), Math.PI / -2);

    root.add(textBox);

    const [x, z, s, e] = createCrosshairs(params);
    root.add(x);
    root.add(z);
    root.add(s);
    root.add(e);

    // Let the text render before using its dimensions
    // to calculate the central position
    requestAnimationFrame(() => {
      setTextPosition(textObject, textBox, params);
    });

    configureInteractivity(textBox, params);

    return root;
  },
  update(root, newParams) {
    const { length, textSize, extension } = newParams;
    let [
      lineObject,
      textObject,
      textBox,
      xAxisLine,
      zAxisLine,
      startCrosshair,
      endCrosshair,
    ] = root.children;

    lineObject.geometry.dispose();
    const points = [
      [0, 0, 0],
      [0, 0, extension],
      [length, 0, extension],
      [length, 0, 0],
    ];
    lineObject.geometry = createPolyLineGeometry(points);

    const textValue = getTextValue(newParams);
    textObject.geometry.dispose();
    textObject.geometry = createTextGeometry(textValue, textSize);

    const [x, z, s, e] = createCrosshairs(newParams);

    xAxisLine.geometry.dispose();
    zAxisLine.geometry.dispose();
    startCrosshair.geometry.dispose();
    endCrosshair.geometry.dispose();
    //xAxisLine = x;
    //zAxisLine = z;
    //startCrosshair = s;
    //endCrosshair = e;

    requestAnimationFrame(() => {
      setTextPosition(textObject, textBox, newParams);
    });

    configureInteractivity(textBox, newParams);
  },
});
