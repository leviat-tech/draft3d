<template>
  <div class="flex flex-col space-y-2 overflow-hidden">
    <quantity-input
      v-model="value[0]"
      label="Width"
      :parameter="param('x')"
    />
    <quantity-input
      v-model="value[1]"
      label="Height"
      :parameter="param('y')"
    />
    <quantity-input
      v-model="value[2]"
      label="Depth"
      :parameter="param('z')"
    />
  </div>
</template>

<script>
import QuantityInput from '@/components/inputs/QuantityInput.vue';


export default {
  name: 'TextInput',
  components: {
    QuantityInput,
  },
  props: {
    parameter: { type: Object, required: true },
    label: { type: String, default: null },
    modelValue: { type: Array, required: true },
  },
  data() {
    console.log(this.parameter);

    return {
      value: this.modelValue,
      focused: false,
    };
  },
  methods: {
    handleUpdate() {
      this.$emit('update:modelValue', this.value);
    },
    param(name) {
      return { name, precision: 0.1, default: 0 };
    },
  },
};
</script>
