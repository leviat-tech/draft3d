import {
  BoxGeometry,
  DoubleSide,
  MeshPhongMaterial,
  Mesh,
} from 'three';

class Box extends Mesh {
  static defaults = {
    a: 1
  }

  constructor(params) {
    const { dimensions } = params;
    const materialConfig = {
      color: 0x0033cc,
      transparent: true,
      opacity: 1,
      ...params.material,
    };
    const _material = new MeshPhongMaterial({
      ...materialConfig,
      side: DoubleSide,
    });
    const geometry = new BoxGeometry(...dimensions);

    super(geometry, _material);

    if (params.position) this.position.set(...params.position);
  }

  updateParams(newParams) {
    const { dimensions, position } = newParams;
    this.geometry?.dispose();
    this.geometry = new BoxGeometry(...dimensions);

    if (position) {
      this.position.set(...position);
    }
  }
}

const box = {
  name: 'Box',
  parameters: {
    dimensions: { name: 'Dimensions', default: [2, 2, 2],  },
    color: { name: 'Color', type: 'color', default: '#888888' },
    opacity: { name: 'Opacity', default: 1  }
  },
  render(params) {
    const { dimensions } = params;
    const materialConfig = {
      color: params.color,
      transparent: true,
      opacity: 1,
      ...params.material,
    };
    const material = new MeshPhongMaterial({
      ...materialConfig,
      side: DoubleSide,
    });
    const geometry = new BoxGeometry(...dimensions);

    return new Mesh(geometry, material);
  },
  update(entity, newParams) {
    const { dimensions } = newParams;
    entity.object3d.geometry?.dispose();
    entity.object3d.geometry = new BoxGeometry(...dimensions);
  }
}

export default box;
