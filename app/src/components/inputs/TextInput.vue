<template>
  <div
    class="input-container"
    :class="{ focused }"
  >
    <div v-if="label" class="label">
      {{ label }}
    </div>
    <input
      v-model="value"
      class="input"
      :type="type"
      placeholder="Enter a value"
      @input="handleUpdate"
      @blur="focused = false"
      @focus="focused = true"
    >
  </div>
</template>

<script>
export default {
  name: 'TextInput',
  props: {
    parameter: { type: Object, required: true },
    type: { type: String, default: 'text' },
    label: { type: String, default: null },
    modelValue: { type: String, required: true },
  },
  data() {
    return {
      value: this.modelValue,
      focused: false,
    };
  },
  methods: {
    handleUpdate() {
      this.$emit('update:modelValue', this.value);
    },
  },
};
</script>
