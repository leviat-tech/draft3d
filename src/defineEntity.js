import Entity from './Entity';
import { registerEntity } from './draft3d';

/**
 * @typedef {{
 *   name: string,
 *   parameters: object,
 *   render: function,
 *   update: function,
 * }} entityConfig
 */

const noop = () => { };

/**
 * @param {entityConfig} entity
 * @returns { function(params, layerSet): Entity }
 */
export function createFactory(entity) {
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

  const factory = (params, layerSet) => new Entity(entityConfig, params, layerSet);
  factory.config = entityConfig;

  return factory;
}

/**
 * @param { entityConfig } entityConfig
 * @yields { Entity }
 */
export function defineEntity(entityConfig) {
  return registerEntity(createFactory(entityConfig), 'entities');
}

export function defineFeature(entityConfig) {
  return registerEntity(createFactory(entityConfig), 'features');
}
