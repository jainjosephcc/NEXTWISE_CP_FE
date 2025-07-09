<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['click'])
</script>
<template>
  <IconBtn
    :variant="variant"
    :color="color"
    class="rounded"
    size="32"
    @click="$emit('click')"
  ><VIcon :icon="icon" size="20" />
  </IconBtn>
</template>
