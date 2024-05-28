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
  QuadraticBezierCurve3,
} from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import SpriteText from 'three-spritetext';
import fontData from '../fonts/lucida_regular.typeface.json';


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

export function calculateArcCenter(startPoint, endPoint, bulge) {
  // Calculate the midpoint
  const midX = (startPoint.x + endPoint.x) / 2;
  const midY = (startPoint.y + endPoint.y) / 2;

  // Calculate the distance between start and end points
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate the sagitta of the arc
  const s = 0.5 * distance * Math.abs(bulge);

  // Calculate the sagitta of the arc
  const radius = (distance * distance) / (8 * s) + s / 2;

  // Calculate the unit normal vector
  const nx = dx / distance;
  const ny = dy / distance;

  // Calculate the center
  const dir = (bulge < 0 && bulge > -1) || bulge > 1 ? -1 : 1;
  const centerX = midX + dir * Math.sqrt(radius * radius - distance * distance * 0.25) * (-ny);
  const centerY = midY + dir * Math.sqrt(radius * radius - distance * distance * 0.25) * nx;

  return { x: centerX, y: centerY, r: radius };
}

export function calculateArcAngles(startPoint, endPoint, center) {
  let startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);
  let endAngle = Math.atan2(endPoint.y - center.y, endPoint.x - center.x);

  startAngle = startAngle < 0 ? startAngle + 2 * Math.PI : startAngle;
  endAngle = endAngle < 0 ? endAngle + 2 * Math.PI : endAngle;

  return { startAngle, endAngle };
}

export function createPolyArcCurve(vertex) {
  const curvePath = new Shape();

  vertex.forEach((v, i) => {
    const [x1, y1, bulge1] = v;
    const [x2, y2] = i + 1 < vertex.length ? vertex[i + 1] : vertex[0];
    const start = new Vector3(x1, y1, 0);
    const end = new Vector3(x2, y2, 0);
    if (i === 0) curvePath.moveTo(x1, y1);
    if (bulge1 !== 0) {
      const center = calculateArcCenter(start, end, bulge1);
      const { startAngle, endAngle } = calculateArcAngles(start, end, center);
      const clockwise = bulge1 < 0;
      curvePath.absarc(center.x, center.y, center.r, startAngle, endAngle, clockwise);
    } else {
      curvePath.lineTo(x2, y2);
    }
  });

  return curvePath;
}

export function createPolyCurve(path) {
  const curvePath = new Shape();

  path.slice(1).forEach((point, i) => {
    const [x1, y1] = path[i];
    const [x2, y2, cx, cy] = point;
    const start = new Vector3(x1, y1, 0);
    const end = new Vector3(x2, y2, 0);

    const controlPoint = cx !== undefined ? new Vector3(cx, cy, 0) : new Vector3(x2, y2, 0);
    const curve = new QuadraticBezierCurve3(start, controlPoint, end);

    curvePath.add(curve);
  });

  return curvePath;
}

// approximate circleGeometry but as a shape so extrusion works properly
export function createCircle(radius) {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.absarc(0, 0, radius, 0, Math.PI * 1.75, false);
  shape.moveTo(0, 0);
  return shape;
}

export function create3dPath(
  path,
  closed,
  curveType = 'catmullrom',
  tension = 0.5,
) {
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

  boxMaterial.alphaTest = 0.1;

  textBox.isInteractive = true;
  textBox.onClick = (e) => onClick(e);

  return textBox;
}

export function replaceGeometry(object3d, newGeometry) {
  object3d.geometry?.dispose();
  object3d.geometry = newGeometry;
}

export function createSpriteText(label, textSize, color) {
  const spriteText = new SpriteText(label, textSize, color);
  spriteText.renderOrder = 999;
  spriteText.material.depthTest = false;
  spriteText.material.depthWrite = false;
  spriteText.material.visible = true;
  spriteText.backgroundColor = false;
  spriteText.fontFace = 'Lucida Console, MS Mono, sans-serif';

  return spriteText;
}

/**
 * Generate the geometry for a tube cap
 * Based on https://jsfiddle.net/prisoner849/yueLpdb2/
 * @param curve
 * @param { number } t - 0 (start) or 1 (end)
 * @param tubeGeometry - the geometry of the tube to be capped
 * @return { BufferGeometry }
 */
export function getCapGeometry(curve, t, tubeGeometry) {
  const pos = tubeGeometry.attributes.position;
  const steps = tubeGeometry.parameters.tubularSegments;
  const segments = tubeGeometry.parameters.radialSegments;

  const points = [curve.getPoint(t)];

  const start = 0;
  const startIndex = t === start ? 0 : (segments + 1) * steps;
  const maxIndex = t === start ? segments : pos.count - 1;

  for (let i = startIndex; i <= maxIndex; i += 1) {
    points.push(new Vector3().fromBufferAttribute(pos, i));
  }

  const pointsGeometry = new BufferGeometry().setFromPoints(points);
  const index = [];
  for (let i = 1; i < pointsGeometry.attributes.position.count - 1; i += 1) {
    index.push(0, i + 1, i);
  }
  pointsGeometry.setIndex(index);

  return pointsGeometry;
}
