import ThreeScene from './ThreeScene';
import draft3d from './draft3d';
import { defineFeature } from './defineEntity';
import './entities';
import StaticScene from './StaticScene';


export function initializeScene(el, sceneConfig) {
  draft3d.scene = new ThreeScene(sceneConfig);
  draft3d.scene.initialize(el);
  return draft3d.scene;
}

async function jsonToImage(data) {
  const scene = new StaticScene(data.config);
  scene.loadJSON(data.entities);

  // await new Promise(resolve => setTimeout(resolve, 2000));

  return scene.renderToImage({ contain: true });
}

export default draft3d;

export {
  StaticScene,
  ThreeScene,
  jsonToImage,
  defineFeature,
};
