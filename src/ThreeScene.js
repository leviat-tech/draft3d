import {
  AmbientLight,
  DirectionalLight as Light,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';
import { createCamera, createOrthographicCamera, calculatePlanView, planControls, freeControls} from './utils/camera'
import LayerSet from './utils/LayerSet'
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

    this.perspectiveCamera = createCamera(camera);
    this.perspectiveControls = freeControls(this.perspectiveCamera, this.canvas);
    this.orthoCamera = createOrthographicCamera(camera);
    this.planControls = planControls(this.orthoCamera, this.canvas);
        
    this.camera = this.perspectiveCamera;
    
    this.lights = this.createLight();
    
    LayerSet.addCamera(this.orthoCamera)
    LayerSet.addCamera(this.perspectiveCamera)

    LayerSet.showOnly('default')

    this.renderer = this.createRenderer();
    this.mouse = new Vector2();
    this.raycaster = new Raycaster();
    this.bindEvents();
    this.onResize();
  }

  setView(view){
    switch (view){
    case 'planX':
      this.camera = this.orthoCamera;
      calculatePlanView(this.camera,this.originalScene,'x');
      break;
    case 'planY':
      this.camera = this.orthoCamera;
      calculatePlanView(this.camera,this.originalScene,'y');
      break;
    case 'planZ':
      this.camera = this.orthoCamera;
      calculatePlanView(this.camera,this.originalScene,'z');
      break;
    case 'free':
    default:
      this.camera = this.perspectiveCamera;
    }
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

  createLight() {
    const lightColor = 0xffffff;

    const ambientLight = new AmbientLight(lightColor, 0.5);
    ambientLight.layers.enableAll()
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
    const rendererConfig = {
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    };
    const renderer = new WebGLRenderer(rendererConfig);
    renderer.setPixelRatio(window.devicePixelRatio);
    this.startAnimation(renderer);

    return renderer;
  }

  startAnimation(renderer) {
    const animate = () => {
      this.animationFrame = requestAnimationFrame(animate);
      renderer.render(this.originalScene, this.camera);
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

    this.renderer.setSize(width, height);
    this.perspectiveCamera.aspect = this.width / this.height

    this.camera.updateProjectionMatrix();
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
