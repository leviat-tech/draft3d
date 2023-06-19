import { Vector3, BufferGeometry, Line, LineBasicMaterial } from 'three';
import { defineEntity } from '../defineEntity.js';


export default defineEntity({
  name: 'line',
  parameters: {
    length: { name: 'length', type: 'number', default: 1 },
    color: { name: 'Colour', type: 'color', default: 'red' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
  },
  render(params) {
    const { length, color, opacity } = params;

    const material = new LineBasicMaterial({
      color, opacity, transparent: true,
    });

    const points = [
      new Vector3(0, 0, 0),
      new Vector3(length, 0, 0),
    ];

    const geometry = new BufferGeometry().setFromPoints(points);

    const line = new Line(geometry, material);

    return line;
  },
  update(object3d, params) {
    const { length, color, opacity } = params;

    const material = new LineBasicMaterial({
      color, opacity, transparent: true,
    });

    const points = [
      new Vector3(0, 0, 0),
      new Vector3(length, 0, 0),
    ];

    object3d.geometry?.dispose();
    object3d.geometry = new BufferGeometry().setFromPoints(points);
    object3d.material = material;
  },
});
