import { Object3D } from 'three';
import draft3d from './draft3d';

// eslint-disable-next-line no-unused-vars
import LayerSet from './utils/LayerSet';

import orthographicView from './EntityOrthographicView';

class Entity {
  /**
   * @typedef {{
   *  name: string,
   *  parameters: {
   *   rotation: {
   *    default: number[]
   *   },
   *   position: {
   *    default: number[]
   *   },
   *  },
   *  render: function,
   *  update?: function,
   *  formatParams?: function
   * }} entityConfig
   *
   * @typedef {{
   *  visible? : boolean
   * }} entityParams
   *
   * @param { entityConfig} entityConfig
   * @param { entityParams } params
   * @param { LayerSet } layerSet
   */
  constructor(entityConfig, params = {}, layerSet) {
    if (!entityConfig.name?.trim().length) {
      throw new Error('Specify entity name');
    }

    this.name = entityConfig.name;

    this.params = Entity.getParams(entityConfig.parameters, params, entityConfig.name);
    this.features = {};
    this.layerSet = layerSet;


    if (typeof entityConfig.formatParams === 'function') {
      this.formatParams = entityConfig.formatParams;
    }

    const formattedParams = this.formatParams(this.params);

    const object3d = entityConfig.render.call(this, formattedParams);

    if ((object3d instanceof Object3D)) {
      this.object3d = object3d;
    } else {
      this.object3d = new Object3D();
    }

    this.object3d.name = entityConfig.name;

    this.layerSet?.addToLayer(formattedParams.layer, [this.object3d, ...this.object3d.children]);

    if (typeof this.params.visible === 'boolean') {
      this.setVisibility(this.params.visible);
    }

    this.object3d.position.set(...this.params.position);
    this.setRotation(this.params.rotation);

    if (typeof entityConfig.update === 'function') {
      this.onUpdate = entityConfig.update;
    }
  }

  formatParams(params) {
    return params;
  }


  /**
   *
   *  @typedef {{
   *   visible : boolean
   *   position: number[],
   *   rotation: number[]
   *  }} entityParams
   *
   * @param {updateParams} newParams
   * @returns
   */
  updateParams(newParams) {
    const mergedParams = { ...this.params, ...newParams };

    const shouldUpdate = JSON.stringify(mergedParams) !== JSON.stringify(this.params);

    this.params = mergedParams;

    if (!shouldUpdate) return;

    if (typeof newParams.visible === 'boolean') {
      this.setVisibility(newParams.visible);
    }

    if (newParams.position) {
      this.object3d.position.set(...newParams.position);
    }

    if (newParams.rotation) {
      this.setRotation(newParams.rotation);
    }

    const formattedParams = this.formatParams(this.params);

    this.layerSet?.addToLayer(formattedParams.layer, [this.object3d, ...this.object3d.children]);

    // TODO refector entities so object3d isnt needed
    if (this.onUpdate) this.onUpdate(this.object3d, formattedParams);
  }

  /**
   * @param {number[]} rotation
   */
  setRotation(rotation) {
    if (!rotation) return;

    const { object3d } = this;
    const degToRad = (deg) => deg * (Math.PI / 180);
    const [x, y, z] = rotation;
    object3d.rotation.set(degToRad(x), degToRad(y), degToRad(z));
  }

  /**
    *
    * @param {Object3D} object3d
    */
  addTo(object3d) {
    if (!object3d) {
      return;
    }

    if (this.object3d === undefined) {
      this.object3d = new Object3D();
    }

    object3d.add(this.object3d);
  }

  /**
   *
   * @param {Object3D} object3d
   */
  add(object3d) {
    if (!object3d) {
      return;
    }

    if (this.object3d === undefined) {
      this.object3d = new Object3D();
    }

    this.object3d.add(object3d);
  }

  /**
   *
   * @typedef {{
   *  position: object,
   *  rotation?: number[]
   * }} addFeatureParams
   *
   * @param {string} name
   * @param {string} type
   * @param {addFeatureParams} params
   * @returns {Entity}
   */
  addFeature(name, type, params) {
    if (!name) {
      throw new Error('Specify feature name');
    }

    if (!type) {
      throw new Error('Specify feature type');
    }

    if (this.features[name] !== undefined) {
      throw new Error('Feature Name already in use');
    }

    const constructor = draft3d.repository[type];

    if (!constructor) {
      throw new Error('Unknown feature type');
    }

    const feat = constructor(params, this.layerSet);
    this.features[name] = feat;
    this.add(feat.object3d);

    return feat;
  }

  /**
  *
  * @typedef {{
  *  position: object,
  *  rotation?: number[]
  * }} addFeatureParams
  *
  * @param {string} arrayName
  * @param {string} type
  * @param {addFeatureParams} params
  * @returns {Entity}
  */
  addFeatureTo(arrayName, type, params) {
    if (!arrayName) {
      throw new Error('Specify features name');
    }

    if (this.features[arrayName] === undefined) {
      this.features[arrayName] = [];
    } else if (!(this.features[arrayName] instanceof Array)) {
      throw new Error('Feature Name already in use for non-iterable feature');
    }
    const constructor = draft3d.repository[type];
    const feat = constructor(params, this.layerSet);
    this.features[arrayName].push(feat);
    this.add(feat.object3d);

    return feat;
  }

  /**
   *
   * @param {boolean} isVisible
   */
  setVisibility(isVisible) {
    this.object3d.visible = isVisible;
  }

  static getParams(definedParameters, userParams, entityName) {
    const defaults = Object.entries(definedParameters).reduce((params, [name, param]) => ({
      ...params,
      [name]: param.default ?? param,
    }), {});

    return { ...defaults, ...userParams };
  }

  orthographicView(axis, precision = 0.9) {
    return orthographicView(this,...arguments)
  }

  destroy() {
    console.log('I\'m dead.');
  }
}

export default Entity;
