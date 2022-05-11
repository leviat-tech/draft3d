<template>
  <div class="sidebar-section">
    <h2>Parameters</h2>
    <div v-if="parameters">
      <parameter-input
        v-for="(p, i) in parameters"
        :key="name + i"
        v-model="localOverrides[i]"
        :parameter="p"
      />
    </div>
    <div v-else class="sidebar-list-item no-content">
      There are no defined parameters
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { castParameters } from 'draft3d/utils/helpers';
import ParameterInput from './ParameterInput.vue';


export default {
  name: 'ParameterList',
  components: {
    ParameterInput,
  },
  props: {
    name: { type: String, default: 'p' },
    parameters: { type: Object, default: {} },
  },
  data() {
    return {
      localOverrides: this.parameters,
    };
  },
  watch: {
    parameters: {
      immediate: true,
      handler(newVal) {
        this.localOverrides = newVal ? castParameters(newVal) : [];
      },
    },
    localOverrides: {
      deep: true,
      handler(newVal) {
        this.$emit('update', newVal);
      },
    },
  },
};
</script>
