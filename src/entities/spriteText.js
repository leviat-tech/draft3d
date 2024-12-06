import { createSpriteText } from '../utils/geometry';
import { configureInteractivity } from '../utils/helpers';
import { defineEntity } from '../defineEntity';


export function getTextValue({ text, prefix, suffix, formatter }) {
  const lengthAsString = formatter(text) || text;

  return [prefix, lengthAsString, suffix].filter((val) => val).join(' ');
}

export default defineEntity({
  name: 'spriteText',
  parameters: {
    prefix: { name: 'Prefix', default: '' },
    suffix: { name: 'Suffix', default: '' },
    text: { name: 'Text', default: 'Text' },
    onClick: { name: 'onClick', default: () => {} },
    formatter: { name: 'Formatter', default: () => {} },
    color: { name: 'Colour', type: 'color', default: '#000000' },
    textSize: { name: 'Text Size', precision: 0.01, default: 0.1 },
  },
  render(params) {
    const textValue = getTextValue(params);

    const textObject = createSpriteText(textValue, params.textSize, params.color);

    configureInteractivity(textObject, params);

    return textObject;
  },
});
