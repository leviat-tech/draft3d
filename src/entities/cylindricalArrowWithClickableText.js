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
  },
  render(params) {
    const text = createLabel(params.text);
    const textBox = createTextBox(params.onClick);
    const arrow = params.isRounded
      ? roundedCylindricalArrow.render({ color: params.color })
      : cylindricalArrow.render({ length: params.length, color: params.color });

    return new Object3D().add(arrow).add(text).add(textBox);
  },
  update() { },
};
