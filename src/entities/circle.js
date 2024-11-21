import { BufferGeometry, Path, Line, LineBasicMaterial } from 'three';
import { defineEntity } from '../defineEntity';


export default defineEntity({
  name: 'circle',
  parameters: {
    radius: { name: 'radius', type: 'number', default: 1 },
    color: { name: 'Colour', type: 'color', default: 'black' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
  },
  render(params) {
    const { radius, color, opacity } = params;

    const material = new LineBasicMaterial({
      color, opacity, transparent: true,
    });

    const points = new Path().absarc(0, 0, radius, 0, Math.PI * 2).getSpacedPoints(50);

    const geometry = new BufferGeometry().setFromPoints(points);

    const c = new Line(geometry, material);

    return c;
  },

  update(object3d, params) {
    const { radius, color, opacity } = params;

    const material = new LineBasicMaterial({
      color, opacity, transparent: true,
    });

    const points = new Path().absarc(0, 0, radius, 0, Math.PI * 2).getSpacedPoints(50);

    object3d.geometry?.dispose();
    object3d.geometry = new BufferGeometry().setFromPoints(points);
    object3d.material = material;
  },
});
