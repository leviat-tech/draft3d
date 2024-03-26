import { PerspectiveCamera, Scene } from 'three';
import { describe, it, expect, vi } from 'vitest';

import ThreeScene from '@/ThreeScene';
import LayerSet from '@/utils/LayerSet';
import { setupVitestCanvasMock } from 'vi-canvas-mock';


function checkAxisIndicatorDefaultState(scene) {
  expect(scene.axisIndicator.isEnabled).toBeFalsy();

  expect(scene.axisIndicator.scene).toBeNull();
  expect(scene.axisIndicator.canvas).toBeNull();
  expect(scene.axisIndicator.camera).toBeNull();
  expect(scene.axisIndicator.renderer).toBeNull();
}

describe('Three scene', () => {
  beforeEach(()=>{
    setupVitestCanvasMock();
  })
  it('should create scene', () => {
    const scene = new ThreeScene();

    checkAxisIndicatorDefaultState(scene);

    expect(scene.animationFrame).toBeNull();
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

    //HTMLCanvasElement.prototype.getContext = vi.fn();

    vi.mock('three', async () => {
      const THREE = await vi.importActual('three');
      return {
        ...THREE,
        WebGLRenderer: vi.fn().mockReturnValue({
          domElement: document.createElement('div'), // create a fake div
          setSize: vi.fn(),
          render: vi.fn(),
          setPixelRatio: vi.fn(),
        }),
      };
    });

    vi.spyOn(scene, 'updateAxisIndicator').mockImplementation(() => { });

    await scene.createAxisIndicator(el, { isEnabled: true });

    expect(scene.axisIndicator.isEnabled).toBeTruthy();
    expect(scene.axisIndicator.camera).toBeInstanceOf(PerspectiveCamera);
    expect(scene.axisIndicator.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(scene.axisIndicator.renderer).not.toBe(null);
  });
});
