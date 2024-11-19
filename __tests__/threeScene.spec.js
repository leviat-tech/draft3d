import { PerspectiveCamera, Scene } from 'three';
import { describe, it, expect, vi } from 'vitest';

import { setupVitestCanvasMock } from 'vi-canvas-mock';
import ThreeScene from '@/ThreeScene';
import LayerSet from '@/utils/LayerSet';
import setup from './utils/setup';


function checkAxisIndicatorDefaultState(scene) {
  expect(scene.axisIndicator.isEnabled).toBeFalsy();

  expect(scene.axisIndicator.scene).toBeNull();
  expect(scene.axisIndicator.canvas).toBeNull();
  expect(scene.axisIndicator.camera).toBeNull();
  expect(scene.axisIndicator.renderer).toBeNull();
}

describe('Three scene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupVitestCanvasMock();
    setup();
  });
  it('should create scene', () => {
    const scene = new ThreeScene();

    checkAxisIndicatorDefaultState(scene);

    expect(scene.layerSet).toBeInstanceOf(LayerSet);
    expect(scene.originalScene).toBeInstanceOf(Scene);
  });

  it('should not create axis indicator', () => {
    const scene = new ThreeScene();
    const el = document.createElement('div');

    scene.createAxisIndicator();

    checkAxisIndicatorDefaultState(scene);

    scene.createAxisIndicator(el);

    checkAxisIndicatorDefaultState(scene);

    scene.createAxisIndicator(el, { isEnabled: false });

    checkAxisIndicatorDefaultState(scene);
  });

  it('should create axis indicator', async () => {

    const scene = new ThreeScene();
    const el = document.createElement('canvas');

    scene.perspectiveControls = {
      addEventListener() { },
    };

    // HTMLCanvasElement.prototype.getContext = vi.fn();

    vi.spyOn(scene, 'updateAxisIndicator').mockImplementation(() => { });

    await scene.createAxisIndicator(el, { isEnabled: true });

    expect(scene.axisIndicator.isEnabled).toBeTruthy();
    expect(scene.axisIndicator.camera).toBeInstanceOf(PerspectiveCamera);
    expect(scene.axisIndicator.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(scene.axisIndicator.renderer).not.toBe(null);
  });

  it('should stop animating and remove event handlers when destroyed', async () => {
    const scene = new ThreeScene();
    const el = document.createElement('div');
    const resizeHandlerSpy = vi.spyOn(scene, 'onResize');

    scene.initialize(el);

    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));

    expect(scene.isAnimating).toBe(true);
    expect(resizeHandlerSpy).toHaveBeenCalledTimes(3);

    scene.destroy();

    window.dispatchEvent(new Event('resize'));

    expect(scene.isAnimating).toBe(false);
    expect(resizeHandlerSpy).toHaveBeenCalledTimes(3);

  });
});
