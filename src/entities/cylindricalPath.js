import {
  BufferGeometry,
  Mesh,
  TubeGeometry,
  Vector3,
} from 'three';
import { createMaterial, updateMaterial } from '../utils/material';
import {
  create3dPath,
  createPolyCurve,
  replaceGeometry,
} from '../utils/geometry';
import { defineEntity } from '../defineEntity.js';


const START = 0;
const END = 1;

/**
 * Generate the geometry for a tube cap
 * Based on https://jsfiddle.net/prisoner849/yueLpdb2/
 * @param curve
 * @param { number } t - 0 (start) or 1 (end)
 * @param tubeGeometry - the geometry of the tube to be capped
 * @return { BufferGeometry }
 */
function getCapGeometry(curve, t, tubeGeometry) {
  const pos = tubeGeometry.attributes.position;
  const steps = tubeGeometry.parameters.tubularSegments;
  const segments = tubeGeometry.parameters.radialSegments;

  const points = [curve.getPoint(t)];

  const startIndex = t === START ? 0 : (segments + 1) * steps;
  const maxIndex = t === START ? segments : pos.count - 1;

  for (let i = startIndex; i <= maxIndex; i++) {
    points.push(new Vector3().fromBufferAttribute(pos, i));
  }

  const pointsGeometry = new BufferGeometry().setFromPoints(points);
  const index = [];
  for (let i = 1; i < pointsGeometry.attributes.position.count - 1; i++) {
    index.push(0, i + 1, i);
  }
  pointsGeometry.setIndex(index);

  return pointsGeometry;
}

export default defineEntity({
  name: 'cylindricalPath',
  parameters: {
    tension: { name: 'tension', default: 0.5 },
    curveType: { name: 'curveType', default: 'quadratic' },
    radius: { name: 'Radius', precision: 0.1, default: 0.2 },
    segments: { name: 'Segments', type: 'number', default: 24 },
    closed: { name: 'Closed', type: 'boolean', default: false },
    solid: { name: 'Solid', type: 'boolean', default: true },
    color: { name: 'Colour', type: 'color', default: '#6666aa' },
    steps: { name: 'steps', precision: 10, default: 100, min: 10 },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
    path: {
      name: 'Path',
      items: { type: 'curve', precision: 0.1, default: [0, 0, 0, 0] },
      default: [
        [-2, 0],
        [0, 1],
        [1, 2, 0, 2],
        [2, 1, 2, 2],
        [3, 0, 2, 0],
        [4, 1],
      ],
    },
  },
  render(params) {
    const {
      radius, color, opacity, path, closed, solid, steps, segments, curveType, tension,
    } = params;
    const material = createMaterial(color, opacity);
    const curve = curveType === 'quadratic'
      ? createPolyCurve(path)
      : create3dPath(path, closed, curveType, tension);

    const tubeGeometry = new TubeGeometry(curve, steps, radius, segments, closed);
    const tube = new Mesh(tubeGeometry, material);

    if (solid) {
      const startCapGeometry = getCapGeometry(curve, START, tubeGeometry);
      const endCapGeometry = getCapGeometry(curve, END, tubeGeometry);
      const capMaterial = createMaterial(color, opacity, true);
      const startCap = new Mesh(startCapGeometry, capMaterial);
      const endCap = new Mesh(endCapGeometry, capMaterial);

      tube.add(startCap, endCap);
    }

    return tube;
  },
  update(object3d, newParams) {
    const {
      radius, color, opacity, path, solid, closed, steps, segments, curveType, tension,
    } = newParams;

    updateMaterial(object3d, color, opacity);

    const curve = curveType === 'quadratic' ? createPolyCurve(path) : create3dPath(path, closed, curveType, tension);
    const tubeGeometry = new TubeGeometry(curve, steps, radius, segments, closed);

    replaceGeometry(object3d, tubeGeometry);

    let [startCap, endCap] = object3d.children;

    if (solid) {
      if (!startCap) {
        const startCapGeometry = getCapGeometry(curve, START, tubeGeometry);
        const endCapGeometry = getCapGeometry(curve, END, tubeGeometry);
        const capMaterial = createMaterial(color, opacity, true);

        startCap = new Mesh(startCapGeometry, capMaterial);
        endCap = new Mesh(endCapGeometry, capMaterial);
        object3d.add(startCap, endCap);
      } else {
        replaceGeometry(startCap, getCapGeometry(curve, START, tubeGeometry));
        replaceGeometry(endCap, getCapGeometry(curve, END, tubeGeometry));
      }
    } else {
      object3d.remove(startCap);
      object3d.remove(endCap);
      startCap?.geometry?.dispose();
      endCap?.geometry?.dispose();
    }
  },
});
