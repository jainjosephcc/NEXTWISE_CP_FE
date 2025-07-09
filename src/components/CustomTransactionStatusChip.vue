<script setup>
const props = defineProps({
  trans_status: {
    type: Number,
    required: true,
  },
})

const getStatusValue = (status) => {
  switch (status) {
  case 0:
    return 'Pending';
  case 1:
    return 'On Hold';
  case 2:
    return 'Rejected';
  case 3:
    return 'Success';
  default:
    return 'Unknown';
  }
}

const getStatusColor = (status) => {
  switch (status) {
  case 0:
    return 'secondary';
  case 1:
    return 'warning';
  case 2:
    return 'error';
  case 3:
    return 'success';
  default:
    return 'Unknown';
  }
}
</script>

<template>
  <VChip
    label
    :color="getStatusColor(trans_status)"
    size="small"
  >
    {{ getStatusValue(trans_status) }}
  </VChip>
</template>

<style scoped lang="scss">
</style>
