<template />

<script setup>


import draft3d from 'draft3d';
import { computed, onMounted, ref, watch } from 'vue';
import { cloneDeep } from 'lodash-es';
import { destroyObject } from '../utils/helpers';


const props = defineProps({
  scene: { type: Object, default: {} },
  entity: { type: String, default: '' },
  params: { type: Object, default: {} },
});

const params = computed(() => cloneDeep(props.params));
const entityName = computed(() => props.entity);
let entity;

function createEntity() {
  entity = draft3d.entities[props.entity](params.value, props.scene.layerSet);
  entity.addTo(props.scene);
}


watch(params, (val) => {
  const newParams = cloneDeep(val);
  entity?.updateParams(newParams);
  console.log(entity);
  entity.addTo(props.scene);
}, { deep: true });

watch(entityName, () => {
  if (entity) destroyObject(entity.object3d);
  createEntity();
}, { immediate: true });

</script>

<style scoped>

</style>
