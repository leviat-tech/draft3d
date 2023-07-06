// @ts-check
import { describe, it, expect, beforeEach } from 'vitest';

import ThreeScene from '@/ThreeScene.js';
import draft3d from '@/draft3d.js';
import { createFactory, defineEntity, defineFeature } from '@/defineEntity';


const twoCubesParams = {
  name: 'TwoCubes',
  parameters: { distance: { name: 'distance', type: 'number', default: 2 } },
  render(params) {
    this.addFeature('cube1', 'box', { position: [0, 0, 0] });
    this.addFeature('cube2', 'box', { position: [params.distance, 0, 0] });
  },
  update(obj3d, newParams) {
    this.features.cube2.updateParams({ position: [newParams.distance, 0, 0] });
  },
};

const fourCubesParams = {
  name: 'FourCubes',
  parameters: { factor: { name: 'factor', type: 'number', default: 2 } },
  render(params) {
    this.addFeature('cubes1', 'TwoCubes', { distance: params.factor * 1 });
    this.addFeature('cubes2', 'TwoCubes', { distance: params.factor * 3 });
  },
  update(obj3d, newParams) {
    this.features.cubes1.updateParams({ distance: newParams.factor * 1 });
    this.features.cubes2.updateParams({ distance: newParams.factor * 3 });
  },
};

const stringOfCubes = {
  name: 'StringOfCubes',
  parameters: { positions: { name: 'positions', type: 'number', default: [[0, 0, 0]] } },
  render(params) {
    params.positions.forEach((pos) => this.addFeatureTo('cubes', 'box', { position: pos }));
  },
  update(obj3d, newParams) {
  },
};

const nameError = {
  name: 'NameError',
  parameters: { positions: { name: 'positions', type: 'number', default: [[0, 0, 0]] } },
  render(params) {
    this.addFeature('cube', 'box', { position: [0, 0, 0] });
    this.addFeature('cube', 'box', { position: [0, 0, 0] });
  },
  update(obj3d, newParams) {
  },
};

const iterbleError = {
  name: 'IterableError',
  parameters: { positions: { name: 'positions', type: 'number', default: [[0, 0, 0]] } },
  render(params) {
    this.addFeature('cubes', 'box', { position: [0, 0, 0] });
    params.positions.forEach((pos) => this.addFeatureTo('cubes', 'box', { position: pos }));
  },
  update(obj3d, newParams) {
  },
};


describe('featureStore', () => {
  beforeEach(() => {
    draft3d.entities = {};
    draft3d.features = {};
    draft3d.scene = new ThreeScene();

    defineFeature({ name: 'box', parameters: {}, render: () => { } });
    defineFeature(twoCubesParams);
  });

  it('Should create factory', () => {
    const predefinedParams = [
      'layer',
      'position',
      'rotation',
      'onClick',
      'onDbClick',
      'onMouseOut',
      'onMouseOver',
      'isInteractive',
    ];

    const factory = createFactory(twoCubesParams);

    predefinedParams.forEach((param) => {
      expect(Object.keys(factory.config.parameters)).toContain(param);
    });

    expect(factory.config).toHaveProperty('render');
    expect(factory.config).toHaveProperty('update');
    expect(factory.config.name).toBe('TwoCubes');
  });

  it('should define entity', () => {
    defineEntity(fourCubesParams);

    expect(draft3d.entities.FourCubes !== undefined).toBeTruthy();
  });

  it('should define feature', () => {
    expect(draft3d.features.TwoCubes !== undefined).toBeTruthy();
  });

  it('should allow features can use other features', () => {
    const ourFactor = 4;
    const ourFactor2 = 11;

    defineFeature(fourCubesParams);

    const fourCubes = draft3d.features.FourCubes({ factor: ourFactor });

    expect(fourCubes).not.toBe(undefined);
    expect(fourCubes.features).toMatchObject({ cubes1: {}, cubes2: {} });

    expect(fourCubes.params.factor).toBe(ourFactor);
    expect(fourCubes.features.cubes1.params.distance).toBe(ourFactor);
    expect(fourCubes.features.cubes2.params.distance).toBe(ourFactor * 3);
    expect(fourCubes.features.cubes2.features.cube2.object3d.position.x).toBe((ourFactor * 3));

    fourCubes.updateParams({ factor: ourFactor2 });

    expect(fourCubes.params.factor).toBe(ourFactor2);
    expect(fourCubes.features.cubes2.params.distance).toBe(ourFactor2 * 3);
    expect(fourCubes.features.cubes2.features.cube2.object3d.position.x).toBe((ourFactor2 * 3));
  });

  it('features can be positioned', () => {
    const twoCubes = draft3d.features.TwoCubes({ position: [1, 2, 3] });

    expect(twoCubes.params.position).toEqual([1, 2, 3]);
    expect(twoCubes.object3d.position).toEqual({ x: 1, y: 2, z: 3 });

    twoCubes.updateParams({ position: [4, 5, 6] });
    expect(twoCubes.object3d.position).toEqual({ x: 4, y: 5, z: 6 });
  });

  it('features can be rotated', () => {
    const twoCubes = draft3d.features.TwoCubes({ rotation: [0, 57, 0] });

    expect(twoCubes.params.rotation).toEqual([0, 57, 0]);
    // values in the rotation will be radians
    expect(twoCubes.object3d.rotation.y.toFixed(5)).toEqual((57 * (Math.PI / 180)).toFixed(5));

    twoCubes.updateParams({ rotation: [0, 104, 0] });
    expect(twoCubes.object3d.rotation.y.toFixed(5)).toEqual((104 * (Math.PI / 180)).toFixed(5));
  });

  it.only('supports arbitrary number of subfeatures', () => {
    defineFeature(stringOfCubes);

    const instance1 = draft3d.features.StringOfCubes({});
    const instance2 = draft3d.features.StringOfCubes({ positions: [[0, 0, 0], [0, 0, 2], [0, 0, 3], [0, 0, 4]] });

    expect(instance1.features.cubes.length).toEqual(1);
    expect(instance2.features.cubes.length).toEqual(4);

    expect(instance2.features.cubes[2].params).toMatchObject({ position: [0, 0, 3] });

  });

  it('should warns if subFeature names are reused', () => {
    defineFeature(nameError);

    const doit = () => {
      draft3d.features.NameError({ positions: [[0, 0, 0], [0, 0, 2]] });
    };

    expect(() => doit()).toThrowError('Feature Name already in use');
  });

  it('should warns if Iterable subFeatures are crossed with non Iterable ', () => {
    defineFeature(iterbleError);

    const doit = () => {
      draft3d.features.IterableError({ positions: [[0, 0, 0], [0, 0, 2]] });
    };

    expect(() => doit()).toThrowError('Feature Name already in use for non-iterable feature');
  });

});
