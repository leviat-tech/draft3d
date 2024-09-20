import { Box3, Sphere } from 'three';
import BaseScene from './BaseScene';
import { createOrthographicCamera } from './utils/camera';


export default class StaticScene extends BaseScene {
  constructor(config) {
    super(config);
    const { camera } = config;

    this.camera = createOrthographicCamera(camera);
    this.renderer = this.createRenderer(this.canvas);
  }

  zoomToExtents(referenceObjectName = 'root') {
    const referenceObject = this.originalScene.getObjectByName(referenceObjectName);
    const boundingBox = new Box3().setFromObject(referenceObject);
    const boundingSphere = new Sphere();
    boundingBox.getBoundingSphere(boundingSphere);
    const { radius } = boundingSphere;

    Object.assign(this.camera, {
      left: -radius,
      right: radius,
      top: radius,
      bottom: -radius,
    });

    this.camera.lookAt(boundingSphere.center);
    this.camera.updateProjectionMatrix();
    this.render();
  }

  renderToImage(userOptions, width = 1200, height = 1200) {
    return super.renderToImage(userOptions, width, height);
  }
}
