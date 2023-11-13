import { pick } from 'lodash-es';

import { LatheGeometry, Mesh, Object3D, Path } from 'three';

import { configureInteractivity } from '../utils/helpers';
import { createMaterial } from '../utils/material';
import { defineEntity } from '../defineEntity';
import { createExtrudeGeometry, createPolyCurve } from '../utils/geometry';


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
        sortedProfile[index + 1],
      );

      const arcY = getArcY(
        sortedProfile[index - 2],
        sortedProfile[index - 1],
        sortedProfile[index],
        sortedProfile[index + 1],
        arcX,
      );

      path.quadraticCurveTo(arcX, arcY, point.x, point.z);
    }
  });

  return path.getPoints();
}

const defaultBim = {
  insertion_points: {
    insertion_box: {
      type: 'cuboid',
      min_point: { x: -0.019, y: 0.0, z: -0.081 },
      max_point: { x: 0.019, y: 0.3, z: 0.0 },
    },
    available_points: {
      z_min: {
        y_min: { x_min: false, x_mid: false, x_max: false },
        y_mid: { x_min: false, x_mid: false, x_max: false },
        y_max: { x_min: false, x_mid: false, x_max: false },
      },
      z_mid: {
        y_min: { x_min: false, x_mid: false, x_max: false },
        y_mid: { x_min: false, x_mid: false, x_max: false },
        y_max: { x_min: false, x_mid: false, x_max: false },
      },
      z_max: {
        y_min: { x_min: true, x_mid: true, x_max: true },
        y_mid: { x_min: false, x_mid: false, x_max: false },
        y_max: { x_min: true, x_mid: true, x_max: true },
      },
      default_point: ['z_max', 'y_min', 'x_mid'],
    },
  },
  parts: {
    channel: {
      type: 'extrusion',
      profile: [
        { x: 0.0245, y: 0.15, z: -0.03, type: 'polyline_point' },
        { x: 0.0245, y: 0.15, z: 0.0, type: 'polyline_point' },
        { x: 0.01048, y: 0.15, z: 0.0, type: 'polyline_point' },
        {
          x: 0.01048,
          y: 0.15,
          z: -0.00652,
          type: 'polyline_point',
        },
        { x: 0.01207, y: 0.15, z: -0.00774, type: 'arc_end_point' },
        { x: 0.01959, y: 0.15, z: -0.0034, type: 'polyline_point' },
        { x: 0.02137, y: 0.15, z: -0.00432, type: 'arc_end_point' },
        {
          x: 0.02137,
          y: 0.15,
          z: -0.02557,
          type: 'polyline_point',
        },
        { x: 0.02007, y: 0.15, z: -0.02687, type: 'arc_end_point' },
        {
          x: -0.02007,
          y: 0.15,
          z: -0.02687,
          type: 'polyline_point',
        },
        {
          x: -0.02137,
          y: 0.15,
          z: -0.02557,
          type: 'arc_end_point',
        },
        {
          x: -0.02137,
          y: 0.15,
          z: -0.00432,
          type: 'polyline_point',
        },
        { x: -0.01959, y: 0.15, z: -0.0034, type: 'arc_end_point' },
        {
          x: -0.01207,
          y: 0.15,
          z: -0.00774,
          type: 'polyline_point',
        },
        {
          x: -0.01048,
          y: 0.15,
          z: -0.00652,
          type: 'arc_end_point',
        },
        {
          x: -0.01048,
          y: 0.15,
          z: -0.00652,
          type: 'polyline_point',
        },
        { x: -0.01048, y: 0.15, z: 0.0, type: 'polyline_point' },
        { x: -0.0245, y: 0.15, z: 0.0, type: 'polyline_point' },
        { x: -0.0245, y: 0.15, z: -0.03, type: 'polyline_point' },
        { x: 0.0245, y: 0.15, z: -0.03, type: 'polyline_point' },
      ],
      path: [
        { x: 0.0, y: 0.0, z: 0.0, type: 'polyline_point' },
        { x: 0.0, y: 0.3, z: 0.0, type: 'polyline_point' },
      ],
      length: 0.3,
      cutout: {},
      origin: {
        x: 0,
        y: 0,
        z: 0,
        alpha: 0,
        beta: 0,
        gamma: 0,
      },
    },
    anchors: {
      type: 'revolution',
      profile: [
        { x: 0.01235, y: 0.0, z: -0.03, type: 'polyline_point' },
        { x: 0.005, y: 0.0, z: -0.0342, type: 'polyline_point' },
        { x: 0.005, y: 0.0, z: -0.107, type: 'polyline_point' },
        { x: 0.01, y: 0.0, z: -0.1098, type: 'polyline_point' },
        { x: 0.0109, y: 0.0, z: -0.1098, type: 'polyline_point' },
        { x: 0.0109, y: 0.0, z: -0.112, type: 'polyline_point' },
        { x: 0.0, y: 0.0, z: -0.112, type: 'polyline_point' },
        { x: 0.0, y: 0.0, z: -0.03, type: 'polyline_point' },
        { x: 0.01235, y: 0.0, z: -0.03, type: 'polyline_point' },
      ],
      axis_origin: { x: 0.0, y: 0.0, z: 0.0 },
      axis_direction: [0, 0, 1],
      sweep_angle: 6.283185307,
      cutout: {},
      origin: [
        {
          x: 0, y: 0.035, z: 0, alpha: 0, beta: 0, gamma: 0,
        },
        {
          x: 0, y: 0.265, z: 0, alpha: 0, beta: 0, gamma: 0,
        },
      ],
    },
    channel_bounding_box: {
      type: 'cuboid',
      min_point: { x: -0.0245, y: 0.0, z: -0.03 },
      max_point: { x: 0.0245, y: 0.3, z: 0.0 },
      origin: [
        {
          x: 0, y: 0, z: 0, alpha: 0, beta: 0, gamma: 0,
        },
      ],
    },
    anchors_bounding_box: {
      type: 'cuboid',
      min_point: { x: -0.01235, y: -0.01235, z: -0.03 },
      max_point: { x: 0.01235, y: 0.01235, z: -0.0112 },
      origin: [
        {
          x: 0, y: 0.035, z: 0, alpha: 0, beta: 0, gamma: 0,
        },
        {
          x: 0, y: 0.265, z: 0, alpha: 0, beta: 0, gamma: 0,
        },
      ],
    },
    anchors_bounding_box: {
      type: 'cuboid',
      min_point: { x: -0.019, y: 0.0, z: -0.01800 },
      max_point: { x: 0.019, y: 0.0, z: -0.08100 },
      origin: [
        {
          x: 0, y: 0.025, z: 0, alpha: 0, beta: 0, gamma: 0,
        },
        {
          x: 0, y: 0.150, z: 0, alpha: 0, beta: 0, gamma: 0,
        },
        {
          x: 0, y: 0.275, z: 0, alpha: 0, beta: 0, gamma: 0,
        },
      ],
    },
  },
  log: {
    high: [
      'channel',
      'anchors',
    ],
    medium: [
      'channel_bounding_box',
      'anchors_bounding_box',
    ],
    low: [
      'channel_bounding_box',
      'anchors_bounding_box',
    ],
  },
  styles: {
    common: ['bounding_box', 'channel_bounding_box', 'anchors_bounding_box'],
    steel: ['channel', 'anchors'],
  },
  classification: {
    uniclass2015_code: 'Pr_20_85_84_84',
    uniclass2015_description: 'Stainless steel cast-in channels',
    omniclass_code: '23-13 23 11 17',
    omniclass_description: 'Mechanical Fasteners for Metal Structures',
    ifc_export_as: 'IfcMechanicalFastener',
    ifc_export_type: '',
    ifc_description: '',
  },
  log: {
    high: [
      'channel',
      'anchors',
    ],
    medium: [
      'channel_bounding_box',
      'anchors_bounding_box',
    ],
    low: [
      'channel_bounding_box',
      'anchors_bounding_box',
    ],
  },
  styles: {
    common: ['bounding_box', 'channel_bounding_box', 'anchors_bounding_box'],
    steel: ['channel', 'anchors'],
  },
  classification: {
    uniclass2015_code: 'Pr_20_85_84_84',
    uniclass2015_description: 'Stainless steel cast-in channels',
    omniclass_code: '23-13 23 11 17',
    omniclass_description: 'Mechanical Fasteners for Metal Structures',
    ifc_export_as: 'IfcMechanicalFastener',
    ifc_export_type: '',
    ifc_description: '',
  },
};

