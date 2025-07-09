<script setup>
const props = defineProps({
  color: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: Number,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  stat: {
    type: String,
    required: true,
  },
  change: {
    type: Number,
    required: true,
  },
});
const roundedChange = computed(() => {
  return props.change.toFixed(2);
});
</script>

<template>
  <VCard>
    <VCardText>
      <VAvatar
        :color="color"
        variant="tonal"
        rounded
        size="44"
      >
        <VIcon
          :icon="icon"
          size="28"
        />
      </VAvatar>

      <h5 class="text-h5 mt-3">
        {{ title }}
      </h5>
      <p class="my-1">
        {{ subtitle }}
      </p>
      <p class="mb-3 text-high-emphasis">
        {{ stat }}
      </p>
      <VChip
        :color=" color"
        label
        size="small"
      >
        {{ roundedChange }}%
      </VChip>
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>
