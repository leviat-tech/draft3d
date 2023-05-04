import {
  Scene,
  Vector2,
  Raycaster,
  AmbientLight,
  WebGLRenderer,
  DirectionalLight as Light,
} from 'three';

import LayerSet from './utils/LayerSet';
import {
  createCamera,
  createOrthographicCamera,
  calculatePlanView,
  planControls,
  freeControls,
} from './utils/camera';

const defaultLights = {
  intensity: 0.5,
  directionalLights: [
    [2, 3, 1],
    [-2, 3, -1],
  ],
};

export default class ThreeScene {
  events = {
    resize: 'onResize',
    click: 'onMouseDown',
    dblclick: 'onDbClick',
    mousemove: 'onMouseMove',
  };

  constructor() {
    this.layerSet = new LayerSet();
    this.originalScene = new Scene();
  }

  initialize(el, config) {
    const { use2DCamera, camera, controls, light } = config;

    this.el = el;
    this.canvas = ThreeScene.createCanvas(el);

    this.perspectiveCamera = createCamera(camera);
    this.perspectiveControls = freeControls(
      this.perspectiveCamera,
      this.canvas,
      controls
    );

    this.camera = this.perspectiveCamera;

    this.lights = this.createLight(light);

    this.activeObject = null;

    this.layerSet.addCamera(this.perspectiveCamera);

    if (use2DCamera) {
      this.orthoCamera = createOrthographicCamera(camera);
      this.planControls = planControls(this.orthoCamera, this.canvas);
      this.layerSet.addCamera(this.orthoCamera);
    }

    this.renderer = this.createRenderer();
    this.mouse = new Vector2();

    this.raycaster = new Raycaster();
    this.raycaster.layers.enableAll();

    this.bindEvents();
    this.onResize();
  }

  setView(view) {
    switch (view) {
      case 'planX':
        this.camera = this.orthoCamera;
        calculatePlanView(this.camera, this.originalScene, 'x');
        break;
      case 'planY':
        this.camera = this.orthoCamera;
        calculatePlanView(this.camera, this.originalScene, 'y');
        break;
      case 'planZ':
        this.camera = this.orthoCamera;
        calculatePlanView(this.camera, this.originalScene, 'z');
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
      marginLeft: 'auto',
      marginRight: 'auto',
    });

    parent.appendChild(canvas);

    return canvas;
  }

  createLight(userLightConfig) {
    const lightColor = 0xffffff;
    const lightConfig = { ...defaultLights, ...userLightConfig };
    const { intensity, directionalLights } = lightConfig;

    const ambientLight = new AmbientLight(lightColor, intensity);
    ambientLight.layers.enableAll();
    this.originalScene.add(ambientLight);

    return directionalLights.map((lightCoords) =>
      this.createDirectionalLight(...lightCoords)
    );
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
      const el = eventType === 'resize' ? window : this.canvas;
      this[method] = this[method].bind(this);
      el.addEventListener(eventType, this[method]);
    });
  }

  unbindEvents() {
    Object.entries(this.events).forEach(([eventType, method]) => {
      const el = eventType === 'resize' ? window : this.canvas;
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
    this.perspectiveCamera.aspect = this.width / this.height;

    this.camera.updateProjectionMatrix();
  }

  getIntersectObjects(e) {
    const { left, top } = this.el.getBoundingClientRect();

    this.mouse.x = ((e.clientX - left) / this.canvas.clientWidth) * 2 - 1;
    this.mouse.y = -((e.clientY - top) / this.canvas.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const interactiveObjects = this.getInteractiveChildren(this.originalScene);

    return this.raycaster.intersectObjects(interactiveObjects);
  }

  isElementVisible(element) {
    const layer = this.layerSet.layers.find(
      (el) => el.name === element.layerName
    );

    return layer ? element?.visible && layer?.visible : element?.visible;
  }

  onMouseDown(e) {
    const intersects = this.getIntersectObjects(e);

    if (intersects.length) {
      const { object } = intersects[0];

      if (!this.isElementVisible(object)) {
        return;
      }

      if (object?.onClick) {
        object.onClick(e);
      }
    }
  }

  onDbClick(e) {
    const intersects = this.getIntersectObjects(e);

    if (intersects.length) {
      const { object } = intersects[0];

      if (!this.isElementVisible(object)) {
        return;
      }

      if (object?.onDbClick) {
        object.onDbClick(e);
      }
    }
  }

  onMouseMove(e) {
    const intersects = this.getIntersectObjects(e);

    if (intersects.length) {
      const { object } = intersects[0];

      if (!this.isElementVisible(object)) {
        return;
      }

      // Object changed. Call mouseOut before change object
      if (
        this.activeObject?.onMouseOut &&
        this.activeObject.uuid !== object.uuid
      ) {
        this.activeObject.onMouseOut(e);
      }

      this.canvas.style.cursor = 'pointer';
      this.activeObject = object;

      if (object?.onMouseOver) {
        object.onMouseOver(e);
      }
    } else {
      // No objects detected. Call last active object mouseOut
      if (this.activeObject?.onMouseOut) {
        this.activeObject.onMouseOut();
      }

      this.canvas.style.cursor = '';
      this.activeObject = null;
    }
  }

  getInteractiveChildren(object3d) {
    if (!object3d.children.length) {
      return [];
    }

    return object3d.children.reduce((interactiveChildren, child) => {
      if (child?.isInteractive) {
        interactiveChildren.push(child);
      }

      return [...interactiveChildren, ...this.getInteractiveChildren(child)];
    }, []);
  }

  add(obj) {
    this.originalScene.add(obj);
    return obj;
  }

  renderToImage(...options) {
    // In order to be able to call the toDataURL method on the canvas element
    // without detrimental performance by preserving the drawing buffer
    // we need to call render syncronously and call toDataURL immediately.
    // See issue below for more info
    // https://stackoverflow.com/questions/15558418/how-do-you-save-an-image-from-a-three-js-canvas
    this.renderer.render(this.originalScene, this.perspectiveCamera);

    return this.canvas.toDataURL(...options);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
    this.originalScene = null;
    this.camera = null;
    this.orthoCamera = null;
    this.perspectiveCamera = null;
    this.controls = null;
    this.planControls = null;
    this.perspectiveControls = null;
    this.el.removeChild(this.canvas);
    this.unbindEvents();
  }
}
