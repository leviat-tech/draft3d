import { Object3D, Vector3 } from 'three';
import draft3d from './draft3d';


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
   * @param {boolean} isVisible
   */
  setVisibility(isVisible) {
    this.object3d.visible = isVisible;
  }

  static getParams(definedParameters, userParams) {
    const defaults = Object.entries(definedParameters).reduce((params, [name, param]) => ({
      ...params,
      [name]: param.default ?? param,
    }), {});

    return { ...defaults, ...userParams };
  }

  /**
   * Returns a vector representing the position of the object in world space.
   * @return { Vector3 }
   */
  getWorldPosition() {
    return this.object3d.getWorldPosition(new Vector3());
  }

  /**
   * Returns a vector representing the direction of object's positive z-axis in world space.
   * @return { Vector3 }
   */
  getWorldRotation() {
    const worldRotation = new Vector3();

    const getRotation = (obj3d) => {
      const { rotation } = obj3d;

      worldRotation.x += rotation.x;
      worldRotation.y += rotation.y;
      worldRotation.z += rotation.z;

      if (!obj3d?.parent || obj3d.parent.type === 'Scene') {
        return worldRotation;
      }

      return getRotation(obj3d.parent);
    };

    return getRotation(this.object3d);
  }

  /**
   * Retrieve the min and max position, and depth for each axis
   * @return {{zMin: number, yMin: number, zMax: number, yMax: number, xMax: number, xMin: number}}
   */
  getExtents() {
    this.object3d.updateWorldMatrix(true, true);

    const { matrixWorld } = this.object3d;
    const position = this.object3d.geometry.attributes.position;
    const end = position.count;

    const extents = {
      xMin: Infinity,
      yMin: Infinity,
      zMin: Infinity,
      xMax: -Infinity,
      yMax: -Infinity,
      zMax: -Infinity,
    };

    for (let i = 0; i < end; i++) {
      const { x, y, z } = new Vector3().fromBufferAttribute(position, i).applyMatrix4(matrixWorld);

      if (x < extents.xMin) extents.xMin = x;
      if (y < extents.yMin) extents.yMin = y;
      if (z < extents.zMin) extents.zMin = z;
      if (x > extents.xMax) extents.xMax = x;
      if (y > extents.yMax) extents.yMax = y;
      if (z > extents.zMax) extents.zMax = z;
    }

    extents.xDepth = extents.xMax - extents.xMin;
    extents.yDepth = extents.yMax - extents.yMin;
    extents.zDepth = extents.zMax - extents.zMin;

    return extents;
  }

  destroy() {
    console.log('I\'m dead.');
  }
}

export default Entity;
