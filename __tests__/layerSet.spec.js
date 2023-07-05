import { Object3D, PerspectiveCamera, Layers } from 'three';

import {
  describe, it, expect, beforeEach, afterEach, vi,
} from 'vitest';
import LayerSet from '@/utils/LayerSet';


let layerSet = null;
const spyOnConsole = vi.spyOn(console, 'log');


describe('LayerSet', () => {
  beforeEach(() => {
    layerSet = new LayerSet();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should have default values', () => {
    const { layers, cameras } = layerSet;

    expect(cameras.length).toEqual(0);
    expect(layers.length).toEqual(1);

    expect(layers[0].id).toEqual(0);
    expect(layers[0].name).toEqual('default');
    expect(layers[0].visible).toBeTruthy();
  });

  it('should reset layers', () => {
    layerSet.addLayer('one');
    layerSet.addLayer('two');

    expect(layerSet.layers.length).toEqual(3);

    layerSet.reset();

    expect(layerSet.layers.length).toEqual(1);
  });

  describe('Layers', () => {
    it('should add new layers', () => {
      layerSet.addLayer('one');
      layerSet.addLayer('two');

      const { layers } = layerSet;

      expect(layers.length).toEqual(3);

      expect(layers[1].id).toEqual(1);
      expect(layers[1].name).toEqual('one');
      expect(layers[1].visible).toBeTruthy();

      expect(layers[2].id).toEqual(2);
      expect(layers[2].name).toEqual('two');
      expect(layers[2].visible).toBeTruthy();
    });

    it('should not add duplicated layer', () => {
      layerSet.addLayer('one');
      layerSet.addLayer('one');

      expect(spyOnConsole.mock.calls[0][0])
        .toEqual('LayerSet: Layer named one already exists');

      expect(layerSet.layers.length).toEqual(2);
    });

    it('should get layer id', () => {
      layerSet.addLayer('one');

      expect(layerSet.getLayerId('one')).toEqual(1);
    });

    it('should add object to layer', () => {
      const layer = new Layers();
      const object3d = new Object3D();

      const spyOnDisableAllLayers = vi.spyOn(object3d.layers, 'disableAll');
      const spyOnLayerSet = vi.spyOn(object3d.layers, 'set');

      layerSet.addToLayer('default', object3d);

      expect(spyOnDisableAllLayers).toHaveBeenCalledTimes(1);
      expect(spyOnLayerSet).toHaveBeenCalledTimes(1);
      expect(spyOnLayerSet).toHaveBeenCalledWith(0);

      expect(object3d.layers.mask).toEqual(layer.mask);
    });

    it('should add multiple object to layer', () => {
      const layer = new Layers();
      const object3d = new Object3D();

      const spyOnDisableAllLayers = vi.spyOn(object3d.layers, 'disableAll');
      const spyOnLayerSet = vi.spyOn(object3d.layers, 'set');

      layerSet.addToLayer('default', object3d);

      expect(spyOnDisableAllLayers).toHaveBeenCalledTimes(1);
      expect(spyOnLayerSet).toHaveBeenCalledTimes(1);
      expect(spyOnLayerSet).toHaveBeenCalledWith(0);

      expect(object3d.layers.mask).toEqual(layer.mask);
    });


    it('should get layer names', () => {
      layerSet.addLayer('one');
      layerSet.addLayer('two');

      expect(layerSet.getLayerNames()).toStrictEqual(['default', 'one', 'two']);
    });

    it('objects should have only one layer assigned at a time', () => {
      layerSet.addLayer('one');
      layerSet.addLayer('two');

      const object3d = new Object3D();

      layerSet.addToLayer('one', object3d);
      layerSet.addToLayer('two', object3d);

      const layer = new Layers();
      layer.set(2);

      expect(object3d.layers.mask).toEqual(layer.mask);
    });

  });

  describe('Cameras', () => {
    it('should add new camera', () => {
      const spyOnApplyToCameras = vi.spyOn(layerSet, 'applyToCameras').mockImplementation(() => { });

      layerSet.addCamera({ uuid: 1 });

      const { cameras } = layerSet;
      expect(cameras.length).toEqual(1);
      expect(spyOnApplyToCameras).toHaveBeenCalledTimes(1);
    });

    it('should not add duplicated camera', () => {
      const spyOnApplyToCameras = vi.spyOn(layerSet, 'applyToCameras').mockImplementation(() => { });

      layerSet.addCamera({ uuid: 1 });
      layerSet.addCamera({ uuid: 1 });

      expect(spyOnConsole.mock.calls[0][0])
        .toEqual('LayerSet: Camera 1 already added to layerset');

      expect(layerSet.cameras.length).toEqual(1);
      expect(spyOnApplyToCameras).toHaveBeenCalledTimes(1);
    });

    it('should show layers', () => {
      const spyOnApplyToCameras = vi.spyOn(layerSet, 'applyToCameras').mockImplementation(() => { });

      layerSet.addLayer('one');
      layerSet.addLayer('two');

      layerSet.layers.forEach((layer) => { layer.visible = false; });


      layerSet.show(['default', 'one']);
      layerSet.show('two');

      expect(spyOnApplyToCameras).toHaveBeenCalledTimes(2);

      layerSet.layers.forEach((layer) => {
        expect(layer.visible).toBeTruthy();
      });
    });

    it('should hide layers', () => {
      const spyOnApplyToCameras = vi.spyOn(layerSet, 'applyToCameras').mockImplementation(() => { });

      layerSet.addLayer('one');
      layerSet.addLayer('two');


      layerSet.hide(['default', 'one']);
      layerSet.hide('two');

      expect(spyOnApplyToCameras).toHaveBeenCalledTimes(2);

      layerSet.layers.forEach((layer) => {
        expect(layer.visible).toBeFalsy();
      });
    });

    it('should apply to cameras', () => {
      const camera = new PerspectiveCamera();

      layerSet.addCamera(camera);
      layerSet.addLayer('one');

      const spyOnDisableAllLayers = vi.spyOn(camera.layers, 'disableAll');
      const spyOnLayerEnable = vi.spyOn(camera.layers, 'enable');

      layerSet.applyToCameras();

      expect(spyOnDisableAllLayers).toHaveBeenCalledOnce();

      expect(spyOnLayerEnable).toHaveBeenCalledTimes(2);
      expect(spyOnLayerEnable.mock.calls).toMatchObject([[0], [1]]);
    });
  });


});
