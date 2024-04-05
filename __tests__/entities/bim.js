import { Object3D } from 'three';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import bim from '../../src/entities/bim';
import bimData from '../data/bim-data';


const instance = bim({ bimData });


describe('Bim Entity', () => {
  it('renders', () => {
    expect(instance.object3d).toBeInstanceOf(Object3D);
  });

  it('renders two revolutions', () => {
    expect(instance.object3d.getObjectByName('anchors_0')).toBeInstanceOf(Object3D);
    expect(instance.object3d.getObjectByName('anchors_1')).toBeInstanceOf(Object3D);
  });

  it('renders an extrusion', () => {
    expect(instance.object3d.getObjectByName('channel')).toBeInstanceOf(Object3D);
  });

  it('renders a rebar', () => {
    expect(instance.object3d.getObjectByName('rebars')).toBeInstanceOf(Object3D);
  });
});
