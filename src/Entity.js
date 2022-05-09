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
    const { object3d, ...renderProps } = entityConfig.render(this.params);

    if (!(object3d instanceof Object3D)) {
      throw new Error('render must return an Object3D in the object3d property')
    }

    this.object3d = object3d;
    this.renderProps = renderProps;

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

    if (this.onUpdate) this.onUpdate(this, newParams);
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
    return Object.entries(definedParameters).reduce((params, [name, paramConfig]) => {
      if (['position', 'rotation'].includes(name)) {
        console.log(`Cannot overwrite predefined parameter ${name}`);
        return params;
      }

      return {
        ...params,
        [name]: userParams[name] ?? paramConfig.default,
      };
    }, {
      position: userParams.position ? Entity.validateDims(userParams.position) : [0, 0, 0],
      rotation: userParams.rotation ? Entity.validateDims(userParams.rotation) : [0, 0, 0],
    })
  }

  static validateDims(dims) {
    if (!(dims instanceof Array)) throw new TypeError('dims is not an array');

    if (dims.length !== 3) throw new RangeError('dims must contain three items');

    return dims;
  }
}

export default Entity;
