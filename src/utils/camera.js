import {
  PerspectiveCamera,
  OrthographicCamera,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const defaultCameraConfig = {
  fov: 50,
  aspect: 1,
  near: 0.1,
  far: 1000,
};

export function createCamera(userCameraConfig = {}) {
  const cameraConfig = { ...defaultCameraConfig, ...userCameraConfig };
  const { fov, near, far, aspect, position } = cameraConfig;
  const camera = new PerspectiveCamera(fov, aspect, near, far);

  if (position) Object.assign(camera.position, position);

  return camera;
}

// Used only for 2d projections
export function createOrthographicCamera(cameraConfig) {
  const { position } = cameraConfig;

  const width = 20;
  const height = 20;
  const camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 100);
  if (position) Object.assign(camera.position, position);

  return camera;
}

function createControls(camera, canvas, userControlsConfig) {
  const controls = new OrbitControls(camera, canvas);
  const target = userControlsConfig.target || [0, 0, 0];

  controls.zoomToCursor = !!userControlsConfig?.zoomToCursor;

  controls.target.set(...target);
  controls.update();

  return controls;
}

export function freeControls(camera, canvas, userControlsConfig = {}) {
  const controls = createControls(camera, canvas, userControlsConfig);

  if (userControlsConfig.panSpeed) controls.panSpeed = userControlsConfig.panSpeed;
  if (userControlsConfig.rotateSpeed) controls.rotateSpeed = userControlsConfig.rotateSpeed;

  return controls;
}
