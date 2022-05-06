const config = {
  three: {
    camera: {
      fov: 50,
      position: { x: 4, y: 4, z: 4 },
    },
    controls: {
      target: [0, 0, 0],
      panSpeed: 0.5,
      rotateSpeed: 0.5,
    },
    light: {
      intensity: 0.5,
      directionalLights: [
        [2, 3, 1],
        [-2, 3, -1],
      ],
    },
  },
}

export default config;