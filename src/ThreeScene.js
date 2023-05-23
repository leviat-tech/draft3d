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

const defaultAxesIndicatorConfig = {
  isEnabled: true,
  size: 120,
  style: { bottom: 0, right: '2rem' },
};

const axisIndicatorCameraConfig = {
  fov: 60,
  aspect: 1,
  near: 5,
  far: 1000,
};

export default class ThreeScene {
  events = {
    resize: 'onResize',
    click: 'onMouseDown',
    dblclick: 'onDbClick',
    mousemove: 'onMouseMove',
  };

  constructor() {
    this.axisIndicator = {
      isEnabled: false,
      scene: null,
      canvas: null,
      camera: null,
      renderer: null,
    }
    this.animationFrame = null;
    this.layerSet = new LayerSet();
    this.originalScene = new Scene();
  }

  initialize(el, config) {
    const { use2DCamera, camera, controls, light, axisIndicator = {} } = config;

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

    this.renderer = this.createRenderer(this.originalScene, this.perspectiveCamera, this.canvas, 'animationFrame');
    this.createAxisIndicator(el, axisIndicator);

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

  createRenderer(scene, camera, canvas, afKey) {
    const rendererConfig = {
      canvas,
      alpha: true,
      antialias: true,
    };
    const renderer = new WebGLRenderer(rendererConfig);
    renderer.setPixelRatio(window.devicePixelRatio);
    afKey && this.startAnimation(renderer, scene, camera, afKey);

    return renderer;
  }

  startAnimation(renderer, scene, camera, afKey) {
    const animate = () => {
      this[afKey] = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();
  }

  async createAxisIndicator(el, axisIndicatorConfig) {
    if (!axisIndicatorConfig.isEnabled) return;

    this.axisIndicator.isEnabled = true;

    const scene = new Scene();
    const ambientLight = new AmbientLight('#ffffff', 1);
    scene.add(ambientLight);
    const axes = await ThreeScene.renderAxesEntity();
    axes.addTo(scene);

    const camera = createCamera(axisIndicatorCameraConfig);
    const canvas = ThreeScene.createAxesIndicatorCanvas(el, axisIndicatorConfig);
    const renderer = this.createRenderer(scene, camera, canvas);

    // Hacky but both timeouts are required in order for the labels to render correctly
    setTimeout(() => this.updateAxisIndicator(renderer, scene, camera));
    setTimeout(() => {
      this.updateAxisIndicator(renderer, scene, camera);
      canvas.style.opacity = 1;
    }, 100);

    this.onControlsChange = (e) => {
      this.updateAxisIndicator(renderer, scene, camera);
    }
    this.perspectiveControls.addEventListener('change', this.onControlsChange);

    Object.assign(this.axisIndicator, {
      scene,
      camera,
      canvas,
      renderer,
    });
  }

  static createAxesIndicatorCanvas(el, axisIndicatorConfig) {
    const config = { ...defaultAxesIndicatorConfig, ...axisIndicatorConfig };
    const canvas = document.createElement('canvas');
    canvas.width = config.size;
    canvas.height = config.size;
    canvas.style.position = 'absolute';
    // Mask canvas until axes rendered
    canvas.style.opacity = 0;
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    Object.assign(canvas.style, config.style);

    el.appendChild(canvas);

    return canvas;
  }

  static async renderAxesEntity() {
    // Use dynamic import to prevent circular dependencies
    const axesModule = await import('./entities/axes');

    const axisLength = 2;
    return axesModule.default({
      headWidth: 0.3,
      headLength: 0.5,
      xAxisLength: axisLength,
      yAxisLength: axisLength,
      zAxisLength: axisLength,
      textSize: 1,
      position: [0, 0, 0]
    });
  }

  updateAxisIndicator(renderer, scene, camera) {
    const { position, rotation } = this.perspectiveCamera

    const { x, y, z } = rotation;
    camera.rotation.set(x, y, z);

    // Reset vector distance from origin to prevent zooming in axes view
    const axisCameraDistance = 10;
    const newPosition = position.clone().setLength(axisCameraDistance);
    camera.position.set(newPosition.x, newPosition.y, newPosition.z);

    // Reset position to prevent panning in axes view
    camera.lookAt(0,0,0);

    renderer.render(scene, camera);
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
    // we need to call render synchronously and call toDataURL immediately.
    // See issue below for more info
    // https://stackoverflow.com/questions/15558418/how-do-you-save-an-image-from-a-three-js-canvas
    this.renderer.render(this.originalScene, this.perspectiveCamera);

    return this.canvas.toDataURL(...options);
  }

  destroy() {
    if (this.axisIndicator.isEnabled) {
      this.el.removeChild(this.axisIndicator.canvas);
      this.perspectiveCamera.removeEventListener('change', this.onControlsChange);
      this.onControlsChange = null;
      Object.assign(this.axisIndicator, {
        isEnabled: false,
        canvas: null,
        camera: null,
        scene: null,
        renderer: null,
      });
    }

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
