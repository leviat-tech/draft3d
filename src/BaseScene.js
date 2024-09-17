import {
  AmbientLight,
  ColorManagement,
  DirectionalLight as Light,
  LinearSRGBColorSpace,
  Object3D,
  Scene,
  WebGLRenderer,
} from 'three';
import { filter } from 'lodash-es';
import draft3d from './draft3d';


const defaultLights = {
  intensity: 0.5,
  directionalLights: [
    [2, 3, 1],
    [-2, 3, -1],
  ],
};

class BaseScene {
  static instance = null;

  constructor(config) {
    const { canvas, light } = config;
    this.config = config;
    this.originalScene = new Scene();
    this.lights = this.createLight(light);
    this.canvas = canvas || BaseScene.createCanvas();
    this.renderer = this.createRenderer(this.canvas);
    BaseScene.instance = this;
  }

  static getInstance() {
    return BaseScene.instance;
  }

  static createCanvas() {
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0 0 0 0',
      marginLeft: 'auto',
      marginRight: 'auto',
    });

    return canvas;
  }

  createLight(userLightConfig) {
    const lightColor = 0xffffff;
    const lightConfig = { ...defaultLights, ...userLightConfig };
    const { intensity, directionalLights } = lightConfig;

    const ambientLight = new AmbientLight(lightColor, intensity);
    ambientLight.layers.enableAll();
    this.originalScene.add(ambientLight);

    return directionalLights.map((lightCoords) => this.createDirectionalLight(...lightCoords));
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

  createRenderer(canvas) {
    const rendererConfig = {
      canvas,
      alpha: true,
      antialias: true,
    };

    const renderer = new WebGLRenderer(rendererConfig);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Three.js 0.154 release has changed color/light management.
    // This change is required to keep colors as close as posible to current ones
    // Migration steps:
    // https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733
    // https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791
    // Migration ticket https://crhleviat.atlassian.net/browse/DCIC-408
    ColorManagement.enabled = false;
    renderer._outputColorSpace = LinearSRGBColorSpace;
    renderer.useLegacyLights = true; // This property will be removed in future releases of Three.js

    return renderer;
  }

  render() {
    this.renderer.render(this.originalScene, this.camera);
  }

  onResize() {
    const { width, height } = this.el.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.width = width * pixelRatio;
    this.height = height * pixelRatio;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.renderer.setSize(width, height);
    this.camera.aspect = this.width / this.height;

    this.camera.updateProjectionMatrix();
  }

  add(obj) {
    this.originalScene.add(obj);
    return obj;
  }

  /**
   * Render the scene to a base64 image
   * @param userOptions {{ crop: boolean, [type]: string, [encoderOptions]: number }}
   * @param { number } width - width of the rendered image
   * @param { number } height - height of the rendered image
   * @return {string} the scene as a base64 image string
   */
  async renderToImage(userOptions = { crop: false }, width = 1200, height = 900) {
    const defaultOptions = {
      type: 'image/png', // A string indicating the image format.
      encoderOptions: 1, // A Number between 0 and 1 indicating the image quality
    };

    const options = Object.assign(defaultOptions, userOptions);

    this.renderer.setSize(width, height);
    this.render();

    const dataUrl = this.canvas.toDataURL(options);

    // In order to be able to call the toDataURL method on the canvas element
    // without detrimental performance by preserving the drawing buffer
    // we need to call render synchronously and call toDataURL immediately.
    // See issue below for more info
    // https://stackoverflow.com/questions/15558418/how-do-you-save-an-image-from-a-three-js-canvas
    this.renderer.render(this.originalScene, this.camera);

    return new Promise((resolve) => {
      if (!options.crop) {
        resolve(dataUrl);
        return;
      }

      // The threejs canvas uses the webgl context.
      // However, we need the 2d context in order to be able to analyse empty for cropping.
      // Therefore, we need to create a separate canvas with a 2d context
      // and do all of our processing there.

      // Create an image to draw onto the canvas
      const container = document.createElement('div');
      Object.assign(container.style, {
        position: 'absolute',
        zIndex: -1,
        opacity: 0,
      });
      document.body.append(container);

      const img = document.createElement('img');
      container.appendChild(img);

      img.src = dataUrl;
      img.onload = () => {
        const canvasCrop = document.createElement('canvas');
        canvasCrop.width = width;
        canvasCrop.height = height;
        const ctx = canvasCrop.getContext('2d');

        ctx.drawImage(img, 0, 0, width, height);

        const cropped = this.crop(canvasCrop);
        const croppedDataURL = cropped.toDataURL(
          options.type,
          options.encoderOptions,
        );

        container.removeChild(img);

        resolve(croppedDataURL);
      };
    });
  }

  destroy() {
    if (this.axisIndicator.isEnabled) {
      this.el.removeChild(this.axisIndicator.canvas);
      this.camera.removeEventListener(
        'change',
        this.onControlsChange,
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

    this.originalScene = null;
    this.camera = null;
    this.controls = null;
    this.el.removeChild(this.canvas);
  }

  crop(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const length = pixels.data.length;
    // let i = 0;
    const bound = {
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

    const cropWidth = bound.right - bound.left + margin;
    const cropHeight = bound.bottom - bound.top + margin;
    const croppedImgData = ctx.getImageData(
      bound.left,
      bound.top,
      cropWidth,
      cropHeight,
    );

    const copyCanvas = document.createElement('canvas');
    const copyCtx = copyCanvas.getContext('2d');
    copyCtx.canvas.width = cropWidth + margin;
    copyCtx.canvas.height = cropHeight + margin;
    copyCtx.putImageData(croppedImgData, margin, margin);

    return copyCanvas;
  }

  reduceEntities(callback) {
    const reduceObject = (object) => object.children.reduce((data, child) => {
      if (child.type === 'Group') {
        return [...data, ...reduceObject(child)];
      }

      const entity = child.getEntity?.();

      return entity ? [...data, callback(entity)] : data;
    }, []);

    return reduceObject(this.originalScene);
  }

  clear() {
    filter(this.originalScene.children, { type: 'Group' }).forEach((item) => item.removeFromParent());

    const childrenIdsToRemove = [];

    this.originalScene.children.forEach(child => {
      if (child.name) {
        childrenIdsToRemove.push(child.uuid);
      }
    });

    childrenIdsToRemove.forEach(id => {
      const child = this.originalScene.getObjectByProperty('uuid', id);
      child.removeFromParent();
    });
  }

  loadJSON(sceneJSON) {
    this.clear();

    const renderItem = (item, parent) => {

      // Render base entity
      if (!item.children) {
        const entity = draft3d.entities[item.name](item.params);
        entity.addTo(parent);
        return;
      }

      const object3d = new Object3D();
      object3d.name = item.name;
      parent.add(object3d);

      item.params.position = undefined;

      const {
        position = [0, 0, 0],
        rotation = [0, 0, 0]
      } = item.params;

      object3d.rotation.fromArray(rotation);
      object3d.position.fromArray(position);

      item.children.forEach(child => renderItem(child, object3d));
    };

    // TODO: load config from JSON, in particular camera

    sceneJSON.entities.forEach(item => renderItem(item, this.originalScene));
  }

  toJSON() {
    return {
      config: this.config,
      entities: this.reduceEntities(entity => entity.toJSON())
    };
  }
}

export default BaseScene;
