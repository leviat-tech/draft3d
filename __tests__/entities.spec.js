import { Object3D } from 'three';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as entities from '@/entities';
import { castParameters } from '@/utils/helpers';


describe.each(Object.values(entities))('$name entity', (entity) => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());
  });

  it('should contain mandatory properties', () => {
    const mandatoryKeys = ['name', 'parameters', 'render', 'update'];
    const entityKeys = Object.keys(entity.config);

    expect(entityKeys).toStrictEqual(mandatoryKeys);
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
    const object3d = entity.config.render(castParameters(entity.config.parameters));

    expect(object3d).toBeInstanceOf(Object3D);
  });
});
