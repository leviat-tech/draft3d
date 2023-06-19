import * as entities from './entities';
import ThreeScene from './ThreeScene';


const draft3d = {
  entities: Object.entries(entities).reduce((allEntities, [name, entity]) => ({
    ...allEntities,
    [name]: entity,
  }), {}),
  features: {},
  scene: new ThreeScene(),
};

export function initializeScene(el, sceneConfig) {
  draft3d.scene.initialize(el, sceneConfig);
  return draft3d.scene;
}

// export function registerFeature(config) {
//   draft3d.features[config.name] = defineEntity(config);
// }

export default draft3d;
