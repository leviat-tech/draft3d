import { Object3D } from 'three';
import { merge } from 'lodash';
import draft3d from '.';

class Entity {
  /**
   * @typedef entityConfig
   * @property { string } name
   * @property { object } parameters
   * @property { function } render
   * @property { function } [update]
   *
   * @param { entityConfig } entityConfig
   * @param { object } params
   */
  constructor(entityConfig, params = {}) {
    this.params = Entity.getParams(entityConfig.parameters, params);
    this.features = [];
    this.object3d = new Object3D();

    const object3d = entityConfig.render.call(this, this.params);
    if ((object3d instanceof Object3D)) {
      this.object3d = object3d;
    }

    this.object3d.position.set(...this.params.position);
    this.setRotation(this.params.rotation);

    // TODO: not sure if this is needed yet
    // this.object3d.getEntity = () => this;

    if (typeof entityConfig.update === 'function') {
      this.onUpdate = entityConfig.update;
    }
  }

  updateParams(newParams) {
    this.params = merge(this.params, newParams);

    if (newParams.position) {
      this.object3d.position.set(...newParams.position);
    }

    if (newParams.rotation) {
      this.setRotation(newParams.rotation);
    }

    //TODO refector entities so object3d isnt needed 
    if (this.onUpdate) this.onUpdate(this.object3d, this.params);
  }

  setRotation(rotation) {
    if (!rotation) return;

    const { object3d } = this;
    const degToRad = (deg) => deg * (Math.PI / 180);
    const [ x, y, z ] = rotation;
    object3d.rotation.set(degToRad(x), degToRad(y), degToRad(z));
  }

  addTo(object3d) {
    object3d.add(this.object3d);
  }

  add(object3d) {
    this.object3d.add(object3d);
  }

  addFeature(name, type, params) {
    const feat = this.isEntity(type) ? draft3d.entities[type](params) : draft3d.features[type](params);
    this.features[name] = feat;
    this.add(feat.object3d);
  }

  addFeatureTo(arrayName, type , params ) {
    if (!(this.features[arrayName] instanceof Array))
    {
      this.features[arrayName] = [];
    }
    const feat = this.isEntity(type) ? draft3d.entities[type](params) : draft3d.features[type](params);
    this.features[arrayName].push(feat);
    this.add(feat.object3d);
  }

  static getParams(definedParameters, userParams) {
    return Object.entries(definedParameters).reduce((params, [name, param]) => ({
      ...params,
      [name]: userParams[name] ?? param.default,
    }), {});
  }

  destroy() {
    console.log(`I'm dead.`)
  }

  isEntity(name) {
    return draft3d.entities[name] !== undefined;
  }

}

export default Entity;
