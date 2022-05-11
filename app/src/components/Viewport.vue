<template>
  <div ref="el" class="viewport z-10">
    <Entity v-if="entity" :key="entity?.name" :params="params" :entity="entity" />

    <div class="absolute z-10 border-r border-b">
      <ThreeDevTools :scene="scene" class="pr-4" />


      <div class="w-48">
        <router-link v-for="i in entities"
                     :to="`/entity/${i.name}`"
                     class="py-2 px-4 block border-t"
        >
          {{ i.name }}
        </router-link>
      </div>
    </div>

    <div class="absolute right-0 top-0 px-4 w-[280px] z-10 border-b border-l bg-white">
      <parameter-list v-if="entity" :name="entity" :parameters="parameterConfig" @update="onUpdate" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';

import * as entities from 'draft3d/entities';
import { initializeScene } from 'draft3d';
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


onMounted(() => {
  scene.value = initializeScene(el.value, config.three);
});

const onUpdate = (val) => {
  params.value = val;
};

watch(entity, (newEntity) => {
  parameterConfig.value = entities[newEntity].parameters;
  params.value = castParameters(parameterConfig.value);
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
