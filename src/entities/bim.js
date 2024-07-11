import { filter, omit, pick } from 'lodash-es';

import {
  LatheGeometry, Mesh, Object3D, Path, TubeGeometry,
} from 'three';
import Bend from '@crhio/bend';

import { configureInteractivity } from '../utils/helpers';
import { createMaterial } from '../utils/material';
import { defineEntity } from '../defineEntity';
import { createExtrudeGeometry, createPolyCurve, getCapGeometry } from '../utils/geometry';


function getArcX(item1, item2, item3, item4) {
  const pt1 = (item3.x * item4.z - item4.x * item3.z) * (item2.x - item1.x);

  const pt2 = (item2.x * item1.z - item1.x * item2.z) * (item3.x - item4.x);

  const pt3 = (item2.z - item1.z) * (item3.x - item4.x) - (item3.z - item4.z) * (item2.x - item1.x);

  return (pt1 - pt2) / pt3;
}

function getArcY(item1, item2, item3, item4, arcX) {
  if (item2.x !== item1.x) {
    const pt1 = arcX * (item2.z - item1.z) + item2.x * item1.z - item1.x * item2.z;

    const pt2 = item2.x - item1.x;

    return pt1 / pt2;
  }

  if (item3.x !== item4.x) {
    const pt1 = arcX * (item3.z - item4.z) + item3.x * item4.z - item4.x * item3.z;

    const pt2 = item3.x - item4.x;

    return pt1 / pt2;
  }
}

function profileDataSlice(params) {
  let arcPointIndex = 0;

  const paramsCopy = JSON.parse(JSON.stringify(params));

  for (let i = 0; i < paramsCopy.length; i++) {
    if (paramsCopy[i].type === 'arc_end_point') {
      if (i >= 2) {
        arcPointIndex = i - 2;
        break;
      }
    }
  }

  const return01 = paramsCopy.slice(arcPointIndex, paramsCopy.length);
  const return02 = paramsCopy.slice(1, arcPointIndex);
  const result = return01.concat(return02);

  return result.concat(return01[0]);
}

function profileDataSplice(params) {
  const paramsCopy = JSON.parse(JSON.stringify(params));
  const deleteIndices = [];

  paramsCopy.forEach((item, index) => {
    if (item.type === 'arc_end_point') {
      if (paramsCopy[index + 1].x === item.x
        && paramsCopy[index + 1].y === item.y
        && paramsCopy[index + 1].z === item.z
      ) {
        deleteIndices.push(index + 1);
      }
    }
  });

  for (let i = deleteIndices.length - 1; i >= 0; i--) {
    paramsCopy.splice(deleteIndices[i], 1);
  }
  return paramsCopy;
}

function sortProfileData(params) {
  const profileDataSliced = profileDataSlice(params);
  const profileDataSpliced = profileDataSplice(profileDataSliced);

  return profileDataSpliced;
}

export function findExtrusionPath(profile) {
  const path = new Path();
  const sortedProfile = sortProfileData(profile);

  sortedProfile.forEach((point, index) => {
    if (index === 0) {
      path.moveTo(point.x, point.z);
      return;
    }

    if (point.type === 'polyline_point') {
      path.lineTo(point.x, point.z);
      return;
    }

    if (point.type === 'arc_end_point') {
      const arcX = getArcX(
        sortedProfile[index - 2],
        sortedProfile[index - 1],
        sortedProfile[index],
        // if pt[last] is arc_end_point, so pt[index+1] is out of range, and since pt[last] = pt[0] -> item4 is pt[1]
        index + 1 >= sortedProfile.length ? sortedProfile[1] : sortedProfile[index + 1],
      );

      const arcY = getArcY(
        sortedProfile[index - 2],
        sortedProfile[index - 1],
        sortedProfile[index],
        index + 1 >= sortedProfile.length ? sortedProfile[1] : sortedProfile[index + 1],
        arcX,
      );

      path.quadraticCurveTo(arcX, arcY, point.x, point.z);
    }
  });

  return path.getPoints();
}

const geometryTypes = {
  cuboid: 'cuboid',
  extrusion: 'extrusion',
  revolution: 'revolution',
  rebar: 'rebar',
  // sphere: 'sphere',
};

/**
 * Convert a 3D point array to a 2D point array in order to create a 2D shape for extrusion/rotation
 * @param { [{ x, y, z }] } profile
 * @returns { [x: number, z: number] }
 */
function getProfilePath(profile, yOffset = 0) {
  return profile.map(({ x, y, z }) => [x, z]);
}

/**
 * Generates a geometry for a bim parts based on its type
 * @param { string: geometryTypes } type - the geometry types
 * @param { object } params - the bim params for the  part
 * @returns { BufferGeometry | BufferGeometry[] }
 */
