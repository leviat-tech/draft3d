// @ts-check
import { Object3D, Vector3 } from 'three';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Entity from '../src/Entity';
import LayerSet from '@/utils/LayerSet';
import draft3d from '@/draft3d';


const layerSet = new LayerSet();


/**
 * @type {Entity}
 */
let defaultEntity = null;

const baseConfig = {
  name: 'test name',
  parameters: {
    rotation: { default: [1, 0, 0] },
    position: { default: [1, 0, 0] },
    srcValue: { default: 0 },
  },
  render(params) {
    return new Object3D();
  },
  update(params) { },
};

const configWithFormattedParams = {
  ...baseConfig,
  formatParams(params) {
    return { destValue: params.srcValue + 10 };
  },
};

describe('Entity', () => {
  beforeEach(() => {
    draft3d.features.box = () => new Entity({ ...baseConfig, name: 'cube' }, {}, layerSet);

    defaultEntity = new Entity(baseConfig, {}, layerSet);
  });

  it('should throw on wrong entity name', () => {
    try {
      new Entity({ ...baseConfig, name: undefined });
    } catch (error) {
      expect(error).toHaveProperty('message', 'Specify entity name');
    }

    try {
      new Entity({ ...baseConfig, name: '' });
    } catch (error) {
      expect(error).toHaveProperty('message', 'Specify entity name');
    }
  });

  it('should create Entity with unformatted params', () => {
    const spyOnRender = vi.spyOn(baseConfig, 'render');
    const spyOnAddToLayer = vi.spyOn(layerSet, 'addToLayer');

    const entity = new Entity(baseConfig, { visible: false }, layerSet);

    const degToRad = (deg) => deg * (Math.PI / 180);

    expect(entity.object3d.rotation.x).toBe(degToRad(1));

    expect(entity.name).toBe(baseConfig.name);

    expect(entity.params.visible).toBe(false);

    expect(spyOnRender.mock.calls[0][0]).toStrictEqual({
      rotation: [1, 0, 0],
      position: [1, 0, 0],
      srcValue: 0,
      visible: false,
    });
    expect(spyOnAddToLayer).toHaveBeenCalledOnce();

    expect(entity.features).toStrictEqual({});

    expect(entity.layerSet).toStrictEqual(layerSet);

    expect(entity.object3d).toBeInstanceOf(Object3D);
    expect(entity.object3d.name).toBe(baseConfig.name);

    expect(entity.onUpdate).toStrictEqual(baseConfig.update);

    expect(entity.object3d.position.x).toBe(1);
  });

  it('should create Entity with formatted params', () => {
    const spyOnRender = vi.spyOn(configWithFormattedParams, 'render');

    new Entity(configWithFormattedParams, { visible: true }, layerSet);

    expect(spyOnRender.mock.calls[0][0]).toStrictEqual({ destValue: 10 });
  });

  it('should update object', () => {
    const spyOnUpdate = vi.spyOn(defaultEntity, 'onUpdate');

    const newParams = {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      srcValue: 0,
    };

    defaultEntity.updateParams(newParams);

    expect(spyOnUpdate).toHaveBeenCalledOnce();
    expect(spyOnUpdate.mock.calls[0][0]).toStrictEqual(
      defaultEntity.object3d,
    );
    expect(spyOnUpdate.mock.calls[0][1]).toStrictEqual(
      newParams,
    );
  });

  it('should add object to entity object', () => {
    defaultEntity.add(undefined);

    expect(defaultEntity.object3d.children.length).toBe(0);

    const object3d = new Object3D();

    defaultEntity.add(object3d);

    expect(defaultEntity.object3d.children[0]).toStrictEqual(object3d);
  });

  it('should add object to different object', () => {
    const object3d = new Object3D();

    defaultEntity.addTo(object3d);

    expect(object3d.children[0]).toStrictEqual(defaultEntity.object3d);
  });

  it('should throw error on wrong feature name with addFeature', () => {
    try {
      defaultEntity.addFeature();
    } catch (error) {
      expect(error).toHaveProperty('message', 'Specify feature name');
    }
  });

  it('should throw error on wrong feature type with addFeature', () => {
    try {
      defaultEntity.addFeature('cube');
    } catch (error) {
      expect(error).toHaveProperty('message', 'Specify feature type');
    }

    try {
      defaultEntity.addFeature('cube', 'test');
    } catch (error) {
      expect(error).toHaveProperty('message', 'Unknown feature type');
    }
  });

  it('should add feature', () => {
    const feat = defaultEntity.addFeature('cube', 'box', { position: [0, 0, 0] });

    expect(Object.keys(defaultEntity.features).length).toBe(1);
    expect(defaultEntity.features.cube).toStrictEqual(feat);
    expect(defaultEntity.object3d.children[0]).toStrictEqual(feat.object3d);
  });

  it('should throw error on feature duplication with addFeature', () => {
    defaultEntity.addFeature('cube', 'box', { position: [0, 0, 0] });

    try {
      defaultEntity.addFeature('cube', 'box', { position: [0, 0, 0] });
    } catch (error) {
      expect(error).toHaveProperty('message', 'Feature Name already in use');
    }
  });

  it('should throw error on wrong name with addFeatureTo', () => {
    try {
      defaultEntity.addFeatureTo();
    } catch (error) {
      expect(error).toHaveProperty('message', 'Specify features name');
    }
  });

  it('should add feature with addFeatureTo', () => {
    const feat = defaultEntity.addFeatureTo('cubes', 'box', { position: [0, 0, 0] });

    expect(Object.keys(defaultEntity.features).length).toBe(1);
    expect(defaultEntity.features.cubes).toStrictEqual([feat]);
    expect(defaultEntity.object3d.children[0]).toStrictEqual(feat.object3d);
  });

  it('should throw error on feature duplication with addFeatureTo', () => {
    defaultEntity.addFeature('cubes', 'box', { position: [0, 0, 0] });

    try {
      defaultEntity.addFeatureTo('cubes', 'box', { position: [0, 0, 0] });
    } catch (error) {
      expect(error).toHaveProperty('message', 'Feature Name already in use for non-iterable feature');
    }
  });
});
