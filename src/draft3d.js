import ThreeScene from './ThreeScene';


const draft3d = {
  entities: {},
  features: {},
  scene: new ThreeScene(),
  get repository() {
    return { ...this.entities, ...this.features };
  },
};

export function registerEntity(entity, registerTo) {
  const { name } = entity.config;

  if (draft3d.repository[name]) {
    throw new Error(`Cannot register ${name} as it already exists`);
  }

  draft3d[registerTo][name] = entity;

  return entity;
}

export default draft3d;
