<template>
  <div class="fixed inset-0 divide-x flex">
    <div class="w-[630px] flex-none">
      <div ref="editorRef" class="h-full" @keydown="onKeydown" />
    </div>
    <div class="flex-1 relative">
      <div ref="viewportRef" class="absolute inset-0 overflow-hidden">
        <Entity
          v-if="scene"
          :params="{ bimData: json.bim }"
          entity="bim"
          :scene="scene"
        />
      </div>
    </div>
  </div>
</template>

<script setup>

import 'jsoneditor/dist/jsoneditor.min.css';
import JSONEditor from 'jsoneditor';
import { onMounted, ref } from 'vue';
import Entity from 'draft3d/components/Entity.vue';
import { ThreeScene } from 'draft3d';
import config from '@/config';
import cic from '../data/cic.json';


const bimConfig = {
  ...config.three,
  camera: {
    fov: 50,
    position: { x: 0.5, y: 0.5, z: 0.5 },
  },
};


const editorRef = ref(null);
const viewportRef = ref(null);
const json = ref(cic);
const scene = ref(null);

let editor;

function onChange(newJson) {
  try {
    json.value = JSON.parse(newJson);
  } catch (e) {
    console.log('Invalid JSON');
  }
}

function onKeydown(e) {
  if (e.key === 'v' && e.ctrlKey) {
    setTimeout(() => editor.format(), 100);
  }
}

const editorOptions = {
  mode: 'text',
  onChangeText: onChange,
};

onMounted(() => {
  editor = new JSONEditor(editorRef.value, editorOptions);
  editor.set(json.value);
  const sceneInstance = new ThreeScene(bimConfig);
  sceneInstance.initialize(viewportRef.value);
  scene.value = sceneInstance;
});

</script>
