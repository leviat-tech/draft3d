import {
  BufferGeometry,
  ExtrudeGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  Shape,
  Vector3,
} from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import fontData from '../fonts/helvetiker_regular.typeface.json';


const font = new Font(fontData);


export function createLineGeometry(length) {
  const lineFrom = new Vector3(0, 0, 0);
  const lineTo = new Vector3(length, 0, 0);
  return new BufferGeometry().setFromPoints([lineFrom, lineTo]);
}


export function createLine(length, color = '#000000') {
  const lineGeometry = createLineGeometry(length);
  const lineMaterial = new LineBasicMaterial({ color });
  return new Line(lineGeometry, lineMaterial);
}


export function createTextGeometry(text, size = 0.1) {
  return new TextGeometry(text, {
    font,
    size,
    height: 0,
    curveSegments: 12,
    bevelEnabled: false,
  });
}

export function createExtrudeGeometry(shape, depth) {
  return new ExtrudeGeometry(shape, {
    bevelEnabled: false,
    depth,
  });
}


export function createText(text, color, size = 0.1) {
  const material = new LineBasicMaterial({ color });
  const geometry = createTextGeometry(text, size);

  return new Mesh(geometry, material);
}


export function createPolygon(path) {
  const shape = new Shape();

  shape.moveTo(...path[0]);

  path.slice(1).forEach((point) => {
    shape.lineTo(...point);
  });

  return shape;
}


export function vector2(x = 0, y = 0) {
  return { x, y };
}

export function vector3(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

export function dim2(width = 0, height = 0) {
  return { width, height };
}

export function dim3(width = 0, height = 0, depth = 1) {
  return { width, height, depth };
}


export function createPolyCurve(path) {
  const shape = new Shape();

  shape.moveTo(...path[0]);

  path.slice(1).forEach((point) => {
    const [x, y, cx, cy] = point;

    if (cx === undefined) {
      shape.lineTo(x, y);
    } else {
      shape.quadraticCurveTo(cx, cy, x, y);
    }
  });
  return shape;
}
