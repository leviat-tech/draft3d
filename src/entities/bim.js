import { LatheGeometry, Mesh, Object3D } from 'three';

import { configureInteractivity } from '../utils/helpers';
import { createMaterial } from '../utils/material';
import { defineEntity } from '../defineEntity';
import { createExtrudeGeometry, createPolyCurve } from '../utils/geometry';


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
        { x: 0.019, y: 0.15, z: -0.004, type: 'polyline_point' },
        { x: 0.015, y: 0.15, z: 0.0, type: 'arc_end_point' },
        { x: 0.015, y: 0.15, z: 0.0, type: 'polyline_point' },
        { x: 0.009, y: 0.15, z: 0.0, type: 'polyline_point' },
        { x: 0.009, y: 0.15, z: -0.003, type: 'polyline_point' },
        { x: 0.015, y: 0.15, z: -0.003, type: 'polyline_point' },
        { x: 0.016, y: 0.15, z: -0.004, type: 'arc_end_point' },
        { x: 0.016, y: 0.15, z: -0.0135, type: 'polyline_point' },
        { x: 0.015, y: 0.15, z: -0.0145, type: 'arc_end_point' },
        { x: -0.015, y: 0.15, z: -0.0145, type: 'polyline_point' },
        { x: -0.016, y: 0.15, z: -0.0135, type: 'arc_end_point' },
        { x: -0.016, y: 0.15, z: -0.004, type: 'polyline_point' },
        { x: -0.015, y: 0.15, z: -0.003, type: 'arc_end_point' },
        { x: -0.015, y: 0.15, z: -0.003, type: 'polyline_point' },
        { x: -0.009, y: 0.15, z: -0.003, type: 'polyline_point' },
        { x: -0.009, y: 0.15, z: 0.0, type: 'polyline_point' },
        { x: -0.015, y: 0.15, z: 0.0, type: 'polyline_point' },
        { x: -0.019, y: 0.15, z: -0.004, type: 'arc_end_point' },
        { x: -0.019, y: 0.15, z: -0.0135, type: 'polyline_point' },
        { x: -0.015, y: 0.15, z: -0.0175, type: 'arc_end_point' },
        { x: 0.015, y: 0.15, z: -0.0175, type: 'polyline_point' },
        { x: 0.019, y: 0.15, z: -0.0135, type: 'arc_end_point' },
        { x: 0.019, y: 0.15, z: -0.0135, type: 'polyline_point' },
        { x: 0.019, y: 0.15, z: -0.004, type: 'polyline_point' },
      ],
      path: [
        { x: 0.00000, y: 0.00000, z: 0.00000, type: 'polyline_point' },
        { x: 0.00000, y: 0.30000, z: 0.00000, type: 'polyline_point' },
      ],
      length: 0.3,
      cutout: {},
      origin: {
        x: 0, y: 0, z: 0, alpha: 0, beta: 0, gamma: 0,
      },
    },
    anchors: {
      type: 'revolution',
      profile: [
        { x: 0.0, y: 0.0, z: -0.0809, type: 'polyline_point' },
        { x: 0.00984, y: 0.0, z: -0.0809, type: 'polyline_point' },
        { x: 0.00984, y: 0.0, z: -0.079, type: 'polyline_point' },
        { x: 0.008, y: 0.0, z: -0.079, type: 'polyline_point' },
        { x: 0.004, y: 0.0, z: -0.07687, type: 'polyline_point' },
        { x: 0.004, y: 0.0, z: -0.0245, type: 'polyline_point' },
        { x: 0.00538, y: 0.0, z: -0.0215, type: 'polyline_point' },
        { x: 0.013, y: 0.0, z: -0.0175, type: 'polyline_point' },
        { x: 0.0, y: 0.0, z: -0.0175, type: 'polyline_point' },
        { x: 0.0, y: 0.0, z: -0.0809, type: 'polyline_point' },
      ],
      axis_origin: { x: 0.00000, y: 0.00000, z: 0.00000 },
      axis_direction: [0, 0, 1],
      sweep_angle: 6.283185307,
      cutout: {},
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
    channel_bounding_box: {
      type: 'cuboid',
      min_point: { x: -0.019, y: 0.00000, z: -0.01800 },
      max_point: { x: 0.019, y: 0.30000, z: 0.00000 },
      origin: [
        {
          x: 0, y: 0, z: 0, alpha: 0, beta: 0, gamma: 0,
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
      const path = getProfilePath(params.profile);
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

    const filteredParts = Object.fromEntries(
      Object.entries(bimData.parts).filter(([key]) => bimData.log[params.log].includes(key)),
    );

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
