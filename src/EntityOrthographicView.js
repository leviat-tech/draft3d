import { EdgesGeometry, Vector3 } from 'three';
import { chunk } from 'lodash';


const AXIS = ['x', 'y', 'z'];
const TYPES = { object3d: 'Object3D', mesh: 'Mesh' };
const EDGE_ACCURACY = 0.9;

export const extractPoints = (geometry) => {
  const position = geometry.attributes.position;
  const end = position.count;
  const localVectors = [];
  for (let i = 0; i < end; i++) {
    localVectors.push(new Vector3().fromBufferAttribute(position, i));
  }
  return localVectors;
};

const flatten = (vector, direction) => {
  if (direction === 'x') return [vector.z, vector.y];
  if (direction === 'y') return [vector.x, vector.z];
  return [vector.x, vector.y];
};

const getDepths = (vectors, direction) => {
  const justDepths = vectors.map((vector) => vector[direction]);
  return { min: Math.min(...justDepths), max: Math.max(...justDepths) };
};

export const processMesh = (mesh, direction) => {
  mesh.updateWorldMatrix(true, true);
  const edges = new EdgesGeometry(mesh.geometry, EDGE_ACCURACY);
  const vectors = extractPoints(edges);
  vectors.forEach((local) => local.applyMatrix4(mesh.matrixWorld));
  const depth = getDepths(vectors, direction);
  const flatPoints = vectors.map((vector) => flatten(vector, direction));
  const shape = flatPoints;
  return { shape, depth };
};

const processChild = (feature, direction) => {
  const { name, type, children } = feature;
  const base = { name, type };

  if (type === TYPES.object3d) {
    if (children.length === 0) {
      return { name, type };
    }

    return {
      ...base,
      children: children
        .map((child) => processChild(child, direction))
        .filter((child) => !!child),
      flatten() {
        const shapes = [];

        const iterateChild = (child, path) => {
          if (child.shape) {
            shapes.push({ path, shape: child.shape });
          }

          if (child.children) {
            child.children.forEach((subchild) => {
              const subpath = path ? [path, subchild.name].join('.') : subchild.name;
              iterateChild(subchild, subpath);
            });
          }
        };

        iterateChild(this);

        return shapes;
      },
    };
  }

  if (type === TYPES.mesh) {
    const mesh = processMesh(feature, direction);
    return { ...base, ...mesh };
  }

  return null;
};

// return an array of lines for each mesh inside the feature for an orthographic view from the 'direction'
// faces with an angle in degrees between them of less than precision will be treated as one face
export default function orthographicView(feature, direction) {

  if (!AXIS.includes(direction)) {
    throw new Error(`Expected angle to be one of ${AXIS.join(' ')}`);
  }
  return processChild(feature.object3d, direction);
}

