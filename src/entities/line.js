import { Vector3, BufferGeometry, Line, LineBasicMaterial } from 'three';
import { defineEntity } from '../defineEntity';

export default defineEntity({
  name: 'line',
  parameters: {
    length: { name: 'length', type: 'number', default: 1 },
    color: { name: 'Colour', type: 'color', default: 'red' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
    startPoint: { name: 'startPoint' },
    endPoint: { name: 'startPoint' },
  },
  render(params) {
    const { length, color, opacity, startPoint, endPoint } = params;

    const material = new LineBasicMaterial({
      color,
      opacity,
      transparent: true,
    });

    let points;

    if (Array.isArray(startPoint) && Array.isArray(endPoint)) {
      points = [
        new Vector3(startPoint[0], startPoint[1], startPoint[2]),
        new Vector3(endPoint[0], endPoint[1], endPoint[2]),
      ];
    } else {
      points = [new Vector3(0, 0, 0), new Vector3(length, 0, 0)];
    }

    const geometry = new BufferGeometry().setFromPoints(points);

    const line = new Line(geometry, material);

    return line;
  },
});
