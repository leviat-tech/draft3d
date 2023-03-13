<template />

<script setup>


import draft3d from 'draft3d';
import { computed, ref, watch } from 'vue';
import { destroyObject } from '../utils/helpers';


const props = defineProps({
  entity: { type: String, default: '' },
  params: { type: Object, default: {} },
});

const params = computed(() => props.params);
const entityName = computed(() => props.entity);
let entity = draft3d.entities[props.entity](params);
entity.addTo(draft3d.scene);

watch(params, (newParams) => {
  entity.updateParams(newParams);
}, { deep: true });

watch(entityName, (name) => {
  destroyObject(entity.object3d);
  entity = draft3d.entities[name](props.params);
  entity.addTo(draft3d.scene);
});

</script>

<style scoped>

</style>
