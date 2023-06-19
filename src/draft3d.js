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
  draft3d[registerTo][entity.config.name] = entity;
  return entity;
}

export default draft3d;
