
import {
  PerspectiveCamera,
  OrthographicCamera,
  Box3,
  Sphere,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const defaultCameraConfig = {
  fov: 50,
  aspect: 1,
  near: 0.1,
  far: 1000,
};

export function createCamera(userCameraConfig) {
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

  controls.target.set(...target);
  controls.update();

  return controls;
}

export function planControls(camera, canvas, userControlsConfig) {
  const controls = createControls(camera, canvas, userControlsConfig);
  controls.enableRotate = false;
  return controls;
}

export function freeControls(camera, canvas, userControlsConfig) {
  const controls = createControls(camera, canvas, userControlsConfig);

  if (userControlsConfig.panSpeed) controls.panSpeed = userControlsConfig.panSpeed;
  if (userControlsConfig.rotateSpeed) controls.rotateSpeed = userControlsConfig.rotateSpeed;

  return controls;
}

export function calculateFreeView(camera, content) {
  const boundingBox = new Box3().setFromObject(content);
  const boundingSphere = new Sphere();
  boundingBox.getBoundingSphere(boundingSphere);

  const center = boundingSphere.center;
  const margin = 1.1;
  const radius = boundingSphere.radius * margin;
  const ratio = Math.min(window.devicePixelRatio, 2);

  camera.position.set(center.x + radius, center.y + radius, center.z + radius);
  camera.lookat(center);

}

export function calculatePlanView(camera, content, viewFrom) {
  const boundingBox = new Box3().setFromObject(content);
  const boundingSphere = new Sphere();
  boundingBox.getBoundingSphere(boundingSphere);

  const center = boundingSphere.center;
  const margin = 1.1;
  const radius = boundingSphere.radius * margin;
  const ratio = Math.min(window.devicePixelRatio, 2);

  const yfactor = 1.704;
  const lens_distance = 1;

  const frustrum = {
    left: radius * -ratio,
    right: radius * ratio,
    top: radius * ratio / yfactor,
    bottom: radius * -ratio / yfactor,
    near: lens_distance,
    far: lens_distance + radius * 2,
  };
  Object.assign(camera, frustrum);

  if (viewFrom === 'x') {
    camera.position.set(center.x - 2 * radius - lens_distance, center.y);
  } else if (viewFrom === 'y') {
    camera.position.set(center.x, center.y + radius + lens_distance, center.z);
  } else {
    camera.position.set(center.x, center.y, center.z + 2 * radius + lens_distance);
  }

  camera.lookAt(center);
  camera.updateProjectionMatrix();
}
