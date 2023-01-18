import { Object3D } from 'three';

import { createText, createTextBox } from '../utils/geometry';

import cylindricalArrow from './cylindricalArrow';
import roundedCylindricalArrow from './roundedCylindricalArrow';


const LABEL_TEXT_SIZE = 0.1;
const LABEL_COLOR = '#000000';

const createLabel = (text) => createText(text, LABEL_COLOR, LABEL_TEXT_SIZE);

export default {
  name: 'cylindricalArrowWithClickableText',
  parameters: {
    text: { name: 'text', default: '' },
    length: { name: 'length', default: 0.2 },
    color: { name: 'color', default: 'black' },
    onClick: { name: 'onClick', default: () => { } },
    isRounded: { name: 'isRounded', default: false },
    layer: { name: 'layer', type: 'string', default: 'default' },
  },
  render(params) {
    const { color, length, onClick, layer, isRounded } = params;

    const text = createLabel(params.text);
    const textBox = createTextBox(onClick);
    const arrow = isRounded
      ? roundedCylindricalArrow.render({ color, layer })
      : cylindricalArrow.render({ length, color, layer });

    const object3D = new Object3D().add(arrow).add(text).add(textBox);

    return object3D;
  },
  update() { },
};
