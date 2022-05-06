class Entity {
  /**
   * @typedef entityConfig
   * @property { string } name
   * @property { object } parameters
   *
   * @param { entityConfig } entityConfig
   * @param params
   */
  constructor(entityConfig, params = {}) {
    if (typeof entityConfig.render !== 'function') {
      throw new Error('Entity must have a render function');
    }

    this.params = Entity.getParams(entityConfig.parameters, params);
    this.object3d = entityConfig.render(this.params);

    // TODO: not sure if this is needed yet
    // this.object3d.getEntity = () => this;

    if (entityConfig.update) {
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

  addTo(scene) {
    scene.add(this.object3d);
  }

  add(object3d) {
    this.object3d.add(object3d);
  }


  static getParams(definedParameters, userParams) {
    return Object.entries(definedParameters).reduce((params, [name, paramConfig]) => {
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