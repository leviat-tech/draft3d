import { each } from 'lodash-es';
import { LatheGeometry, Mesh, Object3D } from 'three';

import { configureInteractivity } from '../utils/helpers';
import { createMaterial, updateMaterial } from '../utils/material';
import { defineEntity } from '../defineEntity';
import { createExtrudeGeometry, createPolyCurve } from '../utils/geometry';


const partsTemp = {
  channel: {
    extrusion: [
      {
        profile: [
          { x: 0.019750, y: 0.00000, z: -0.02300, Type: 'polyline_point' },
          { x: 0.019750, y: 0.00000, z: 0.00000, Type: 'polyline_point' },
          { x: 0.009000, y: 0.00000, z: 0.00000, Type: 'polyline_point' },
          { x: 0.009000, y: 0.00000, z: -0.00500, Type: 'polyline_point' },
          { x: 0.01044, y: 0.00000, z: -0.00582, Type: 'arc_end_point' },
          { x: 0.01621, y: 0.00000, z: -0.00249, Type: 'polyline_point' },
          { x: 0.01735, y: 0.00000, z: -0.00315, Type: 'arc_end_point' },
          { x: 0.01735, y: 0.00000, z: -0.01959, Type: 'polyline_point' },
          { x: 0.01635, y: 0.00000, z: -0.020600, Type: 'arc_end_point' },
          { x: -0.01635, y: 0.00000, z: -0.020600, Type: 'polyline_point' },
          { x: -0.01735, y: 0.00000, z: -0.01959, Type: 'arc_end_point' },
          { x: -0.01735, y: 0.00000, z: -0.00315, Type: 'polyline_point' },
          { x: -0.01621, y: 0.00000, z: -0.00249, Type: 'arc_end_point' },
          { x: -0.01044, y: 0.00000, z: -0.00582, Type: 'polyline_point' },
          { x: -0.009000, y: 0.00000, z: -0.00500, Type: 'arc_end_point' },
          { x: -0.009000, y: 0.00000, z: 0.00000, Type: 'polyline_point' },
          { x: -0.019750, y: 0.00000, z: 0.00000, Type: 'polyline_point' },
          { x: -0.019750, y: 0.00000, z: -0.02300, Type: 'polyline_point' },
          { x: 0.019750, y: 0.00000, z: -0.02300, Type: 'polyline_point' },
        ],
        path: [
          { x: 0.00000, y: 0.00000, z: 0.00000, Type: 'polyline_point' },
          { x: 0.00000, y: 0.30000, z: 0.00000, Type: 'polyline_point' },
        ],
        length: 0.3,
        cutout: {},
        is_solid: true,
        origin: {
          x: 0,
          y: 0,
          z: 0,
          alpha: 0,
          beta: 0,
          gamma: 0,
        },
      },
    ],
  },
  anchors: {
    anchor_1: {
      revolution: [
        {
          profile: [
            { x: 0.00000, y: 0.02500, z: -0.02300, Type: 'polyline_point' },
            { x: 0.00000, y: 0.02500, z: -0.09320, Type: 'polyline_point' },
            { x: 0.01090, y: 0.02500, z: -0.09320, Type: 'polyline_point' },
            { x: 0.01090, y: 0.02500, z: -0.09100, Type: 'polyline_point' },
            { x: 0.01000, y: 0.02500, z: -0.09100, Type: 'polyline_point' },
            { x: 0.00500, y: 0.02500, z: -0.08820, Type: 'polyline_point' },
            { x: 0.00500, y: 0.02500, z: -0.02720, Type: 'polyline_point' },
            { x: 0.01235, y: 0.02500, z: -0.02300, Type: 'polyline_point' },
          ],
          cutout: {},
          axis_origin: { x: 0.00000, y: 0.02500, z: 0.00000 },
          axis_direction: [0, 0, 1],
          sweep_angle: 6.283185307,
          origin: {
            x: 0, y: 0.02500, z: 0, alpha: 0, beta: 0, gamma: 0,
          },
        },
      ],
    },
    anchor_2: {
      revolution: [
        {
          profile: [
            { x: 0.00000, y: 0.27500, z: -0.02300, Type: 'polyline_point' },
            { x: 0.00000, y: 0.27500, z: -0.09320, Type: 'polyline_point' },
            { x: 0.01090, y: 0.27500, z: -0.09320, Type: 'polyline_point' },
            { x: 0.01090, y: 0.27500, z: -0.09100, Type: 'polyline_point' },
            { x: 0.01000, y: 0.27500, z: -0.09100, Type: 'polyline_point' },
            { x: 0.00500, y: 0.27500, z: -0.08820, Type: 'polyline_point' },
            { x: 0.00500, y: 0.27500, z: -0.02720, Type: 'polyline_point' },
            { x: 0.01235, y: 0.27500, z: -0.02300, Type: 'polyline_point' },
          ],
          cutout: {},
          axis_origin: { x: 0.00000, y: 0.00000, z: 0.00000 },
          axis_direction: [0, 0, 1],
          sweep_angle: 6.283185307,
          origin: {
            x: 0, y: 0.27500, z: 0, alpha: 0, beta: 0, gamma: 0,
          },
        },
      ],
    },
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

function generateGeometry(type, params, elementName) {
  switch (type) {
    case geometryTypes.extrusion: {
      const path = getProfilePath(params.profile);
      const shape = createPolyCurve(path);

      const geometry = createExtrudeGeometry(shape, params.length);
      geometry.name = elementName;

      return geometry
        .translate(0, 0, params.origin.y);
    }

    case geometryTypes.revolution: {
      const y = params.profile[0].y;
      const path = getProfilePath(params.profile, y);
      const shape = createPolyCurve(path);

      const geometry = new LatheGeometry(shape.getPoints(), 32).translate(0, 0, params.origin.y);
      geometry.name = elementName;

      return geometry;
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

      const geometry = createExtrudeGeometry(shape, max.y);
      geometry.name = elementName;

      return geometry;
    }

    default:
      console.warn(`Geometry type: ${type} not found`);
      return null;

  }
}


function generatePartsGeometries(parts, rootElementName = '') {
  if (Array.isArray(parts)) return null;

  const geometries = [];

  each(parts, (part, name) => {
    if (name.match(/bounding_box/)) return null;

    const partGeometries = (name in geometryTypes)
      ? part.map((item) => generateGeometry(name, item, rootElementName))
      : generatePartsGeometries(part, name);

    if (partGeometries?.length) geometries.push(...partGeometries);
  });

  return geometries;
}


export default defineEntity({
  name: 'bim',
  parameters: {
    parts: { default: partsTemp },
    color: { name: 'Colour', type: 'color', default: '#6666cc' },
    opacity: { name: 'Opacity', type: 'number', precision: 0.05, default: 1 },
  },
  render(params) {
    const { parts, color, opacity } = params;

    const geometries = generatePartsGeometries(parts);
    const material = createMaterial(color, opacity);

    const meshes = geometries.map((geometry) => new Mesh(geometry, material));

    const obj3d = new Object3D();
    obj3d.add(...meshes);

    configureInteractivity(obj3d, params);

    return obj3d;
  },
  update(object3d, newParams) {
    object3d.clear();

    const { parts, color, opacity } = newParams;

    const geometries = generatePartsGeometries(parts);
    const material = createMaterial(color, opacity);

    const meshes = geometries.map((geometry) => new Mesh(geometry, material));

    object3d.add(...meshes);

    configureInteractivity(object3d, newParams);
  },
});
