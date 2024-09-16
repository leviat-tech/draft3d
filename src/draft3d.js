/**
 * @typedef {{
 *   config: {
 *     name: string,
 *     parameters: object,
 *     render: function,
 *     update: function,
 *   }
 * }} entityFactory
 */

const draft3d = {
  entities: {},
  features: {},
  scene: null,
  get repository() {
    return { ...this.entities, ...this.features };
  },
  registerFeature() {},
};

/**
 * @param {function(params, Entity.layerSet): Entity} entityFactory
 * @param {'entities'|'features'} registerTo
 * @yields { Entity }
 */
export function registerEntity(entityFactory, registerTo) {
  const { name } = entityFactory.config;

  if (registerTo !== 'entities' && registerTo !== 'features') {
    throw new Error('Specify correct registerTo value');
  }

  if (!name) {
    throw new Error('Specify entity name');
  }

  if (draft3d.repository[name]) {
    throw new Error(`Cannot register ${name} as it already exists`);
  }

  draft3d[registerTo][name] = entityFactory;

  return entityFactory;
}

export default draft3d;
