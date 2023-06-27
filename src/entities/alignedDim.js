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
  const { color, size } = crosshairParams;
  const circleGeometry = new BufferGeometry().setFromPoints(
    new Path().absarc(0, 0, size, 0, Math.PI * 2).getSpacedPoints(32)
  );

  const circleMaterial = new LineBasicMaterial({ color });
  const crosshair = new Line(circleGeometry, circleMaterial);
  crosshair.rotation.set(Math.PI / 2, 0, 0);

  return crosshair;
}

function createCrosshairs(params) {
  const { textSize, color } = params;

  // Circles
  const crosshairDefaults = {
    color,
    size: textSize / 8,
  };

  const startCrosshair = createCrosshair(crosshairDefaults);
  const endCrosshair = createCrosshair(crosshairDefaults);

  return [startCrosshair, endCrosshair];
}

export default defineEntity({
  name: 'alignedDim',
  parameters: {
    formatter: { name: 'Formatter', default: () => {} },
    textSize: { name: 'Text Size', precision: 0.01, default: 0.1 },
    color: { name: 'Colour', type: 'color', default: '#000000' },
    length: { name: 'Length', precision: 0.05, default: 1 },
    prefix: { name: 'Prefix', default: '' },
    suffix: { name: 'Suffix', default: '' },
    onClick: { name: 'onClick', default: () => {} },
    isInteractive: { name: 'Interactive', default: true },
    extension: { name: 'Extension', precision: 0.05, default: 0.1 },
  },
  render(params) {
    const root = new Object3D();

    const { length, textSize, color, extension } = params;

    const overflowLineLength = textSize / 4;

    // Render line
    // const points = [
    //   [0, 0, 0],
    //   [0, 0, extension],
    //   [length, 0, extension],
    //   [length, 0, 0],
    // ];

    //need to be overflow length/2 at each end
    const mainLinePoints = [
      [-overflowLineLength, 0, extension],
      [length + overflowLineLength, 0, extension],
    ];
    const mainLine = createPolyLine(mainLinePoints);

    const startLinePoints = [
      [0, 0, 0],
      [0, 0, extension + overflowLineLength],
    ];
    const startLine = createPolyLine(startLinePoints);

    const endLinePoints = [
      [length, 0, 0],
      [length, 0, extension + overflowLineLength],
    ];
    const endLine = createPolyLine(endLinePoints);

    const [startCrosshair, endCrosshair] = createCrosshairs(params);

    startCrosshair.position.z = extension;
    endCrosshair.position.z = extension;
    endCrosshair.position.x = length;

    // Render text
    const textValue = getTextValue(params);
    const textObject = createText(textValue, color, textSize);
    // Set initial rotation
    textObject.setRotationFromAxisAngle(new Vector3(1, 0, 0), Math.PI / -2);

    // Text surface for pointer capture
    const boxGeometry = new BoxGeometry(0, 0);
    const boxMaterial = new MeshBasicMaterial({
      opacity: 0,
      transparent: true,
    });
    const textBox = new Mesh(boxGeometry, boxMaterial);
    textBox.setRotationFromAxisAngle(new Vector3(1, 0, 0), Math.PI / -2);

    root.add(mainLine);
    root.add(startLine);
    root.add(endLine);
    root.add(startCrosshair);
    root.add(endCrosshair);
    root.add(textObject);
    root.add(textBox);

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

    const overflowLineLength = textSize / 4;

    let [
      mainLine,
      startLine,
      endLine,
      startCrosshair,
      endCrosshair,
      textObject,
      textBox,
    ] = root.children;

    mainLine.geometry.dispose();
    const mainLinePoints = [
      [-overflowLineLength, 0, extension],
      [length + overflowLineLength, 0, extension],
    ];
    mainLine.geometry = createPolyLineGeometry(mainLinePoints);

    const startLinePoints = [
      [0, 0, 0],
      [0, 0, extension + overflowLineLength],
    ];

    startLine.geometry.dispose();
    startLine.geometry = createPolyLineGeometry(startLinePoints);

    const endLinePoints = [
      [length, 0, 0],
      [length, 0, extension + overflowLineLength],
    ];

    endLine.geometry.dispose();
    endLine.geometry = createPolyLineGeometry(endLinePoints);

    const textValue = getTextValue(newParams);
    textObject.geometry.dispose();
    textObject.geometry = createTextGeometry(textValue, textSize);

    startCrosshair.position.z = extension;
    endCrosshair.position.z = extension;
    endCrosshair.position.x = length;

    requestAnimationFrame(() => {
      setTextPosition(textObject, textBox, newParams);
    });

    configureInteractivity(textBox, newParams);
  },
});