const geometryTypes = {
  cuboid: 'cuboid',
  extrusion: 'extrusion',
  revolution: 'revolution',
  // sphere: 'sphere',
};

/**
 * Convert a 3D point array to a 2D point array in order to create a 2D shape for extrusion/rotation
 * @param profile
 */
function getProfilePath(profile, yOffset = 0) {
  return profile.map(({ x, y, z }) => [x, z]);
}

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

    default:
      console.warn(`Geometry type: ${type} not found`);
      return null;

  }
}

function generatePartsGeometries(parts) {
  return Object.keys(parts).map((key) => {
    const part = parts[key];

    const positions = [];
    if (Array.isArray(part.origin)) {
      part.origin.forEach(({ y }) => {
        positions.push({
          geometry: generateGeometry(part.type, part).translate(0, 0, y),
          name: key,
        });
      });
    } else {
      positions.push({
        geometry: generateGeometry(part.type, part).translate(0, 0, part.origin.y),
        name: key,
      });

    }

    return positions;
  }).flat();
}

export default defineEntity({
  name: 'bim',
  parameters: {
    bimData: { default: defaultBim },
    log: { name: 'Log', default: 'high' },
    color: { name: 'Colour', type: 'color', default: '#6666cc' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
  },
  render(params) {
    const { bimData, color, opacity } = params;

    const filteredParts = pick(bimData.parts, bimData.log[params.log]);

    const geometries = generatePartsGeometries(filteredParts);
    const material = createMaterial(color, opacity);

    const meshes = geometries.map(({ name, geometry }) => {
      const mesh = new Mesh(geometry, material);

      mesh.name = name;

      return mesh;
    });

    const obj3d = new Object3D();
    obj3d.add(...meshes);

    configureInteractivity(obj3d, params);

    return obj3d;
  },
});
