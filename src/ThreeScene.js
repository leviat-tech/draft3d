import {
  AmbientLight,
  Raycaster,
  Scene,
  Vector2,
} from 'three';

import { createCamera, freeControls } from './utils/camera';

import BaseScene from './BaseScene';

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

class ThreeScene extends BaseScene {
  events = {
    click: 'onClick',
    resize: 'onResize',
    mouseup: 'onMouseUp',
    dblclick: 'onDbClick',
    mousedown: 'onMouseDown',
    mousemove: 'onMouseMove',
  };

  constructor(config = {}) {
    super(config);
    const { camera, controls } = config;

    this.isAnimating = false;

    this.axisIndicator = {
      isEnabled: false,
      scene: null,
      canvas: null,
      camera: null,
      renderer: null,
    };
    this.activeObject = null;
    this.camera = createCamera(camera);
    this.layerSet.addCamera(this.camera);
    this.controls = freeControls(this.camera, this.canvas, controls);
    this.mouse = new Vector2();
    this.raycaster = new Raycaster();
    this.raycaster.layers.enableAll();
    this.isDragging = false;
  }

  initialize(el) {
    this.el = el;
    this.el.appendChild(this.canvas);
    this.createAxisIndicator(el, this.config.axisIndicator);
    this.bindEvents();
    this.onResize();
    this.startAnimation();
  }

  startAnimation() {
    this.isAnimating = true;

    const animate = () => {
      if (!this.isAnimating) return;

      window.requestAnimationFrame(animate);
      this.render();
    };

    animate();
  }

  stopAnimation() {
    this.isAnimating = false;
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
    const renderer = this.createRenderer(canvas);

    // Hacky but both timeouts are required in order for the labels to render correctly
    setTimeout(() => this.updateAxisIndicator(renderer, scene, camera));
    setTimeout(() => {
      this.updateAxisIndicator(renderer, scene, camera);
      canvas.style.opacity = 1;
    }, 100);

    this.onControlsChange = (e) => {
      this.updateAxisIndicator(renderer, scene, camera);
    };
    this.controls.addEventListener('change', this.onControlsChange);

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
    const { position, rotation } = this.camera;

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

  destroy() {
    super.destroy();

    this.stopAnimation();
  }
}

export default ThreeScene;
