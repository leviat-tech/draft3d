


const LayerSet = {
  layers: [{ id: 0, name:'default', visible: true }],
  cameras: [],

  addCamera(camera) {
    if (this.cameras.filter((c) => c.uuid === camera.uuid).length > 0) {
      console.log("LayerSet: Camera " + camera.uuid + " already added to layerset")
      return;
    }
    this.cameras.push(camera);
    this.applyToCameras();
  },

  addLayer(name) {
    if (this.layers.filter((l) => l.name === name).length > 0) {
      console.log("LayerSet: Layer named " + name + " already exists")
      return;
    }
    const newLayer = { id: this.layers.length, name, visible: false };
    this.layers.push(newLayer);
  },

  getLayerId(name) {
    return this.layers.filter((a) => a.name === name)[0]?.id;
  },

  addToLayer(name, object3d) {
    if (Array.isArray(object3d)) {
      object3d.forEach((o) => {
        o.layers.disableAll();
        o.layers.set(this.getLayerId(name));
      });
    } else {
      object3d.layers.disableAll();
      object3d.layers.set(this.getLayerId(name));
    }
  },

  getLayerNames() {
    return this.layers.map((l) => l.name);
  },

  show(name) {
    if (Array.isArray(name)) {
      this.layers.forEach((layer) => {
        if (name.includes(layer.name)) {
          layer.visible = true;
        }
      });
    } else {
      this.layers.forEach((layer) => {
        if (layer.name === name) {
          layer.visible = true;
        }
      });
    }
    this.applyToCameras();
  },

  showOnly(name) {
    if (Array.isArray(name)) {
      this.layers.forEach((layer) => {
        layer.visible = name.includes(layer.name);
      });
    } else {
      this.layers.forEach((layer) => {
        layer.visible = layer.name === name;
      });
    }
    this.applyToCameras();
  },

  hide(name) {
    if (Array.isArray(name)) {
      this.layers.forEach((layer) => {
        if (name.includes(layer.name)) {
          layer.visible = false;
        }
      });
    } else {
      this.layers.forEach((layer) => {
        if (layer.name === name) {
          layer.visible = false;
        }
      });
    }
    this.applyToCameras();
  },


  applyToCameras() {
    this.cameras.forEach((c) => c.layers.disableAll());
    this.cameras.forEach((c) => {
      this.layers.forEach((l) => {
        if (l.visible) {
          c.layers.enable(l.id);
        }
      });
    });
  },

  reset() {
    this.layers = [{ id: 0, name:'default', visible: true }];
    this.cameras = [];
  },
};

export default LayerSet;
