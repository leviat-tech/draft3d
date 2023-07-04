import { EdgesGeometry, MathUtils, Vector3 } from 'three';
import { chunk } from 'lodash';

const AXIS = ['x', 'y', 'z']
const TYPES = { object3d: 'Object3D', mesh: 'Mesh' }
const EDGE_ACCURACY = 0.9

const extractPoints = function (mesh) {
  const position = mesh.attributes.position;
  const end = position.count;
  const localVectors = [];
  for (let i = 0; i < end; i++) {
    localVectors.push(new Vector3().fromBufferAttribute(position, i));
  }
  return localVectors;
};

const flatten = function (vector, direction) {
  if (direction === 'x') return [vector.z, vector.y];
  if (direction === 'y') return [vector.z, vector.y];
  return [vector.x, vector.y];
};

const getDepths = function (vectors,direction) {
  const justDepths = vectors.map(victor => victor[direction])
  return { min: Math.min(...justDepths), max: Math.max(...justDepths) }
}

const processMesh = function (mesh, direction) {
  mesh.updateWorldMatrix(true, true);
  const edges = new EdgesGeometry(mesh.geometry, EDGE_ACCURACY);
  const vectors = extractPoints(edges);
  vectors.forEach((local) => local.applyMatrix4(mesh.matrixWorld));
  const depth = getDepths(vectors, direction);
  const flatPoints = vectors.map(victor => flatten(victor, direction));
  const shape = chunk(flatPoints, 2);
  return { shape, depth };
};

const processChild = function (feature, direction) {
  const { name, type, children } = feature;
  if (type === TYPES.object3d) {
    return (children?.length > 0) ? { name, type, children: children.map((child) => processChild(child, direction)) } : { name, type };
  }
  if (type === TYPES.mesh) {
    const { shape, depth } = processMesh(feature, direction)
    return { name, type, shape, depth };
  }
};

const processFeature = function (feature, direction) {
  const tree = feature.object3d.children;
  const out = tree.map((child) => processChild(child, direction));
  return out;
};

// return an array of lines for each mesh inside the feature for an orthographic view from the 'direction'
// faces with an angle in degrees between them of less than precision will be treated as one face
export default function orthographicView(feature, direction, precision = 0.9) {

  if (!AXIS.includes(direction)) {
    throw new Error(`Expected angle to be one of ` + angles.join(' '));
  }
  const output = processFeature(feature, direction);
  return output;
}

