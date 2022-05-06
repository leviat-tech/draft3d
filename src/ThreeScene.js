import {
  AmbientLight,
  DirectionalLight as Light,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export default class ThreeScene {
  events = {
    resize: 'onResize',
    click: 'onMouseDown',
  }

  constructor(scene) {
    this.originalScene = new Scene();
  }

  initialize(el, config) {
    const {
      camera,
    } = config;

    this.el = el;
    this.canvas = ThreeScene.createCanvas(el);
    this.camera = ThreeScene.createCamera(camera);
    this.lights = this.createLight();
    this.controls = ThreeScene.createControls(this.camera, this.canvas);
    this.renderer = this.createRenderer();
    this.mouse = new Vector2();
    this.raycaster = new Raycaster();

    this.bindEvents();
    this.onResize();
  }

  static createCanvas(parent) {
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0 0 0 0',
    });

    parent.appendChild(canvas);

    return canvas;
  }

  static createCamera(cameraConfig) {
    const { fov, position } = cameraConfig;

    const camera = new PerspectiveCamera(fov, position);

    if (position) Object.assign(camera.position, position);

    return camera;
  }

  static createControls(camera, canvas) {
    const controls = new OrbitControls(camera, canvas);
    // controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    // controls.panSpeed = 0.5;
    // controls.rotateSpeed = 0.5;

    return controls;
  }

  createLight() {
    const lightColor = 0xffffff;

    const ambientLight = new AmbientLight(lightColor, 0.5);
    this.originalScene.add(ambientLight);

    return [
      this.createDirectionalLight(2, 3, 1),
      this.createDirectionalLight(-2, 3, -1),
    ];
  }

  createDirectionalLight(x1 = 0, y1 = 5, z1 = 1, x2 = 0, y2 = 0, z2 = 0) {
    const lightColor = 0xffffff;
    const directionalLight = new Light(lightColor, 0.75);
    directionalLight.position.set(x1, y1, z1);
    directionalLight.target.position.set(x2, y2, z2);
    this.originalScene.add(directionalLight);
    this.originalScene.add(directionalLight.target);

    return directionalLight;
  }

  createRenderer() {
    const renderer = new WebGLRenderer({ canvas: this.canvas, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    this.startAnimation(renderer);

    return renderer;
  }

  startAnimation(renderer) {
    const animate = () => {
      this.animationFrame = requestAnimationFrame(animate);
      renderer.render(this.originalScene, this.camera);
      this.controls.update();
    };

    animate();
  }

  bindEvents() {
    Object.entries(this.events).forEach(([eventType, method]) => {
      const el = (eventType === 'resize') ? window : this.canvas;
      this[method] = this[method].bind(this);
      el.addEventListener(eventType, this[method]);
    });
  }

  unbindEvents() {
    Object.entries(this.events).forEach(([eventType, method]) => {
      const el = (eventType === 'resize') ? window : this.canvas;
      el.removeEventListener(eventType, this[method]);
    });
  }

  onResize() {
    const { width, height } = this.el.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.width = width * pixelRatio;
    this.height = height * pixelRatio;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onMouseDown(e) {
    const { left, top } = this.el.getBoundingClientRect();

    this.mouse.x = ((e.clientX - left) / this.canvas.clientWidth) * 2 - 1;
    this.mouse.y = -((e.clientY - top) / this.canvas.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const interactiveObjects = this.getInteractiveObjects();
    const intersects = this.raycaster.intersectObjects(interactiveObjects);

    if (intersects.length > 0) {
      const { object } = intersects[0];
      if (object.onClick) object.onClick();
    }
  }

  getInteractiveObjects() {
    return this.originalScene.children.reduce((interactiveChildren, obj) => {
      if (!obj.isInteractive) return interactiveChildren;

      return [...interactiveChildren, ...obj.getInteractiveObjects()];
    }, []);
  }

  add(obj) {
    this.originalScene.add(obj);
    return obj;
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
    this.originalScene = null;
    this.camera = null;
    this.controls = null;
    this.el.removeChild(this.canvas);
    this.unbindEvents();
  }
}