function generateGeometry(type, params) {
  switch (type) {
    case geometryTypes.extrusion: {
      const path = findExtrusionPath(params.profile);
      const shape = createPolyCurve(path);
      return createExtrudeGeometry(shape, params.length);
    }

    case geometryTypes.revolution: {
      const radialSegments = 32;
      const y = params.profile[0].y;
      const path = getProfilePath(params.profile, y);
      const shape = createPolyCurve(path);

      return new LatheGeometry(shape.getPoints(), radialSegments);
    }

    case geometryTypes.cuboid: {
      const { min_point: min, max_point: max } = params;

      const path = [
        [min.x, min.z],
        [min.x, max.z],
        [max.x, max.z],
        [max.x, min.z],
      ];

      const shape = createPolyCurve(path);

      return createExtrudeGeometry(shape, max.y);
    }

    case geometryTypes.rebar: {
      const bend = Bend({ path: params.path_bend_code });
      const pointTypeMap = {
        arcto: 'arc_end_point',
        lineto: 'polyline_point',
      };

      const commands = bend.commands().map((cmd) => ({
        type: pointTypeMap[cmd.type],
        x: cmd.params[0] / 1000,
        y: 0,
        z: cmd.params[1] / 1000,
      }));
      const radius = bend.instructions().find((inst) => inst.type === 'barRadius').radius / 1000;
      const path = findExtrusionPath(commands);
      const curve = createPolyCurve(path);
      const tubeGeometry = new TubeGeometry(curve, 100, radius, 24, false);
      const startCapGeometry = getCapGeometry(curve, 0, tubeGeometry);
      const endCapGeometry = getCapGeometry(curve, 1, tubeGeometry);

      return [tubeGeometry, startCapGeometry, endCapGeometry];
    }

    default:
      console.warn(`Geometry type: ${type} not found`);
      return null;

  }
}

/**
 * Generate a mesh for a given part
 * @param { string } name - the name to be assigned to the mesh object
 * @param { object } part - the bim part data
 * @param { Material } material
 * @param { number } translateX
 * @param { number } translateZ
 * @param { number } translateY
 * @param { object } rotation - rotation angles { alpha, beta, gamma }
 * @return { Mesh }
 */
function generateMesh(name, part, material, translateX, translateZ, translateY, rotation) {
  const geometry = generateGeometry(part.type, part);

  const hasMultipleGeometries = Array.isArray(geometry);
  const mainGeometry = hasMultipleGeometries ? geometry[0] : geometry;

  // Use BufferGeometry.translate rather than Object3d.position as
  // translate is better suited for one-time operations i.e. initial positioning
  mainGeometry.rotateY(rotation.alpha);
  mainGeometry.rotateX(rotation.beta);
  mainGeometry.rotateZ(rotation.gamma);
  mainGeometry.translate(translateX, translateZ, translateY);

  const mainMesh = new Mesh(mainGeometry, material);
  mainMesh.name = name;

  // If there are additional geometries then generate meshes for them and add them to the main mesh
  if (hasMultipleGeometries) {
    geometry.slice(1).forEach((geometryItem) => {
      geometryItem.rotateY(rotation.alpha);
      geometryItem.rotateX(rotation.beta);
      geometryItem.rotateZ(rotation.gamma);
      geometryItem.translate(translateX, translateZ, translateY);
      const meshItem = new Mesh(geometryItem, material);
      mainMesh.add(meshItem);
    });
  }

  return mainMesh;
}

/**
 * Generate meshes for specified parts
 * @param { array } parts -
 * @param { Material } material
 * @return { Mesh[] }
 */
function generateParts(parts, material) {
  return Object.keys(parts).map((key) => {
    const part = parts[key];

    const positions = [];
    if (Array.isArray(part.origin)) {
      part.origin.forEach(({ x, y, z, rotation }, i) => {
        const name = part.origin.length === 1 ? key : [key, i].join('_');
        positions.push(generateMesh(name, part, material, -x, z, y, rotation[0]));
      });
    } else {
      positions.push(
        generateMesh(key, part, material, -part.origin.x, part.origin.z, part.origin.y, part.origin.rotation),
      );
    }

    return positions;
  }).flat();
}

export default defineEntity({
  name: 'bim',
  parameters: {
    bimData: {
      default: {
        log: { high: ['box'] },
        parts: {
          box: {
            type: 'cuboid',
            min_point: { x: -0.0245, y: 0.0, z: -0.03 },
            max_point: { x: 0.0245, y: 0.3, z: 0.0 },
            origin: [
              {
                x: 0,
                y: 0,
                z: 0,
                rotation: [
                  { alpha: 1.5708, beta: 0, gamma: 0 },
                ],
              },
            ],
          },
        },
      },
    },
    log: { name: 'Log', default: 'high' },
    color: { name: 'Colour', type: 'color', default: '#6666cc' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
  },
  formatParams(params) {
    const { bimData, log } = params;

    const parts = bimData.log ? pick(bimData.parts, bimData.log[log]) : bimData.parts;

    return {
      ...params,
      bimData: {
        parts,
      },
    };
  },
  render(params) {
    const { bimData, color, opacity } = params;

    const material = createMaterial(color, opacity);
    const meshes = generateParts(bimData.parts, material);

    const obj3d = new Object3D();
    obj3d.add(...meshes);

    configureInteractivity(obj3d, params);

    return obj3d;
  },
});
