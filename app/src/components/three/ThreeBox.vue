<template>
  <Entity :params="params" entity="Box" />

  <input v-model="params.dimensions[0]" />

</template>

<script setup>
import Entity from 'draft3d/components/Entity.vue'
import { reactive, watch } from 'vue';

const params = reactive({
  dimensions: [2, 3, 4],
  color: '#cc44aa',
})

</script>