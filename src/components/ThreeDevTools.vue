<template>
  <div class="z-10 flex items-center">

    <div class="flex items-center">
      <label for="input__helpers" class="p-2">Show helpers</label>
      <input id="input__helpers" v-model="showHelpers" type="checkbox">
    </div>

  </div>
</template>

<script>
import {
  AxesHelper,
  GridHelper
} from 'three';

export default {
  name: 'ThreeDevTools',
  props: {
    scene: Object
  },
  data() {
    return {
      showHelpers: false
    }
  },
  methods: {
    createHelpers() {
      const axes = new AxesHelper(1);
      this.scene.add(axes);

      const grid = new GridHelper(10, 50);
      this.scene.add(grid);

      this.helpers = [axes, grid];
    },
    destroyHelpers() {
      this.helpers.forEach((obj) => obj.removeFromParent());
    },
  },
  watch: {
    showHelpers(val) {
      val ? this.createHelpers() : this.destroyHelpers();
    },
  }
}
</script>

<style scoped>

</style>
