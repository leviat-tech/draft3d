import {
  BoxGeometry,
  BufferGeometry,
  Line,
  Vector3,
  Mesh,
  MeshBasicMaterial,
  LineBasicMaterial,
  Object3D,
} from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import fontData from '../fonts/helvetiker_regular.typeface.json';

const font = new Font(fontData);

class AlignedDim extends Object3D {
  isInteractive = true

  constructor(params) {
    super();

    const geometry = this.getLineGeometry(params);
    const material = new LineBasicMaterial({ color: 0x000000 });

    this.value = params.length;
    this.line = new Line(geometry, material);
    this.add(this.line);
    this.setPosition(params);
    this.setRotation(params.rotation);

    this.createText(() => {
      this.setTextPosition(params);
      this.text.add(this.textBox);
    });

    if (params.onClick) this.onClick = params.onClick.bind(this);
  }

  getLineGeometry(params) {
    const lineFrom = new Vector3(0, 0, 0);
    const lineTo = new Vector3(params.length, 0, 0);
    return new BufferGeometry().setFromPoints([lineFrom, lineTo]);
  }

  getTextGeometry(text) {
    const str = typeof text === 'number' ? text.toFixed(2) : parseFloat(text).toFixed(2);

    return new TextGeometry(str, {
      font,
      size: 0.08,
      height: 0,
      curveSegments: 12,
      bevelEnabled: false,
      bevelThickness: 0,
      bevelSize: 0,
      bevelOffset: 0,
      bevelSegments: 0,
    });
  }

  setTextPosition(params) {
    const center = this.text.geometry?.boundingSphere.center;
    const vPaddingFactor = 0.75;
    const { x, y } = this.text.geometry.boundingSphere.center;
    this.text.position.x = params.length / 2 - x;
    this.text.position.z = (2 + vPaddingFactor) * y;

    this.textBox.position.x = x;
    this.textBox.position.y = y;
    this.textBox.geometry.dispose();
    this.textBox.geometry = new BoxGeometry(x * 2, y * 2, 0.06);
  }

  setPosition(params) {
    this.position.set(...params.position);

    if (!params.offset) return;

    const { axis, distance } = params.offset;
    this.position[axis] += distance;
  }

  setRotation(rotation) {
    if (!rotation) return;

    const degToRad = (deg) => deg * Math.PI / 180;
    const { x, y, z } = rotation;

    x && this.rotateX(degToRad(x));
    y && this.rotateY(degToRad(y));
    z && this.rotateZ(degToRad(z));
  }

  updateParams(params) {
    this.setPosition(params);

    this.line.geometry.dispose();
    this.line.geometry = this.getLineGeometry(params);

    this.text.geometry?.dispose();
    this.text.geometry = this.getTextGeometry(params.length);

    requestAnimationFrame(() => {
      this.setTextPosition(params);
    });
  }

  createText(cb) {
    const text = this.value.toFixed(2);
    const material = new LineBasicMaterial({ color: '#000000' });
    const geometry = this.getTextGeometry(text);
    this.text = new Mesh(geometry, material);
    this.text.setRotationFromAxisAngle(new Vector3(1, 0, 0), Math.PI / -2);
    const boxGeometry = new BoxGeometry(0, 0);
    this.textBox = new Mesh(boxGeometry, new MeshBasicMaterial({ opacity: 0, transparent: true }));
    this.textBox.onClick = () => this.onClick && this.onClick(this.value);
    this.add(this.text);
    requestAnimationFrame(cb);
  }

  getInteractiveObjects() {
    return [
      this.textBox,
    ];
  }
}

export default AlignedDim;
