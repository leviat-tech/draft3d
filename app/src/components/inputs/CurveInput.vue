<template>
  <div class="grid grid-cols-2 py-0.5">
    <quantity-input
      v-model="value[0]"
      label="x"
      :parameter="parameter"
    />
    <quantity-input
      v-model="value[1]"
      label="y"
      :parameter="parameter"
    />
    <quantity-input
      v-model="value[2]"
      :label="getLabeL"
      :parameter="parameter"
    />
    <quantity-input v-if="value.length===4"
                    v-model="value[3]"
                    label="cy"
                    :parameter="parameter"
    />
  </div>
</template>

<script>
import QuantityInput from './QuantityInput.vue';


export default {
  name: 'CurveInput',
  components: {
    QuantityInput,
  },
  props: {
    parameter: { type: Object, required: true },
    modelValue: { type: Array, required: true },
  },
  data() {
    return {
      value: this.modelValue,
    };
  },
  computed: {
    getLabeL() {
      return this.value.length > 3 ? 'cx' : 'b';
    },
  },
  watch: {
    value: {
      deep: true,
      handler() {
        this.$emit('update:modelValue', this.value);
      },
    },
  },
};
</script>
