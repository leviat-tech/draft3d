import { Object3D, PerspectiveCamera, Layers } from 'three';

import LayerSet from '../src/utils/LayerSet';


describe('LayerSet', () => {
  afterEach(() => LayerSet.reset());

  test('it should have layer 0 by default', () => {
    expect(LayerSet.getLayerId('default')).toEqual(0);
  });
  test('it stores layers names', () => {

    LayerSet.addLayer('one');
    LayerSet.addLayer('two');
    LayerSet.addLayer('three');
    expect(LayerSet.getLayerNames()).toEqual(['default','one','two','three']);
  });
  test('it ignores duplicate layers', () => {

    LayerSet.addLayer('one');
    LayerSet.addLayer('two');
    LayerSet.addLayer('two');
    LayerSet.addLayer('three');
    expect(LayerSet.getLayerNames()).toEqual(['default','one','two','three']);
  });

  test('objects can be assigned layers', () => {

    const camera = new PerspectiveCamera();
    LayerSet.addLayer('one');

    const obj = new Object3D();

    LayerSet.addToLayer('one', obj);

    const layer = new Layers();
    layer.set(1);

    expect(obj.layers.mask).toEqual(layer.mask);
  });

  test('objects only have one layer assigned at a time', () => {

    const camera = new PerspectiveCamera();
    LayerSet.addLayer('one');
    LayerSet.addLayer('two');

    const obj = new Object3D();

    LayerSet.addToLayer('one', obj);
    LayerSet.addToLayer('two', obj);

    const layer = new Layers();
    layer.set(2);

    expect(obj.layers.mask).toEqual(layer.mask);
  });


  test('it stores cameras', () => {

    LayerSet.addCamera(new PerspectiveCamera());
    LayerSet.addCamera(new PerspectiveCamera());
    expect(LayerSet.cameras.length).toEqual(2);
  });

  test('it ignores duplicate cameras', () => {

    const camera = new PerspectiveCamera();
    LayerSet.addCamera(camera);
    LayerSet.addCamera(camera);
    expect(LayerSet.cameras.length).toEqual(1);
  });

  test('layers in cameras enable', () => {

    const camera = new PerspectiveCamera();
    LayerSet.addCamera(camera);
    LayerSet.addLayer('one');
    LayerSet.show('one');

    const layer = new Layers();
    layer.set(0);
    layer.enable(1);

    expect(camera.layers.mask).toEqual(layer.mask);
  });

  test('multiple layers in cameras enable in series', () => {

    const camera = new PerspectiveCamera();
    LayerSet.addCamera(camera);
    LayerSet.addLayer('one');
    LayerSet.addLayer('two');
    LayerSet.addLayer('three');

    LayerSet.show('one');
    LayerSet.show('three');

    const layer = new Layers();
    layer.set(0);
    layer.enable(1);
    layer.enable(3);

    expect(camera.layers.mask).toEqual(layer.mask);
  });

  test('multiple layers in cameras enable in from an array', () => {

    const camera = new PerspectiveCamera();
    LayerSet.addCamera(camera);
    LayerSet.addLayer('one');
    LayerSet.addLayer('two');
    LayerSet.addLayer('three');

    LayerSet.show(['one','three']);

    const layer = new Layers();
    layer.set(0);
    layer.enable(1);
    layer.enable(3);

    expect(camera.layers.mask).toEqual(layer.mask);
  });

  test('show only overides previous settings', () => {

    const camera = new PerspectiveCamera();
    LayerSet.addCamera(camera);
    LayerSet.addLayer('one');
    LayerSet.addLayer('two');
    LayerSet.addLayer('three');

    LayerSet.show('one');
    LayerSet.show('three');
    LayerSet.showOnly('two');

    const layer = new Layers();
    layer.set(2);

    expect(camera.layers.mask).toEqual(layer.mask);
  });

  test('show only overides previous settings with array input', () => {

    const camera = new PerspectiveCamera();
    LayerSet.addCamera(camera);
    LayerSet.addLayer('one');
    LayerSet.addLayer('two');
    LayerSet.addLayer('three');

    LayerSet.show('one');
    LayerSet.show('three');
    LayerSet.showOnly(['two', 'default']);

    const layer = new Layers();
    layer.set(0);
    layer.enable(2);

    expect(camera.layers.mask).toEqual(layer.mask);
  });

});
