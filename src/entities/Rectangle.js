import {
  BufferGeometry,
  DoubleSide,
  MeshPhongMaterial,
  Float32BufferAttribute,
  Color,
  Mesh
} from 'three';

class Rectangle {
  constructor(params) {
    const material = new MeshPhongMaterial({...params.material, color:new Color('red')});
    const geometry = Rectangle.getGeometry(params.dimensions);

    // super(geometry, material);
    this.mesh = new Mesh(geometry, material);
  }

  static getGeometry(dimensions) {
    const geometry = new BufferGeometry();
    const flattened = dimensions.reduce((array, item) => [...array, ...item], [])
    geometry.setAttribute('position', new Float32BufferAttribute(flattened, 3));
    geometry.setAttribute('color', new Float32BufferAttribute())
    geometry.setIndex([0, 1, 2, 2, 3, 0])

    return geometry;
  }

  updateParams(newParams) {
    this.geometry?.dispose();
    this.geometry = Rectangle.getGeometry(newParams);
  }
}

export default Rectangle;
