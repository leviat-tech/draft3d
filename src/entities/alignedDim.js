import {
  BoxGeometry,
  Vector3,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} from 'three';

import {
  createLine,
  createLineGeometry,
  createText,
  createTextGeometry,
} from '../utils/geometry';
import LayerSet from '../utils/LayerSet';

function getTextValue({ length, prefix, suffix }) {
  const lengthAsString = length.toFixed(2);
  return [prefix, lengthAsString, suffix]
    .filter((val) => val)
    .join(' ');
}

function setTextPosition(textObject, textBox, params) {
  if (textObject.geometry.boundingSphere === null) {
    return;
  }
  const { x, y } = textObject.geometry.boundingSphere.center;
  textObject.position.x = params.length / 2 - x;
  textObject.position.z = params.textSize * 1.5;

  textBox.position.x = x;
  textBox.position.y = y;
  textBox.geometry.dispose();
  textBox.geometry = new BoxGeometry(x * 2, y * 2, 0.06);
}

export default {
  name: 'alignedDim',
  parameters: {
    textSize: { name: 'Text Size', precision: 0.01, default: 0.1 },
    color: { name: 'Colour', type: 'color', default: '#000000' },
    length: { name: 'Length', precision: 0.05, default: 2 },
    prefix: { name: 'Prefix', default: '' },
    suffix: { name: 'Suffix', default: '' },
    onClick: { name: 'onClick', default: () => {} },
    layer: { name: 'Layer', type: 'string', default: 'test' },
  },
  render(params) {
    const root = new Object3D();

    const { length, color, layer } = params;

    // Render line
    const lineObject = createLine(length, color);
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
    root.add(textBox);

    if (params.onClick) {
      textBox.onClick = () => params.onClick();
    }

    // Let the text render before using its dimensions
    // to calculate the central position
    requestAnimationFrame(() => {
      setTextPosition(textObject, textBox, params);
    });

    LayerSet.addToLayer(layer, [lineObject, textObject, textBox]);
    LayerSet.addToLayer(layer, lineObject);

    return root;
  },
  update(root, newParams) {
    const { length, textSize, layer } = newParams;
    const [line, text, textBox] = root.children;

    line.geometry.dispose();
    line.geometry = createLineGeometry(length);

    const textValue = getTextValue(newParams);
    text.geometry.dispose();
    text.geometry = createTextGeometry(textValue, textSize);
    console.log(root)
    LayerSet.addToLayer(layer, root.children);

    requestAnimationFrame(() => {
      setTextPosition(text, textBox, newParams);
    });
  },
};
