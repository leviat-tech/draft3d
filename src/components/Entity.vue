<template>

</template>

<script setup>

const props = defineProps({
  entity: String,
  params: Object
})

import draft3d from 'draft3d'
import { watch } from 'vue';

const box = draft3d.entities[props.entity](props.params);

box.addTo(draft3d.scene)

watch(props.params, (newParams) => {
  console.log(newParams.dimensions[0]);
  box.updateParams(newParams)
})
</script>

<style scoped>

</style>