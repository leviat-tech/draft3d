
import {
  PerspectiveCamera,
  OrthographicCamera,
  Box3,
  Vector3,
  Sphere,
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


export function calculatePlanView(camera, content, viewFrom)
{
  const boundingBox = new Box3().setFromObject(content);
  const boundingSphere = new Sphere();
  boundingBox.getBoundingSphere(boundingSphere);

  const center = boundingSphere.center;
  const margin = 1.1;
  const radius = boundingSphere.radius * margin;
  const ratio = Math.min(window.devicePixelRatio, 2);

  const yfactor = 1.704;
  const lens_distance = 1;

  //todo adjust based on angle viewed from
  const frustrum = {
    left:radius * -ratio,
    right:radius * ratio,
    top:radius * ratio / yfactor,
    bottom:radius * -ratio / yfactor,
    near:lens_distance,
    far:lens_distance + radius * 2 ,
  }
  Object.assign(camera, frustrum);

  if (viewFrom == 'x') {
    camera.position.set(center.x - 2 * radius - lens_distance, center.y);
  }
  else if (viewFrom == 'y') {
    camera.position.set(center.x, center.y + radius + lens_distance, center.z);
  }
  else {
    camera.position.set(center.x, center.y, center.z + 2 * radius + lens_distance);
  }

  camera.lookAt(center);
  camera.updateProjectionMatrix();
}