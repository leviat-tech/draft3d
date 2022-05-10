import { Object3D } from 'three';


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
    const object3d = entityConfig.render(this.params);

    if (!(object3d instanceof Object3D)) {
      throw new Error('render must return an Object3D in the object3d property');
    }

    this.object3d = object3d;

    // TODO: not sure if this is needed yet
    // this.object3d.getEntity = () => this;

    if (typeof entityConfig.update === 'function') {
      this.onUpdate = entityConfig.update;
    }
  }

  updateParams(newParams) {
    if (newParams.position) {
      this.object3d.position.set(...newParams.position);
    }

    if (newParams.rotation) {
      this.setRotation(newParams.rotation);
    }

    if (this.onUpdate) this.onUpdate(this.object3d, newParams);
  }

  setRotation(rotation) {
    if (!rotation) return;

    const { object3d } = this;
    const degToRad = (deg) => deg * (Math.PI / 180);
    const { x, y, z } = rotation;

    if (typeof x === 'number') object3d.rotateX(degToRad(x));
    if (typeof y === 'number') object3d.rotateY(degToRad(y));
    if (typeof z === 'number') object3d.rotateZ(degToRad(z));
  }

  addTo(object3d) {
    object3d.add(this.object3d);
  }

  add(object3d) {
    this.object3d.add(object3d);
  }

  static getParams(definedParameters, userParams) {
    return Object.entries(definedParameters).reduce((params, [name, param]) => ({
      ...params,
      [name]: userParams[name] ?? param.default,
    }), {});
  }
}

export default Entity;
