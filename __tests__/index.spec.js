import { Object3D } from 'three';
import * as entities from '@/entities';
import { castParameters } from '../src/utils/helpers';


describe.each(Object.values(entities))('$name entity', (entity) => {
  it('should contain mandatory properties', () => {
    const mandatoryKeys = ['name', 'parameters', 'render'];

    expect(entity).toContainKeys(mandatoryKeys);
  });

  it('should not contain any unsupported keys', () => {
    const { name, parameters, render, ...optionalKeys } = entity;
    const supportedKeys = ['update'];

    Object.keys(optionalKeys).forEach((key) => {
      expect(supportedKeys).toContain(key);
    });
  });

  it('should not contain any predefined parameters', () => {
    const predefinedParameters = ['position', 'rotation'];

    Object.keys(entity.parameters).forEach((paramName) => {
      expect(predefinedParameters).not.toContain(paramName);
    });
  });

  it('should return a three Object3D in the render function', () => {
    const object3d = entity.render(castParameters(entity.parameters));

    expect(object3d).toBeInstanceOf(Object3D);
  });

  it('should update with new parameters if update is present', () => {
    if (!entity.update) return;

    const params = castParameters(entity.parameters);
    const object3d = entity.render(params);
    const newParams = {
      ...params,
      position: [1, 2, 3],
    };

    const update = () => entity.update(object3d, newParams);

    expect(update).not.toThrowError();
  });
});
