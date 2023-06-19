import Entity from './Entity';


const noop = () => {};

export default function defineEntity(entity) {
  if (entity.name === 'entityConstructor') {
    return entity;
  }

  const predefinedParameters = {
    position: { name: 'Position', default: [0, 0, 0] },
    rotation: { name: 'Rotation', default: [0, 0, 0] },

    onClick: { name: 'onClick', default: noop },
    onDbClick: { name: 'onDbClick', default: noop },
    onMouseOut: { name: 'onMouseOut', default: noop },
    onMouseOver: { name: 'onMouseOver', default: noop },
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

  return entityConstructor;
}
