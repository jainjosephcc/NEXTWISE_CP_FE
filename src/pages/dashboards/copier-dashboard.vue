<script setup>
import AnalyticsWebsiteAnalytics from '@/views/dashboards/analytics/AnalyticsWebsiteAnalytics.vue'
import MasterTreeComponent from "@/views/dashboards/MasterSlavesDiagrams/MasterTreeComponent.vue"
</script>

<template>
  <VRow class="match-height">
    <!-- 👉 Website analytics -->
    <VCol cols="12" md="6">
      <!--      <AnalyticsWebsiteAnalytics/>-->
    </VCol>

    <!-- 👉 MAster Slave detials -->
    <!--    <VCol cols="12" md="6" sm="6">
          <MasterSlavedetails/>
        </VCol>-->


    <VCol cols="12">
      <div style="width: 800px; height: 800px;">
        <MasterTreeComponent/>
      </div>

    </VCol>


    <!-- 👉 tree  -->
    <VCol cols="12" md="6">
      <!--            <AnalyticsEarningReportsWeeklyOverview />-->
    </VCol>


    <!-- 👉 Timeline -->

  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
