// @ts-check
import { afterEach, describe, expect, it } from 'vitest';

import draft3d, { registerEntity } from '@/draft3d.js';


describe('draft3d', () => {
  afterEach(() => {
    draft3d.entities = {};
    draft3d.features = {};
  });

  it('should throw error on wrong registerTo value', () => {
    try {
      registerEntity({ config: { name: '' } }, 'box');
    } catch (error) {
      expect(error).toHaveProperty('message', 'Specify correct registerTo value');
    }
  });

  it('should throw error on wrong entity name', () => {
    try {
      registerEntity({ config: { name: '' } }, 'features');
    } catch (error) {
      expect(error).toHaveProperty('message', 'Specify entity name');
    }
  });

  it('should throw error on duplicated entity name', () => {
    try {
      registerEntity({ config: { name: 'test' } }, 'features');
      registerEntity({ config: { name: 'test' } }, 'features');
    } catch (error) {
      expect(error).toHaveProperty('message', 'Cannot register test as it already exists');
    }
  });

  it('Should register entity', () => {
    expect(Object.keys(draft3d.features).length).toBe(0);

    registerEntity({ config: { name: 'test' } }, 'features');

    expect(Object.keys(draft3d.features).length).toBe(1);
    expect(draft3d.features.test.config.name).toBe('test');
  });
});
