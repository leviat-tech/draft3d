import ThreeScene from './ThreeScene';
import draft3d from './draft3d';
import { defineFeature } from './defineEntity';
import './entities';


export function initializeScene(el, sceneConfig) {
  draft3d.scene.initialize(el, sceneConfig);
  return draft3d.scene;
}

export default draft3d;

export {
  ThreeScene,
  defineFeature,
};
