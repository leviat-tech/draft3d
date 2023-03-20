import {
  Line,
  Mesh,
  Shape,
  Vector3,
  BoxGeometry,
  BufferGeometry,
  ExtrudeGeometry,
  CatmullRomCurve3,
  MeshBasicMaterial,
  LineBasicMaterial,
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

export function createPolyLineGeometry(points) {
  const vectors = points.map((point) => new Vector3(...point));
  return new BufferGeometry().setFromPoints(vectors);
}

export function createPolyLine(points, color = '#000000') {
  const lineGeometry = createPolyLineGeometry(points);
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

// approximate circleGeometry but as a shape so extrusion works properly
export function createCircle(radius) {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.absarc(0, 0, radius, 0, Math.PI * 1.75, false);
  shape.moveTo(0, 0);
  return shape;
}

export function create3dPath(path, closed, curveType = 'catmullrom', tension = 0.5) {
  const points = [];

  path.forEach((point) => {
    points.push(new Vector3(...point));
  });
  const curve = new CatmullRomCurve3(points);
  curve.curveType = curveType;
  curve.closed = closed;
  curve.tension = tension;
  return curve;
}

export function createTextBox(onClick) {
  const boxGeometry = new BoxGeometry(0, 0);
  const boxMaterial = new MeshBasicMaterial({ opacity: 0, transparent: true });
  const textBox = new Mesh(boxGeometry, boxMaterial);

  textBox.isInteractive = true;
  textBox.onClick = (e) => onClick(e);

  return textBox;
}
