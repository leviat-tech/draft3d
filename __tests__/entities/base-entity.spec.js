import Entity from '@/Entity'
import { Object3D } from 'three';

describe('BaseEntity', () => {
  describe('constructor', () => {
    it('should throw an error if no entity config is passed', () => {
      const action = () => new Entity();

      expect(action).toThrowError();
    });

    it('should throw an error if no render property in the entity config', () => {
      const action = () => new Entity({
        parameters: {}
      });

      expect(action).toThrowError();
    });

    it('should throw an error if no parameters property in the entity config', () => {
      const action = () => new Entity({
        render: jest.fn()
      });

      expect(action).toThrowError();
    });
  });

  describe('parameters', () => {
    it('should have position and rotation parameters by default', () => {
      const entityConfig = {
        parameters: {},
        render: () => ({
          object3d: new Object3D()
        })
      };

      const entity = new Entity(entityConfig);
      const paramsKeys = Object.keys(entity.params);

      expect(paramsKeys).toEqual(['position', 'rotation']);
    });

    it('should prevent position and rotation parameters from being overwritten', () => {
      const entityConfig = {
        parameters: {
          position: { name: 'Position', default: 'foo' },
          rotation: { name: 'Rotation', default: 'bar' },
        },
        render: () => ({
          object3d: new Object3D()
        })
      };

      const entity = new Entity(entityConfig);

      expect(entity.params.position).toEqual([0, 0, 0]);
      expect(entity.params.rotation).toEqual([0, 0, 0]);
    });

    it('should register the foo parameter with a default of bar', () => {
      const entityConfig = {
        parameters: {
          foo: { name: 'Foo', default: 'bar' }
        },
        render: () => ({
          object3d: new Object3D()
        })
      };

      const entity = new Entity(entityConfig);

      expect(entity.params.foo).toEqual('bar');
    });

    it('should set the foo parameter to `baz`', () => {
      const entityConfig = {
        parameters: {
          foo: { name: 'Foo', default: 'bar' },
        },
        render: () => ({
          object3d: new Object3D(),
        }),
      };

      const entity = new Entity(entityConfig, { foo: 'baz' });

      expect(entity.params.foo).toEqual('baz');
    });

    it('should log an error if an unknown parameter is passed', () => {
      const entityConfig = {
        parameters: {
          foo: { name: 'Foo', default: 'bar' },
        },
        render: () => ({
          object3d: new Object3D(),
        }),
      };

      const entity = new Entity(entityConfig, { baz: true });

      expect(entity.params.baz).toEqual(true);
    });
  });

  describe('render', () => {
    it('should throw an error if a three Object3D is not returned in the render function', () => {
      const action = () => new Entity({
        parameters: {},
        render: () => {
        }
      });

      expect(action).toThrowError();
    });

    it('should return a three Object3D in the render function', () => {
      const entity = new Entity({
        parameters: {},
        render: () => ({ object3d: new Object3D() })
      });

      expect(entity.object3d).toBeInstanceOf(Object3D);
    });

    it('should store addition props returned by the render function', () => {
      const entityConfig = {
        parameters: {},
        render: () => ({
          object3d: new Object3D(),
          foo: 'bar',
        }),
      };

      const entity = new Entity(entityConfig);

      expect(entity.renderProps).toEqual({ foo: 'bar' });
    });

  });

});
