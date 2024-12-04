import { Line, LineBasicMaterial } from 'three';
import { createPolyLineGeometry } from '../utils/geometry';
import { defineEntity } from '../defineEntity';


export default defineEntity({
  name: 'polyline3d',
  parameters: {
    color: { name: 'Colour', type: 'color', default: 'black' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
    vertices: {
      name: 'Vertices',
      default: [
        [0, 0, 0],
        [2.5, 0, 0.5],
        [2.5, 2.5, 1],
        [0, 0, 0],
      ],
    },
  },

  render(params) {
    const { color, opacity, vertices } = params;

    const material = new LineBasicMaterial({
      color,
      opacity,
      transparent: true,
    });

    const geometry = createPolyLineGeometry(vertices);

    const polyline = new Line(geometry, material);

    return polyline;
  },
});
