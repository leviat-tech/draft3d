import { flatMap, isEqual, omit, omitBy, pick } from 'lodash-es';

import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { CSG } from 'three-csg-ts';
import draft3d from './draft3d';

// eslint-disable-next-line no-unused-vars
import LayerSet from './utils/LayerSet';
import { updateMaterial } from './utils/material';


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

    this.isInitialRenderComplete = false;
    this.name = entityConfig.name;
    this.render = entityConfig.render;

    this.params = Entity.getParams(entityConfig.parameters, params, entityConfig.name);
    this.features = {};
    this.layerSet = layerSet;

    if (typeof entityConfig.formatParams === 'function') {
      this.formatParams = entityConfig.formatParams;
    }

    this._render();

    if (typeof entityConfig.update === 'function') {
      this.onUpdate = entityConfig.update;
    }
  }

  setColor(color) {
    this.object3d.material.color.set(color);
  }

  setOpacity(opacity) {
    this.object3d.material.opacity = opacity;
  }

  updateMaterial(children) {
    children.forEach((child) => {
      if (!child.children.length) {
        updateMaterial(child, this.params.color, this.params.opacity);
        return;
      }
      this.updateMaterial(child.children);
    });
  }

  formatParams(params) {
    return params;
  }

  _render() {
    const isUpdate = this.isInitialRenderComplete;

    if (isUpdate) {
      this._clear();
    }

    const formattedParams = this.formatParams(this.params);
    const object3d = this.render.call(this, formattedParams);

    if (object3d) {
      this.object3d = this._renderCutouts(object3d, formattedParams.cutouts);
    }

    // If the render function calls this.addFeature then object3d is stored on the instance
    if (!this.object3d) {
      throw new Error(`Error rendering feature: ${this.name}.
          An Object3D must either be returned the render config method,
          or attached to the instance by calling
          this.addFeature or this.addFeatureTo`);
    }

    this.object3d.name = this.name;
    this.object3d.getEntity = () => this;

    this.layerSet?.addToLayer(formattedParams.layer, [this.object3d, ...this.object3d.children]);

    if (typeof this.params.visible === 'boolean') {
      this.setVisibility(this.params.visible);
    }

    this.object3d.position.set(...this.params.position);
    this.setRotation(this.params.rotation);

    if (this.params.color && this.params.opacity) {
      this.updateMaterial(this.object3d.children);
    }

    this.isInitialRenderComplete = true;
  }

  _renderCutouts(object3d, cutouts) {
    if (!cutouts || cutouts.length === 0) {
      return object3d;
    }

    return cutouts.reduce((result, cutoutBox) => {
      const cutoutGeometry = new BoxGeometry(...cutoutBox);
      const cutoutMesh = new Mesh(cutoutGeometry, new MeshBasicMaterial());

      result.updateMatrix();
      cutoutMesh.updateMatrix();

      result = CSG.subtract(result, cutoutMesh);

      return result;
    }, object3d);
  }

  _clear() {
    this.object3d.clear();
    this.parent?.remove(this.object3d);
    this.features = {};
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
    const shouldUpdate = JSON.stringify(omit(mergedParams, ['threeEntities'])) !== JSON.stringify(omit(this.params, ['threeEntities']));

    if (!shouldUpdate) return;

    this.params = mergedParams;


    // Retain backwards compatibility for entities with update methods
    if (this.onUpdate) {
      const formattedParams = this.formatParams(this.params);
      this.onUpdate(this.object3d, formattedParams);
    } else {
      this._render();
    }
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
   * @param {Object3D | ThreeScene } parent
   */
  addTo(parent) {
    if (!parent) {
      return;
    }

    if (this.object3d === undefined) {
      this.object3d = new Object3D();
    }

    parent.add(this.object3d);
    this.parent = this.object3d.parent;
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
   * @param {string} arrayNameisEntity
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

  get isVisible() {
    if (this.object3d.visible === false || this.params.opacity === 0) return false;

    return this.layerSet.getLayerByName(this.params.layer).visible;
  }

  static getParams(definedParameters, userParams) {
    const defaults = Object.entries(definedParameters).reduce(
      (params, [name, param]) => ({
        ...params,
        [name]: param.default ?? param,
      }),
      {},
    );

    return { ...defaults, ...userParams };
  }

  /**
   * Returns a vector representing the position of the object in world space
   * @return { Vector3 }
   */
  getWorldPosition() {
    return this.object3d.getWorldPosition(new Vector3());
  }

  /**
   * Returns a vector representing the rotation of the object by summing the rotation values of all ancestor objects
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
    console.log("I'm dead.");
  }

  get isBaseEntity() {
    return !!draft3d.entities[this.name];
  }

  toJSON() {
    const { features, name } = this;
    const uiParams = ['isDraggable', 'isInteractive', 'layer'];
    const positionParams = ['position', 'rotation'];
    const formattedParams = this.formatParams(this.params);
    const defaultPosition = [0, 0, 0];

    const serializedParams = omitBy(formattedParams, (val, key) => {
      // Don't serialise ui params
      if (uiParams.includes(key)) {
        return true;
      }

      // Don't serialize default position/rotation params
      if (positionParams.includes(key)) {
        return isEqual(val, defaultPosition);
      }

      return false;
    });

    if (this.isBaseEntity) {
      return { name, params: serializedParams };
    }

    const flattenedFeatures = flatMap(Object.values(features));

    const children = flattenedFeatures.reduce((visibleFeatures, feature) => {
      const featureJson = feature.toJSON();
      return feature.isVisible && featureJson
        ? [...visibleFeatures, featureJson]
        : visibleFeatures;
    }, []);

    if (children.length === 0) return null;

    const objectJSON = { name, children };
    const params = pick(serializedParams, positionParams);
    const hasPositionParams = Object.keys(positionParams.length > 0);

    return (hasPositionParams) ? { ...objectJSON, params } : objectJSON;
  }
}

export default Entity;
