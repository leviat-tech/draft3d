import ThreeScene from './ThreeScene';


const draft3d = {
  entities: {},
  features: {},
  scene: new ThreeScene(),
  get repository() {
    return { ...this.entities, ...this.features };
  },
};

/**
 * @typedef {{
 *  config: {
 *   name: string,
 *  }
 * }} entity
 *
 * @param {entity} entity
 * @param {'entities'|'features'} registerTo
 * @returns
 */
export function registerEntity(entity, registerTo) {
  const { name } = entity.config;

  if (registerTo !== 'entities' && registerTo !== 'features') {
    throw new Error('Specify correct registerTo value');
  }

  if (!name) {
    throw new Error('Specify entity name');
  }

  if (draft3d.repository[name]) {
    throw new Error(`Cannot register ${name} as it already exists`);
  }

  draft3d[registerTo][name] = entity;

  return entity;
}

export default draft3d;
