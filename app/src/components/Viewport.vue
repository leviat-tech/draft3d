<template>
  <div ref="el" class="viewport z-10">
    <Entity
      v-if="entity"
      :key="entity?.name"
      :params="params"
      :entity="entity"
    />

    <div class="absolute z-10 border-r border-b">
      <ThreeDevTools :scene="scene" class="pr-4" />

      <div class="w-48">
        <router-link
          v-for="i in entities"
          :to="`/entity/${i.config.name}`"
          class="py-2 px-4 block border-t"
        >
          {{ i.config.name }}
        </router-link>
      </div>

      <div v-if="entity === 'bim'">
        <input type="file" @change="onFileChange">
      </div>
    </div>

    <div
      class="absolute right-0 top-0 px-4 w-[280px] z-10 border-b border-l bg-white"
    >
      <parameter-list
        v-if="entity"
        :name="entity"
        :parameters="filteredParameters"
        @update="onUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';

import draft3d, { initializeScene } from 'draft3d';
import Entity from 'draft3d/components/Entity.vue';
import ThreeDevTools from 'draft3d/components/ThreeDevTools.vue';

import { castParameters } from 'draft3d/utils/helpers';

import config from '@/config';
import ParameterList from '@/components/sidebar/ParametersList.vue';


const route = useRoute();

const entity = computed(() => route.params.entity);
const parameterConfig = ref(entity.value?.parameters);
const params = ref(castParameters(parameterConfig.value));

const el = ref(null);
const scene = ref(null);
const entities = draft3d.entities;

onMounted(() => {
  scene.value = initializeScene(el.value, config.three);
});

const onUpdate = (val) => {
  params.value = val;
};

const filteredParameters = computed(() => {
  const paramsToOmit = [
    'layer',
    'onClick',
    'onDbClick',
    'onMouseOut',
    'onMouseOver',
  ];

  return Object.fromEntries(
    Object.entries(parameterConfig.value).filter(([key]) => !paramsToOmit.includes(key)),
  );
});

watch(entity, (newEntity) => {
  parameterConfig.value = entities[newEntity].config.parameters;
  params.value = castParameters(parameterConfig.value);
});

function onFileChange(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const json = JSON.parse(e.target.result);
    const parts = json[0].bim.parts;
    params.value.parts = json[0].bim.parts;
  };

  // Read in the image file as a data URL.
  reader.readAsText(file);
}
</script>

<style lang="scss">
.viewport {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}
</style>
