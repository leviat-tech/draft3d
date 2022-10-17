import ThreeScene from './ThreeScene';
import Entity from './Entity';
import * as entities from './entities';
import logger from './utils/logger';


const draft3d = {
  entities: {},
  features: {},
  scene: new ThreeScene(),
};

function register(entity, registerTo) {
  const predefinedParameters = {
    position: { name: 'Position', default: [0, 0, 0] },
    rotation: { name: 'Rotation', default: [0, 0, 0] },
  };

  const entityConfig = {
    ...entity,
    parameters: {
      ...entity.parameters,
      ...predefinedParameters,
    },
  };

  Object.defineProperty(registerTo, entityConfig.name, {
    get() {
      return (params) => new Entity(entityConfig, params);
    },
  });
}

function registerEntity(entity) {
  register(entity, draft3d.entities);
}
Object.values(entities).forEach(registerEntity);

draft3d.registerFeature = (feature) => register(feature, draft3d.features);

export function initializeScene(el, sceneConfig) {
  draft3d.scene.initialize(el, sceneConfig);
  return draft3d.scene;
}


export default draft3d;
