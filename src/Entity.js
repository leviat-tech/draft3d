import { Object3D } from 'three';
import draft3d from '.';


class Entity {
  /**
   * @typedef entityConfig
   * @property { string } name
   * @property { object } parameters
   * @property { function } render
   * @property { function } [update]
   *
   *
   * @param { entityConfig } entityConfig
   * @param { object } params
   */
  constructor(entityConfig, params = {}, layerSet) {
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

    // TODO: not sure if this is needed yet
    // this.object3d.getEntity = () => this;

    if (typeof entityConfig.update === 'function') {
      this.onUpdate = entityConfig.update;
    }
  }

  formatParams(params) {
    return params;
  }

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

  setRotation(rotation) {
    if (!rotation) return;

    const { object3d } = this;
    const degToRad = (deg) => deg * (Math.PI / 180);
    const [x, y, z] = rotation;
    object3d.rotation.set(degToRad(x), degToRad(y), degToRad(z));
  }

  addTo(object3d) {
    if (this.object3d === undefined) {
      this.object3d = new Object3D();
    }

    object3d.add(this.object3d);
  }

  add(object3d) {
    if (this.object3d === undefined) {
      this.object3d = new Object3D();
    }

    this.object3d.add(object3d);
  }

  addFeature(name, type, params) {
    if (this.features[name] !== undefined) {
      throw new Error('Feature Name already in use');
    }

    const constructor = this.isEntity(type) ? draft3d.entities[type] : draft3d.features[type];
    const feat = constructor(params, this.layerSet);
    this.features[name] = feat;
    this.add(feat.object3d);

    return feat;
  }

  addFeatureTo(arrayName, type, params) {
    if (this.features[arrayName] === undefined) {
      this.features[arrayName] = [];
    } else if (!(this.features[arrayName] instanceof Array)) {
      throw new Error('Feature Name already in use for non-iterable feature');
    }
    const constructor = this.isEntity(type) ? draft3d.entities[type] : draft3d.features[type];
    const feat = constructor(params, this.layerSet);
    this.features[arrayName].push(feat);
    this.add(feat.object3d);

    return feat;
  }

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

  destroy() {
    console.log('I\'m dead.');
  }

  isEntity(name) {
    return draft3d.entities[name] !== undefined;
  }

}

export default Entity;
