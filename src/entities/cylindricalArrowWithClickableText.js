import { Object3D } from 'three';

import { createText, createTextBox } from '../utils/geometry';

import cylindricalArrow from './cylindricalArrow';
import roundedCylindricalArrow from './roundedCylindricalArrow';

import { configureInteractivity } from '../utils/helpers';
import { defineEntity } from '../defineEntity';


const LABEL_COLOR = '#000000';

const createLabel = (text, textSize) => createText(text, LABEL_COLOR, textSize);

export default defineEntity({
  name: 'cylindricalArrowWithClickableText',
  parameters: {
    text: { name: 'text', default: '' },
    length: { name: 'length', default: 0.2 },
    color: { name: 'color', default: 'black' },
    textSize: { name: 'textSize', default: 0.065 },
    onClick: { name: 'onClick', default: () => { } },
    isRounded: { name: 'isRounded', default: false },
    isInteractive: { name: 'isInteractive', default: true },
    radius: { name: 'radius', default: 0.02, precision: 0.02 },
    coneHeight: { name: 'coneHeight', default: 0.1, precision: 0.1 },
  },
  render(params) {
    const {
      color,
      length,
      onClick,
      layer,
      isRounded,
      radius,
      coneHeight,
    } = params;

    const text = createLabel(params.text, params.textSize);
    const textBox = createTextBox(onClick);
    const arrow = isRounded
      ? roundedCylindricalArrow.config.render({ color, layer })
      : cylindricalArrow.config.render({ length, color, radius, coneHeight, layer });

    configureInteractivity(textBox, params);

    const object3D = new Object3D().add(arrow).add(text).add(textBox);

    return object3D;
  },

  update(object3d, newParams) {
    configureInteractivity(object3d, newParams);
  },
});
