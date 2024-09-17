import { setupVitestCanvasMock } from 'vi-canvas-mock';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import data from './data/scene-data.json';

import * as entities from '@/entities';
import ThreeScene from '@/ThreeScene';


describe('JSON import and export', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());
    vi.clearAllMocks();
    setupVitestCanvasMock();
  });

  it('exports an entity to JSON', () => {
    const box = entities.box({
      position: [0, 1, 2],
      rotation: [0, 3, 4],
    });
    const json = box.toJSON();

    expect(json.params.position[2]).toBe(2);
    expect(json.params.rotation[1]).toBe(3);
  });

  it('does not export default position and rotation params', () => {
    const boxWithDefaultParams = entities.box();
    const boxWithRotation = entities.box({ rotation: [1, 2, 3] });
    const boxWithPosition = entities.box({ position: [4, 5, 6] });

    const jsonDefault = boxWithDefaultParams.toJSON();
    const jsonRotation = boxWithRotation.toJSON();
    const jsonPosition = boxWithPosition.toJSON();

    expect(jsonDefault.params.position).toBeUndefined();
    expect(jsonDefault.params.rotation).toBeUndefined();

    expect(jsonRotation.params.rotation).toEqual([1, 2, 3]);
    expect(jsonRotation.params.position).toBeUndefined();

    expect(jsonPosition.params.position).toEqual([4, 5, 6]);
    expect(jsonPosition.params.rotation).toBeUndefined();
  });

  it('exports a scene to JSON', () => {
    const scene = new ThreeScene();
    const box = entities.box({
      position: [0, 1, 2],
      rotation: [0, 3, 4],
    });
    box.addTo(scene);

    const json = scene.toJSON();
    expect(json).toHaveProperty('config');
    expect(json.entities).toHaveLength(1);
  });

  it('imports scene data from JSON', () => {
    const scene = new ThreeScene();

    scene.loadJSON(data);

    expect(scene.originalScene.children.length).toBe(12);
  });
});
