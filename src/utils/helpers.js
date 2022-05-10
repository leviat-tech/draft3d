export function destroyObject(object3d) {
  object3d.removeFromParent();
  object3d.material?.dispose();
  object3d.geometry?.dispose();
  object3d.children?.forEach(destroyObject);
}


export function castParameters(parametersConfig) {
  if (!parametersConfig) return {};

  return Object.entries(parametersConfig).reduce((parameters, [key, paramConfig]) => ({
    ...parameters,
    [key]: paramConfig.default,
  }), {});
}
