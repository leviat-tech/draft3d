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

export function setInteractivity(element, params) {
  element.isInteractive = !!params?.isInteractive;

  element.onClick = (e) => params.onClick(e);
  element.onDbClick = (e) => params.onDbClick(e);
  element.onMouseOut = (e) => params.onMouseOut(e);
  element.onMouseOver = (e) => params.onMouseOver(e);
}

export function configureElement(element, params) {
  const configure = (el) => {
    setInteractivity(el, params);

    el.layerName = params?.layer || null;
  };

  if (Array.isArray(element)) {
    element.forEach((el) => { configure(el); });
  } else {
    configure(element);
  }
}

