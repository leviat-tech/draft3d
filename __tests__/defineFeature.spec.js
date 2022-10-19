import { Object3D, PerspectiveCamera, Layers } from 'three';

import draft3d from '../src';

const twoCubesParams = {
  name: 'TwoCubes',
  parameters: { distance: { name: 'distance', type: 'number', default: 2 } },
  render(params) {
    this.addFeature('cube1', 'box', { position: [0, 0, 0] });
    this.addFeature('cube2', 'box', { position: [params.distance, 0, 0] });
  },
  update(obj3d, newParams) {
    this.features.cube2.updateParams({ position: [newParams.distance, 0, 0] });
  }
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
  }
};

const paramTest = {
  name: 'ParameterTest',
  parameters: {
    one: { name: 'one', type: 'number', default: 1 },
    two: { name: 'two', type: 'number', default: 2 },
    three: { name: 'three', type: 'number', default: 3 },
  },
  render(params) {
    return new Object3D();
  },
  update(obj3d, newParams) {
  }
};

const stringOfCubes = {
  name: 'StringOfCubes',
  parameters: { positions: { name: 'positions', type: 'number', default: [[0, 0, 0]] } },
  render(params) {
    params.positions.forEach((pos) => this.addFeatureTo('cubes', 'box', { position: pos }));
  },
  update(obj3d, newParams) {
  }
};

const nameError = {
  name: 'NameError',
  parameters: { positions: { name: 'positions', type: 'number', default: [[0, 0, 0]] } },
  render(params) {
    this.addFeature('cube', 'box', { position: [0, 0, 0] });
    this.addFeature('cube', 'box', { position: [0, 0, 0] });
  },
  update(obj3d, newParams) {
  }
};

const iterbleError = {
  name: 'IterableError',
  parameters: { positions: { name: 'positions', type: 'number', default: [[0, 0, 0]] } },
  render(params) {
    this.addFeature('cubes', 'box', { position: [0, 0, 0] });
    params.positions.forEach((pos) => this.addFeatureTo('cubes', 'box', { position: pos }));
  },
  update(obj3d, newParams) {
  }
};

describe('featureStore', () => {

  test('features can be defined', () => {
    draft3d.registerFeature(twoCubesParams);

    expect(draft3d.features.TwoCubes !== undefined).toBe(true);
  });


  //TODO can utilise each base entity in a feature

  test('instances of features contain a threeJS object3d', () => {
    const instance1 = draft3d.features.TwoCubes({ distance: 1 });

    expect(instance1.object3d instanceof Object3D).toBe(true);
  });

  test('default parameters are merged into provided params', () => {
    draft3d.registerFeature(paramTest);
    const instance1 = draft3d.features.ParameterTest({ two: 4 });
    expect(instance1.params.one).toBe(1);
    expect(instance1.params.two).toBe(4);
    expect(instance1.params.three).toBe(3);

  });

  test('features can use other features', () => {
    const ourFactor = 2;
    const ourFactor2 = 11;
    draft3d.registerFeature(fourCubesParams);
    const instance1 = draft3d.features.FourCubes({ factor: ourFactor });

    expect(instance1).not.toBe(undefined);
    expect(instance1.features).toMatchObject({ cubes1: {}, cubes2: {} });

    expect(instance1.params.factor).toBe(ourFactor);
    expect(instance1.features.cubes2.params.distance).toBe(ourFactor * 3);
    expect(instance1.features.cubes2.features.cube2.object3d.position.x).toBe((ourFactor * 3));

    instance1.updateParams({ factor: ourFactor2 })
    expect(instance1.params.factor).toBe(ourFactor2);
    expect(instance1.features.cubes2.params.distance).toBe(ourFactor2 * 3);
    expect(instance1.features.cubes2.features.cube2.object3d.position.x).toBe((ourFactor2 * 3));
  });

  test('features can be positioned', () => {
    const instance1 = draft3d.features.TwoCubes({ position: [1, 2, 3] });

    expect(instance1.params.position).toEqual([1, 2, 3]);
    expect(instance1.object3d.position).toEqual({ "x": 1, "y": 2, "z": 3 });


    instance1.updateParams({ position: [4, 5, 6] })
    expect(instance1.object3d.position).toEqual({ "x": 4, "y": 5, "z": 6 });
  });

  test('features can be rotated', () => {
    const instance1 = draft3d.features.TwoCubes({ rotation: [0, 57, 0] });

    expect(instance1.params.rotation).toEqual([0, 57, 0]);
    // values in the rotation will be radians
    expect(instance1.object3d.rotation.y.toFixed(5)).toEqual((57 * (Math.PI / 180)).toFixed(5));

    instance1.updateParams({ rotation: [0, 104, 0] })
    expect(instance1.object3d.rotation.y.toFixed(5)).toEqual((104 * (Math.PI / 180)).toFixed(5));
  });

  test('supports arbitrary number of subfeatures', () => {

    draft3d.registerFeature(stringOfCubes);
    const instance1 = draft3d.features.StringOfCubes({});
    const instance2 = draft3d.features.StringOfCubes({ positions: [[0, 0, 0], [0, 0, 2], [0, 0, 3], [0, 0, 4]] });

    expect(instance1.features.cubes.length).toEqual(1);
    expect(instance2.features.cubes.length).toEqual(4);

    expect(instance1.object3d.children.length).toEqual(1);
    expect(instance2.object3d.children.length).toEqual(4);

    expect(instance2.features.cubes[2].params).toMatchObject({ position: [0, 0, 3] });
    expect(instance2.object3d.children[2].position).toMatchObject({ "x": 0, "y": 0, "z": 3 });

  });

  test('warns if subFeature names are reused', () => {

    draft3d.registerFeature(nameError);

    const doit = () => {
      const instance1 = draft3d.features.NameError({ positions: [[0, 0, 0], [0, 0, 2]] });
    };

    expect(() => doit()).toThrowError('Feature Name already in use');
  });

  test('warns if Iterable subFeatures are crossed with non Iterable ', () => {

    draft3d.registerFeature(iterbleError);

    const doit = () => {
      const instance1 = draft3d.features.IterableError({ positions: [[0, 0, 0], [0, 0, 2]] });
    };

    expect(() => doit()).toThrowError('Feature Name already in use for non-iterable feature');
  });

});
