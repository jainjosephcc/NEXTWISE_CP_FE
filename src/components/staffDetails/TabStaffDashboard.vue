<script setup>
import { defineProps } from "vue"
const props = defineProps({
  staffId: {
    type: Number,
    required: true,
  },
});
</script>
<template>
  <VRow>
    <VCol>
      <PerformanceStatisticsCard :staff-id="parseInt(props.staffId)" class="mb-5"/>
      <DepositWithdrawStatistics :staff-id="parseInt(props.staffId)"/>
    </VCol>
  </VRow>
</template>

<style scoped lang="scss">

</style>
