import {
  BoxGeometry,
  Vector3,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} from 'three';

import {
  createPolyLine,
  createPolyLineGeometry,
  createText,
  createTextGeometry,
} from '../utils/geometry';
import LayerSet from '../utils/LayerSet';


function getTextValue({ length, prefix, suffix, formatter }) {
  const lengthAsString = formatter(length) || length.toFixed(2);

  return [prefix, lengthAsString, suffix]
    .filter((val) => val)
    .join(' ');
}

function setTextPosition(textObject, textBox, params) {
  const textOffset = 0.05;

  if (textObject.geometry.boundingSphere === null) {
    return;
  }
  const { x, y } = textObject.geometry.boundingSphere.center;

  textObject.position.x = params.length / 2 - x;
  textObject.position.z = params.extension + params.textSize + textOffset;

  textBox.position.x = params.length / 2;
  textBox.position.z = params.extension + params.textSize / 2 + textOffset;

  textBox.geometry.dispose();

  textBox.geometry = new BoxGeometry(x * 2, y * 2, 0);
}

export default {
  name: 'alignedDim',
  parameters: {
    formatter: { name: 'Formatter', default: () => { } },
    textSize: { name: 'Text Size', precision: 0.01, default: 0.1 },
    color: { name: 'Colour', type: 'color', default: '#000000' },
    length: { name: 'Length', precision: 0.05, default: 2 },
    prefix: { name: 'Prefix', default: '' },
    suffix: { name: 'Suffix', default: '' },
    onClick: { name: 'onClick', default: () => { } },
    isInteractive: { name: 'Interactive', default: true },
    extension: { name: 'Extension', precision: 0.05, default: 0.1 },
  },
  render(params) {
    const root = new Object3D();

    const { length, color, layer, extension, isInteractive } = params;

    // Render line
    const points = [
      [0, 0, 0],
      [0, 0, extension],
      [length, 0, extension],
      [length, 0, 0],
    ];
    const lineObject = createPolyLine(points, color);
    root.add(lineObject);

    // Render text
    const textValue = getTextValue(params);
    const textObject = createText(textValue, color);
    // Set initial rotation
    textObject.setRotationFromAxisAngle(new Vector3(1, 0, 0), Math.PI / -2);
    root.add(textObject);

    // Text surface for pointer capture
    const boxGeometry = new BoxGeometry(0, 0);
    const boxMaterial = new MeshBasicMaterial({ opacity: 0, transparent: true });
    const textBox = new Mesh(boxGeometry, boxMaterial);
    textBox.isInteractive = isInteractive;
    textBox.setRotationFromAxisAngle(new Vector3(1, 0, 0), Math.PI / -2);

    root.add(textBox);

    if (params.onClick) {
      textBox.onClick = (e) => params.onClick(e);
    }

    textBox.layerName = layer;
    lineObject.layerName = layer;
    textObject.layerName = layer;

    // Let the text render before using its dimensions
    // to calculate the central position
    requestAnimationFrame(() => {
      setTextPosition(textObject, textBox, params);

      LayerSet.addToLayer(layer, [lineObject, textObject, textBox]);
      LayerSet.addToLayer(layer, lineObject);
    });


    return root;
  },
  update(root, newParams) {
    const { length, textSize, layer, extension, isInteractive } = newParams;
    const [line, text, textBox] = root.children;

    line.geometry.dispose();
    const points = [
      [0, 0, 0],
      [0, 0, extension],
      [length, 0, extension],
      [length, 0, 0],
    ];
    line.geometry = createPolyLineGeometry(points);

    const textValue = getTextValue(newParams);
    text.geometry.dispose();
    text.geometry = createTextGeometry(textValue, textSize);

    textBox.isInteractive = isInteractive;

    requestAnimationFrame(() => {
      setTextPosition(text, textBox, newParams);

      LayerSet.addToLayer(layer, root.children);
    });
  },
};
