<template>
  <div ref="el" class="viewport z-10">
    <div class="flex items-center relative z-10">
      <ThreeDevTools :scene="scene" />

      <ThreeBox />

      <div class="flex items-center ml-4">
        <router-link to="/entity/box">Box</router-link>
      </div>
    </div>

  </div>
</template>+

<script setup>
import draft3d from 'draft3d';
import ThreeDevTools from 'draft3d/components/ThreeDevTools.vue';
import { onMounted, computed, ref } from 'vue';
import config from '@/config';
import ThreeBox from '@/components/three/ThreeBox.vue';


const el = ref(null);
const scene = ref(null);

onMounted(() => {
  scene.value = draft3d.initializeScene(el.value, config.three);
});

</script>

<style lang="scss">
.viewport {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}

</style>
