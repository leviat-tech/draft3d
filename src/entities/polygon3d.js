import {
  ExtrudeGeometry,
  MeshPhongMaterial,
  Mesh,
  Shape,
} from 'three';


export default {
  name: 'polygon3d',
  parameters: {
    depth: { name: 'Depth', default: 1 },
    temp: { name: 'temp', type: 'point', default: [2, 4, 0] },
    color: { name: 'Colour', type: 'color', default: '#6666aa' },
    path: {
      name: 'Path',
      // items: { type: 'point', default: [0, 0] },
      default: [
        [0, 0],
        [2, 0],
        [1, 1],
        [2, 2],
        [0, 2],
        [0, 0],
      ],
    },
  },
  render(params) {
    const { depth, color, path } = params;

    const shape = new Shape();

    shape.moveTo(...path[0]);

    path.slice(1).forEach((point) => {
      shape.lineTo(...point);
    });

    const material = new MeshPhongMaterial({
      color,
    });

    const extrudeSettings = {
      steps: 2,
      depth: params.depth,
      bevelEnabled: false,
      bevelThickness: 1,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 1,
    };

    const geometry = new ExtrudeGeometry(shape, extrudeSettings);

    return new Mesh(geometry, material);
  },
};
