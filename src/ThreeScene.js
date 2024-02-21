import {
  Scene,
  Vector2,
  Raycaster,
  AmbientLight,
  WebGLRenderer,
  ColorManagement,
  LinearSRGBColorSpace,
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

class ThreeScene {
  events = {
    click: 'onClick',
    resize: 'onResize',
    mouseup: 'onMouseUp',
    dblclick: 'onDbClick',
    mousedown: 'onMouseDown',
    mousemove: 'onMouseMove',
  };

  constructor() {
    this.axisIndicator = {
      isEnabled: false,
      scene: null,
      canvas: null,
      camera: null,
      renderer: null,
    };
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
      this.planControls = planControls(this.orthoCamera, this.canvas, controls);
      this.layerSet.addCamera(this.orthoCamera);
      this.camera = this.orthoCamera;
    }

    this.renderer = this.createRenderer(
      this.originalScene,
      this.camera,
      this.canvas,
      'animationFrame'
    );

    // Three.js 0.154 release has changed color/light management.
    // This change is required to keep colors as close as posible to current ones
    // Migration steps:
    // https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733
    // https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791
    // Migration ticket https://crhleviat.atlassian.net/browse/DCIC-408
    ColorManagement.enabled = false;
    this.renderer._outputColorSpace = LinearSRGBColorSpace;
    this.renderer.useLegacyLights = true; // This property will be removed in future releases of Three.js

    this.createAxisIndicator(el, axisIndicator);

    this.mouse = new Vector2();

    this.raycaster = new Raycaster();
    this.raycaster.layers.enableAll();

    this.isDragging = false;

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

  createRenderer(scene, camera, canvas, enableAnimation) {
    const rendererConfig = {
      canvas,
      alpha: true,
      antialias: true,
    };
    const renderer = new WebGLRenderer(rendererConfig);
    renderer.setPixelRatio(window.devicePixelRatio);
    enableAnimation && this.startAnimation(renderer, scene, camera);

    return renderer;
  }

  startAnimation(renderer, scene, camera) {
    const animate = () => {
      this.animationFrame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();
  }

  /**
   *
   * @typedef {{
   *  isEnabled: boolean,
   * }} axisIndicatorConfig
   *
   * @param {HTMLElement} el
   * @param {axisIndicatorConfig} axisIndicatorConfig
   */
  async createAxisIndicator(el, axisIndicatorConfig) {
    if (!axisIndicatorConfig?.isEnabled) return;

    this.axisIndicator.isEnabled = true;

    const scene = new Scene();
    const ambientLight = new AmbientLight('#ffffff', 1);
    scene.add(ambientLight);
    const axes = await ThreeScene.renderAxesEntity();
    axes.addTo(scene);

    const camera = createCamera(axisIndicatorCameraConfig);
    const canvas = ThreeScene.createAxesIndicatorCanvas(
      el,
      axisIndicatorConfig
    );
    const renderer = this.createRenderer(scene, camera, canvas);

    // Hacky but both timeouts are required in order for the labels to render correctly
    setTimeout(() => this.updateAxisIndicator(renderer, scene, camera));
    setTimeout(() => {
      this.updateAxisIndicator(renderer, scene, camera);
      canvas.style.opacity = 1;
    }, 100);

    this.onControlsChange = (e) => {
      this.updateAxisIndicator(renderer, scene, camera);
    };
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
    const { size, style } = config;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const sizePx = size + 'px';

    // Mask canvas until axes rendered
    Object.assign(canvas.style, {
      ...style,
      // Specify CSS size as well otherwise canvas will be rendered at size * devicePixelRatio
      width: sizePx,
      height: sizePx,
      position: 'absolute',
      // Mask canvas until axes rendered
      opacity: 0,
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

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
      position: [0, 0, 0],
    });
  }

  updateAxisIndicator(renderer, scene, camera) {
    const { position, rotation } = this.perspectiveCamera;

    const { x, y, z } = rotation;
    camera.rotation.set(x, y, z);

    // Reset vector distance from origin to prevent zooming in axes view
    const axisCameraDistance = 10;
    const newPosition = position.clone().setLength(axisCameraDistance);
    camera.position.set(newPosition.x, newPosition.y, newPosition.z);

    // Reset position to prevent panning in axes view
    camera.lookAt(0, 0, 0);

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

  onClick(e) {
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

  setCursor(type) {
    this.canvas.style.cursor = type;
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

      if (this.isDragging || object.isDraggable) {
        this.setCursor('move');
      } else {
        this.setCursor('pointer');
      }

      this.activeObject = object;

      if (object?.onMouseOver) {
        object.onMouseOver(e);
      }
    } else {
      // No objects detected. Call last active object mouseOut
      if (this.activeObject?.onMouseOut) {
        this.activeObject.onMouseOut();
      }

      if (this.isDragging) {
        this.setCursor('move');
      } else {
        this.setCursor('auto');
      }
      this.activeObject = null;
    }
  }

  onMouseDown(e) {
    this.isDragging = true;
  }

  onMouseUp(e) {
    this.isDragging = false;
  }

  getInteractiveChildren(object3d) {
    if (!object3d.children.length || this.isDragging) {
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

  /**
   * Render the scene to a base64 image
   * @param userOptions {{ contain: boolean, [type]: string, [encoderOptions]: number }}
   * @return {string} the scene as a base64 image string
   */
  async renderToImage(userOptions = { contain: false }) {
    const defaultOptions = {
      type: 'image/png', // A string indicating the image format.
      encoderOptions: 1, // A Number between 0 and 1 indicating the image quality
    };

    const options = Object.assign(defaultOptions, userOptions);

    // In order to be able to call the toDataURL method on the canvas element
    // without detrimental performance by preserving the drawing buffer
    // we need to call render synchronously and call toDataURL immediately.
    // See issue below for more info
    // https://stackoverflow.com/questions/15558418/how-do-you-save-an-image-from-a-three-js-canvas
    this.renderer.render(this.originalScene, this.orthoCamera);

    const dataUrl = this.canvas.toDataURL();

    return new Promise((resolve) => {
      if (!options.contain) return dataUrl;

      // The threejs canvas uses the webgl context.
      // However, we need the 2d context in order to be able to analyse empty for cropping.
      // Therefore, we need to create a separate canvas with a 2d context
      // and do all of our processing there.

      // Create an image to draw onto the canvas
      const img = new Image();
      this.el.appendChild(img);

      img.src = dataUrl;
      img.onload = () => {
        const canvasCrop = document.createElement('canvas');
        canvasCrop.width = this.width;
        canvasCrop.height = this.height;
        const ctx = canvasCrop.getContext('2d');

        ctx.drawImage(img, 0, 0, this.width, this.height);

        const trimmed = this.trim(canvasCrop);
        const croppedDataURL = trimmed.toDataURL(
          options.type,
          options.encoderOptions
        );

        this.el.removeChild(img);

        resolve(croppedDataURL);
      };
    });
  }

  destroy() {
    if (this.axisIndicator.isEnabled) {
      this.el.removeChild(this.axisIndicator.canvas);
      this.perspectiveCamera.removeEventListener(
        'change',
        this.onControlsChange
      );
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

  trim(canvas) {
    const ctx = canvas.getContext('2d');
    const copy = document.createElement('canvas').getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const length = pixels.data.length;
    //let i = 0;
    let bound = {
      top: null,
      left: null,
      right: null,
      bottom: null,
    };
    let x;
    let y;
    const margin = 8;

    for (let i = 0; i < length; i += 4) {
      if (pixels.data[i + 3] !== 0) {
        x = (i / 4) % canvas.width;
        y = Math.floor(i / 4 / canvas.width);

        if (bound.top === null) {
          bound.top = y;
        }

        if (bound.left === null) {
          bound.left = x;
        } else if (x < bound.left) {
          bound.left = x;
        }

        if (bound.right === null) {
          bound.right = x;
        } else if (bound.right < x) {
          bound.right = x;
        }

        if (bound.bottom === null) {
          bound.bottom = y;
        } else if (bound.bottom < y) {
          bound.bottom = y;
        }
      }
    }

    const trimWidth = bound.right - bound.left + margin;
    const trimHeight = bound.bottom - bound.top + margin;
    const trimmed = ctx.getImageData(
      bound.left,
      bound.top,
      trimWidth,
      trimHeight
    );

    copy.canvas.width = trimWidth + margin;
    copy.canvas.height = trimHeight + margin;
    copy.putImageData(trimmed, margin, margin);

    return copy.canvas;
  }
}

export default ThreeScene;
