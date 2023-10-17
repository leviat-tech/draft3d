import { each } from 'lodash-es';
import { LatheGeometry, Mesh, Object3D } from 'three';
import json from '../../app/src/data/example2.json';

import { configureInteractivity } from '../utils/helpers';
import { createMaterial, updateMaterial } from '../utils/material';
import { defineEntity } from '../defineEntity';
import { createExtrudeGeometry, createPolyCurve } from '../utils/geometry';


const geometryTypes = {
  extrusion: 'extrusion',
  revolution: 'revolution',
  // cuboid: 'cuboid',
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
      const y = params.profile[0].y;
      const path = getProfilePath(params.profile, y);
      const shape = createPolyCurve(path);
      return new LatheGeometry(shape.getPoints(), 32).translate(0, 0, y);
    }

    default:
      console.warn(`Geometry type: ${type} not found`);
      return null;

  }
}


function generatePartsGeometries(parts) {
  if (Array.isArray(parts)) return null;

  const geometries = [];

  each(parts, (part, name) => {
    if (name.match(/bounding_box/)) return null;

    const partGeometries = (name in geometryTypes)
      ? part.map((item) => generateGeometry(name, item))
      : generatePartsGeometries(part);

    if (partGeometries?.length) geometries.push(...partGeometries);
  });

  return geometries;
}


export default defineEntity({
  name: 'bim',
  parameters: {
    parts: { default: json[0].bim.parts },
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
    console.log(this.render);

    object3d.clear();

    const { parts, color, opacity } = newParams;

    const geometries = generatePartsGeometries(parts);
    const material = createMaterial(color, opacity);

    const meshes = geometries.map((geometry) => new Mesh(geometry, material));

    object3d.add(...meshes);

    configureInteractivity(object3d, newParams);
  },
});
