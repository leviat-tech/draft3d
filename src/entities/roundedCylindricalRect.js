import { Shape } from 'three';
import cylindricalPath from './cylindricalPath';


function generateShape({ width, height, bendRadius }) {
  const x = 0;
  const y = 0;

  const shape = new Shape();

  shape.moveTo(x, y + bendRadius);
  shape.lineTo(x, y + height - bendRadius);
  shape.quadraticCurveTo(x, y + height, x + bendRadius, y + height);
  shape.lineTo(x + width - bendRadius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - bendRadius);
  shape.lineTo(x + width, y + bendRadius);
  shape.quadraticCurveTo(x + width, y, x + width - bendRadius, y);
  shape.lineTo(x + bendRadius, y);
  shape.quadraticCurveTo(x, y, x, y + bendRadius);

  return shape;
}

const defaultParams = {
  steps: 400,
  closed: false,
  curveType: 'centripetal',
};

export default {
  name: 'roundedCylindricalRect',
  parameters: {
    width: { name: 'width', default: 3 },
    height: { name: 'height', default: 3 },
    opacity: { name: 'opacity', default: 1 },
    color: { name: 'color', default: '#000000' },
    shapeRadius: { name: 'shapeRadius', default: 0.01 },
    bendRadius: { name: 'bendRadius', precision: 0.1, default: 0.09 },
  },
  render(params) {
    const {
      bendRadius, width, height, color, opacity, shapeRadius,
    } = params;

    return cylindricalPath.render({
      ...defaultParams,
      color,
      opacity,
      radius: shapeRadius,
      path: generateShape({ width, height, bendRadius }).getPoints(),
    });
  },
  update(object3d, params) {
    const {
      bendRadius, width, height, color, opacity, shapeRadius,
    } = params;

    object3d.geometry?.dispose();

    object3d.geometry = cylindricalPath.render({
      ...defaultParams,

      color,
      opacity,
      radius: shapeRadius,
      path: generateShape({ width, height, bendRadius }).getPoints(),
    }).geometry;
  },
};
