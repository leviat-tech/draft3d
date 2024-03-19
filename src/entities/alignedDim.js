import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  LineBasicMaterial,
  Line,
  BufferGeometry,
  Path,
  Sprite,
  SpriteMaterial,
} from 'three';

import { createPolyLine } from '../utils/geometry';
import { configureInteractivity } from '../utils/helpers';
import { defineEntity } from '../defineEntity';
import SpriteText from 'three-spritetext';

function getTextValue({ length, prefix, suffix, formatter }) {
  const lengthAsString = formatter(length) || length.toFixed(2);

  return [prefix, lengthAsString, suffix].filter((val) => val).join(' ');
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

function createExtensionLines(params) {
  const { length, textSize, extension } = params;

  const overflowLineLength = textSize / 2;

  const mainLinePoints = [
    [-overflowLineLength, 0, extension],
    [length + overflowLineLength, 0, extension],
  ];
  const mainLine = createPolyLine(mainLinePoints, '#959695');

  const startExtensionLinePoints = [
    [0, 0, 0],
    [0, 0, extension + overflowLineLength],
  ];

  const startExtensionLine = createPolyLine(
    startExtensionLinePoints,
    '#959695'
  );

  const endExtensionLinePoints = [
    [length, 0, 0],
    [length, 0, extension + overflowLineLength],
  ];

  const endExtensionLine = createPolyLine(endExtensionLinePoints, '#959695');

  return [mainLine, startExtensionLine, endExtensionLine];
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
    const [mainLine, startExtensionLine, endExtensionLine] =
      createExtensionLines(params);
    const [startCrosshair, endCrosshair] = createCrosshairs(params);

    startCrosshair.position.z = extension;
    endCrosshair.position.z = extension;
    endCrosshair.position.x = length;

    // Render text
    const textValue = getTextValue(params);
    const textObject = new SpriteText(textValue, textSize, color);

    textObject.renderOrder = 999;
    textObject.material.depthTest = false;
    textObject.material.depthWrite = false;

    textObject.material.visible = true;
    textObject.backgroundColor = false;
    textObject.fontFace = 'Lucida Console, MS Mono, sans-serif';

    textObject.position.x = length / 2;
    textObject.position.z = extension;

    [
      mainLine,
      startExtensionLine,
      endExtensionLine,
      startCrosshair,
      endCrosshair,
      textObject,
    ].forEach((x) => root.add(x));

    configureInteractivity(textObject, params);

    return root;
  },

  update(root, newParams) {
    const { length, extension } = newParams;

    const [
      mainLine,
      startExtensionLine,
      endExtensionLine,
      startCrosshair,
      endCrosshair,
      textObject,
    ] = root.children;

    [mainLine, startExtensionLine, endExtensionLine, textObject].forEach((x) =>
      x.geometry.dispose()
    );

    const [main, start, end] = createExtensionLines(newParams);

    mainLine.geometry = main.geometry;
    startExtensionLine.geometry = start.geometry;
    endExtensionLine.geometry = end.geometry;

    const textValue = getTextValue(newParams);
    textObject.text = textValue;

    startCrosshair.position.z = extension;
    endCrosshair.position.z = extension;
    endCrosshair.position.x = length;

    configureInteractivity(textObject, newParams);
  },
});
