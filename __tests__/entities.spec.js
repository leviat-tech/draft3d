import { setupVitestCanvasMock } from 'vi-canvas-mock';
import { Object3D } from 'three';
import { difference } from 'lodash-es';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as entities from '@/entities';
import { castParameters } from '@/utils/helpers';


const namedEntitites = Object.values(entities).map(entity => ({
  name: entity.config.name,
  entity,
}));

describe.each(namedEntitites)('$name entity', ({ entity }) => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());
    vi.clearAllMocks();
    setupVitestCanvasMock();
  });

  it('should contain mandatory properties', () => {
    const mandatoryKeys = ['name', 'parameters', 'render'];
    const optionalKeys = ['update'];
    const allowedKeys = [...mandatoryKeys, ...optionalKeys];
    const entityKeys = Object.keys(entity.config);

    const unknownKeys = difference(entityKeys, allowedKeys);

    expect(entityKeys).not.toContain(...unknownKeys);
  });

  it('should contain predefined parameters', () => {
    const predefinedParameters = [
      'layer',
      'position',
      'rotation',
      'onClick',
      'onDbClick',
      'onMouseOut',
      'onMouseOver',
    ];

    const predefinedKeys = Object.keys(entity.config.parameters);

    predefinedParameters.forEach((parameter) => {
      expect(predefinedKeys).toContain(parameter);
    });
  });

  it('should return a three Object3D in the render function', () => {
    const object3d = entity.config.render(
      castParameters(entity.config.parameters),
    );

    expect(object3d).toBeInstanceOf(Object3D);
  });
});
