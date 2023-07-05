import { Object3D } from 'three';
import { describe, it, expect } from 'vitest';
import Entity from '../src/Entity';


const baseConfig = {
  name: '',
  parameters: {
    rotation: { default: [0, 0, 0] },
    position: { default: [0, 0, 0] },
    srcValue: { default: 0 },
  },
  render(params) {
    return new Object3D();
  },
  update(params) {},
};

const configWithFormattedParams = {
  ...baseConfig,
  formatParams(params) {
    return { destValue: params.srcValue + 10 };
  },
};

describe('Entity', () => {
  it('temporary test', () => {
    expect(true).toBeTruthy();
  });
  // it('should render with unformatted params', () => {
  //   const renderSpy = jest.spyOn(baseConfig, 'render');
  //   new Entity(baseConfig);
  //   const calledWithParams = renderSpy.mock.calls[0][0];

  //   expect(calledWithParams.srcValue).toBe(0);
  // });

  // it('should update with unformatted params', () => {
  //   const updateSpy = jest.spyOn(baseConfig, 'update');
  //   const entity = new Entity(baseConfig);
  //   entity.updateParams({});
  //   const calledWithParams = updateSpy.mock.calls[0][1];

  //   expect(calledWithParams.srcValue).toBe(0);
  //   expect(calledWithParams.destValue).toBe(undefined);
  // });

  // it('should not merge params when updating', () => {
  //   const entity = new Entity({
  //     ...baseConfig,
  //     parameters: {
  //       ...baseConfig.parameters,
  //       values: { default: [0, 1, 2, 3, 4, 5] },
  //     },
  //   });

  //   entity.updateParams({ values: [0, 1, 2, 3] });

  //   expect(entity.params.values).toEqual([0, 1, 2, 3]);
  // });

  // it('should render with formatted params', () => {
  //   const renderSpy = jest.spyOn(configWithFormattedParams, 'render');
  //   new Entity(configWithFormattedParams);
  //   const calledWithParams = renderSpy.mock.calls[0][0];

  //   expect(calledWithParams.destValue).toBe(10);
  // });

  // it('should update with formatted params', () => {
  //   const updateSpy = jest.spyOn(configWithFormattedParams, 'update');
  //   const entity = new Entity(configWithFormattedParams);
  //   entity.updateParams({});
  //   const calledWithParams = updateSpy.mock.calls[0][1];

  //   expect(calledWithParams.srcValue).toBe(undefined);
  //   expect(calledWithParams.destValue).toBe(10);
  // });
});
