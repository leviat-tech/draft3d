import ThreeScene from './ThreeScene';
import Entity from './Entity'
import * as entities from './entities';

const draft3d = {
  entities: {},
  features: {},
  scene: new ThreeScene(),
  initializeScene: (el, sceneConfig) => {
    draft3d.scene.initialize(el, sceneConfig);
    return draft3d.scene;
  },
  registerEntity(name) {
    const entity = entities[name];

    if (!entity) {
      console.error(`[Draft3d] - could not register entity - '${name}' does not exist`);
      return;
    }

    draft3d.entities[name] = (params) => {
      return new Entity(entity, params);
    };
  },
  registerEntities(entityNames = []) {
    entityNames.forEach(draft3d.registerEntity);
  }
};

export default draft3d;