<script setup>
const props = defineProps({
  bonus_status: {
    type: Number,
    required: true,
  },
})

const getStatusValue = (status) => {
  switch (status) {
  case 0:
    return 'Bonus Requested'
  case 1:
    return 'On Hold'
  case 2:
    return 'Bonus Rejected'
  case 3:
    return 'Bonus Approved'
  case 4:
    return 'Bonus not Requested'
  default:
    return 'Unknown'
  }
}

const getStatusColor = (status) => {
  switch (status) {
  case 0:
    return 'primary'
  case 1:
    return 'warning'
  case 2:
    return 'error'
  case 3:
    return 'success'
  case 4:
    return 'secondary'
  default:
    return 'Unknown'
  }
}
</script>

<template>
  <VChip
    label
    :color="getStatusColor(bonus_status)"
    size="small"
  >
    {{ getStatusValue(bonus_status) }}
  </VChip>
</template>

<style scoped lang="scss">
</style>
