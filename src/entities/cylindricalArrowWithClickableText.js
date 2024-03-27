import { Object3D } from 'three';
import cylindricalArrow from './cylindricalArrow';
import roundedCylindricalArrow from './roundedCylindricalArrow';
import { configureInteractivity } from '../utils/helpers';
import { defineEntity } from '../defineEntity';
import { createSpriteText } from '../utils/geometry';

export default defineEntity({
  name: 'cylindricalArrowWithClickableText',
  parameters: {
    text: { name: 'text', default: '' },
    length: { name: 'length', default: 0.2 },
    color: { name: 'color', default: 'black' },
    textSize: { name: 'textSize', default: 0.065 },
    onClick: { name: 'onClick', default: () => {} },
    isRounded: { name: 'isRounded', default: false },
    isInteractive: { name: 'isInteractive', default: true },
    radius: { name: 'radius', default: 0.02, precision: 0.02 },
    coneHeight: { name: 'coneHeight', default: 0.1, precision: 0.1 },
    circleRadius: { name: 'circleRadius', default: 0.01, precision: 0.01 },
    circledArrowConeHeight: {
      name: 'circledArrowConeHeight',
      default: 0.05,
      precision: 0.01,
    },
    coneRadius: { name: 'coneRadius', default: 0.03, precision: 0.01 },
    ellipseCurveRadius: {
      name: 'ellipseCurveRadius',
      default: 0.1,
      precision: 0.01,
    },
    rotateZAngle: { name: 'rotateZAngle', default: 174, precision: 1 },
    positionX: { name: 'positionX', default: 0.015, precision: 0.01 },
    positionZ: { name: 'positionZ', default: 0.096, precision: 0.01 },
    textColor: { name: 'textColor', default: 'black' },
    textPosition: { name: 'textPosition', default: [0, 0, 0]},
  },
  render(params) {
    const {
      color,
      length,
      layer,
      isRounded,
      radius,
      coneHeight,
      circleRadius,
      circledArrowConeHeight,
      coneRadius,
      ellipseCurveRadius,
      rotateZAngle,
      positionX,
      positionZ,
      textPosition,
      text,
      textSize,
      textColor,
    } = params;

    const textObject = createSpriteText(text, textSize, textColor);

    if (textPosition) {
      const [x, y, z] = textPosition;
      textObject.position.x = x;
      textObject.position.y = y;
      textObject.position.z = z;
    }

    const arrow = isRounded
      ? roundedCylindricalArrow.config.render({
          color,
          circleRadius,
          circledArrowConeHeight,
          coneRadius,
          ellipseCurveRadius,
          rotateZAngle,
          positionX,
          positionZ,
          layer,
        })
      : cylindricalArrow.config.render({
          length,
          color,
          radius,
          coneHeight,
          layer,
        });

    configureInteractivity(textObject, params);

    const object3D = new Object3D().add(arrow).add(textObject);
    return object3D;
  },

  update(object3d, newParams) {
    configureInteractivity(object3d, newParams);
  },
});
