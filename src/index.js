import Entity from './Entity';
import draft3d from './draft3d';
import * as entities from './entities';


export function initializeScene(el, sceneConfig) {
  draft3d.scene.initialize(el, sceneConfig);
  return draft3d.scene;
}

function register(entity, registerTo) {
  if (entity.name === 'entityConstructor') {
    return;
  }

  const predefinedParameters = {
    position: { name: 'Position', default: [0, 0, 0] },
    rotation: { name: 'Rotation', default: [0, 0, 0] },

    onClick: { name: 'onClick', default: () => { } },
    onDbClick: { name: 'onDbClick', default: () => { } },
    onMouseOut: { name: 'onMouseOut', default: () => { } },
    onMouseOver: { name: 'onMouseOver', default: () => { } },
    isInteractive: { name: 'isInteractive', default: false },

    layer: { name: 'Layer', type: 'string', default: 'default' },
  };

  const entityConfig = {
    ...entity,
    parameters: {
      ...predefinedParameters,
      ...entity.parameters,
    },
  };

  const entityConstructor = (params, layerSet) => new Entity(entityConfig, params, layerSet);
  entityConstructor.config = entityConfig;

  registerTo[entityConfig.name] = entityConstructor;

  return entityConstructor;
}

export function defineEntity(entityConfig) {
  return register(entityConfig, draft3d.entities);
}

Object.values(entities).forEach(defineEntity);

export default draft3d;
