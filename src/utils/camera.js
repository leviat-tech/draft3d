
import {
  PerspectiveCamera,
  OrthographicCamera,
} from 'three';


export function createCamera(cameraConfig) {
  const { fov, position } = cameraConfig;
  const camera = new PerspectiveCamera(fov, position);
  if (position) Object.assign(camera.position, position);
  return camera;
}

// Used only for 2d projections
export function createOrthographicCamera(cameraConfig) {
  const { fov, position } = cameraConfig;

  const width = 20;
  const height = 20;
  const camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 30);
  if (position) Object.assign(camera.position, position);

  return camera;
}
