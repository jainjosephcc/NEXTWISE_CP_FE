<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'
// If VueApexCharts isn’t globally registered, import & register locally:
// import VueApexCharts from 'vue3-apexcharts'

const vuetifyTheme = useTheme()

const series = [
  { name: 'Earning', data: [15, 10, 20, 8, 12, 18, 12, 5] },
  { name: 'Expense', data: [-7, -10, -7, -12, -6, -9, -5, -8] },
]

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  return {
    chart: { parentHeightOffset: 0, stacked: true, type: 'bar', toolbar: { show: false } },
    tooltip: { enabled: false },
    legend: { show: false },
    stroke: { curve: 'smooth', width: 6, lineCap: 'round', colors: [currentTheme.surface] },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 8,
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'all',
      },
    },
    colors: ['rgba(var(--v-theme-primary),1)', 'rgba(var(--v-theme-secondary),1)'],
    dataLabels: { enabled: false },
    grid: { show: false, padding: { top: -40, bottom: -20, left: -10, right: -2 } },
    xaxis: { labels: { show: false }, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: { labels: { show: false } },
    responsive: [
      { breakpoint: 1600, options: { plotOptions: { bar: { columnWidth: '50%', borderRadius: 8 } } } },
      { breakpoint: 1468, options: { plotOptions: { bar: { columnWidth: '60%', borderRadius: 8 } } } },
      { breakpoint: 1279, options: { plotOptions: { bar: { columnWidth: '35%', borderRadius: 8 } } } },
      { breakpoint: 1197, options: { chart: { height: 228 }, plotOptions: { bar: { columnWidth: '40%', borderRadius: 8 } } } },
      { breakpoint: 912, options: { chart: { height: 232 }, plotOptions: { bar: { columnWidth: '55%', borderRadius: 8 } } } },
      { breakpoint: 725, options: { plotOptions: { bar: { columnWidth: '70%', borderRadius: 8 } } } },
      { breakpoint: 600, options: { plotOptions: { bar: { columnWidth: '40%', borderRadius: 8 } } } },
      { breakpoint: 475, options: { plotOptions: { bar: { columnWidth: '50%', borderRadius: 8 } } } },
      { breakpoint: 381, options: { plotOptions: { bar: { columnWidth: '60%', borderRadius: 8 } } } },
    ],
    states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
  }
})

const totalEarnings = [
  { avatar: 'tabler-brand-paypal', avatarColor: 'primary', title: 'Total Revenue', subtitle: 'Client Payment', earning: '+$126' },
  { avatar: 'tabler-currency-dollar', avatarColor: 'secondary', title: 'Total Sales', subtitle: 'Total Sales', earning: '+$98' },
]

const moreList = [{ title: 'View More', value: 'View More' }, { title: 'Delete', value: 'Delete' }]
</script>

<template>
  <VCard class="coral-earning-card">
    <VCardItem class="pb-0">
      <!-- ✅ #append MUST be an immediate child of VCardItem -->
      <template #append>
        <div class="mt-n8 me-n2">
          <MoreBtn size="small" :menu-list="moreList" />
        </div>
      </template>

      <div class="d-flex align-center justify-space-between">
        <div>
          <VCardTitle class="text-h5 font-weight-semibold mb-2">Portfolio Performance</VCardTitle>
          <div class="d-flex align-center">
            <h2 class="text-h2 me-3 font-weight-bold text-primary">87%</h2>
            <VChip color="success" size="small" class="coral-performance-chip">
              <VIcon size="16" icon="tabler-chevron-up" class="me-1" />
              <span class="text-sm font-weight-semibold">+25.8%</span>
            </VChip>
          </div>
        </div>
      </div>
    </VCardItem>

    <VCardText class="pt-0">
      <div class="coral-chart-container mb-4">
        <VueApexCharts :options="chartOptions" :series="series" height="200" class="coral-earning-chart" />
      </div>

      <VList class="coral-earning-list">
        <VListItem v-for="earning in totalEarnings" :key="earning.title" class="coral-earning-item">
          <template #prepend>
            <VAvatar size="40" :color="earning.avatarColor" variant="tonal" rounded class="me-3 coral-earning-avatar">
              <VIcon :icon="earning.avatar" size="22" />
            </VAvatar>
          </template>

          <VListItemTitle class="font-weight-semibold text-high-emphasis">
            {{ earning.title }}
          </VListItemTitle>
          <VListItemSubtitle class="text-medium-emphasis">
            {{ earning.subtitle }}
          </VListItemSubtitle>

          <template #append>
            <VChip color="success" size="small" class="coral-earning-chip">
              <VIcon icon="tabler-chevron-up" size="14" class="me-1" />
              {{ earning.earning }}
            </VChip>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.coral-earning-card {
  background: rgba(var(--v-theme-surface), 0.8) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--v-theme-primary), 0.1) !important;
  border-radius: 16px !important;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15) !important;
    border-color: rgba(var(--v-theme-primary), 0.2) !important;
  }
}

.coral-performance-chip {
  background: rgba(16, 185, 129, 0.1) !important;
  border: 1px solid rgba(16, 185, 129, 0.2) !important;
  color: #10B981 !important;
  backdrop-filter: blur(8px);
  font-weight: 600;
}

.coral-chart-container {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.03) 0%, rgba(var(--v-theme-primary), 0.01) 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
}

/* ✅ pierce scoped styles for ApexCharts */
.coral-earning-chart :deep(.apexcharts-series[data-seriesName="Earning"] .apexcharts-bar-area) {
  fill: #22C58B !important;
}

.coral-earning-chart :deep(.apexcharts-series[data-seriesName="Expense"] .apexcharts-bar-area) {
  fill: #EF4444 !important;
}

.coral-earning-list {
  --v-card-list-gap: 20px;
}

.coral-earning-item {
  background: rgba(var(--v-theme-primary), 0.02);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.05);
    border-color: rgba(var(--v-theme-primary), 0.1);
    transform: translateX(4px);
  }
}

.coral-earning-avatar {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.3);
  }
}

.coral-earning-chip {
  background: rgba(16, 185, 129, 0.1) !important;
  border: 1px solid rgba(16, 185, 129, 0.2) !important;
  color: #10B981 !important;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.text-primary {
  color: #22C58B !important;
}

.text-success {
  color: #10B981 !important;
}

.v-theme--dark {
  .coral-earning-card {
    background: rgba(15, 23, 42, 0.8) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;

    &:hover {
      border-color: rgba(34, 197, 139, 0.3) !important;
      box-shadow: 0 8px 24px rgba(34, 197, 139, 0.2) !important;
    }
  }

  .coral-chart-container {
    background: linear-gradient(135deg, rgba(34, 197, 139, 0.05) 0%, rgba(34, 197, 139, 0.02) 100%);
    border-color: rgba(34, 197, 139, 0.1);
  }

  .coral-earning-item {
    background: rgba(34, 197, 139, 0.03);
    border-color: rgba(34, 197, 139, 0.08);

    &:hover {
      background: rgba(34, 197, 139, 0.06);
      border-color: rgba(34, 197, 139, 0.15);
    }
  }
}

.v-theme--light {
  .coral-earning-card {
    background: rgba(255, 255, 255, 0.9) !important;
    border-color: rgba(34, 197, 139, 0.1) !important;

    &:hover {
      border-color: rgba(34, 197, 139, 0.2) !important;
      box-shadow: 0 8px 24px rgba(34, 197, 139, 0.1) !important;
    }
  }

  .coral-chart-container {
    background: linear-gradient(135deg, rgba(34, 197, 139, 0.02) 0%, rgba(34, 197, 139, 0.01) 100%);
    border-color: rgba(34, 197, 139, 0.06);
  }

  .coral-earning-item {
    background: rgba(34, 197, 139, 0.01);
    border-color: rgba(34, 197, 139, 0.03);

    &:hover {
      background: rgba(34, 197, 139, 0.03);
      border-color: rgba(34, 197, 139, 0.08);
    }
  }
}

/* responsive + entrance */
@media (max-width: 960px) {

  .coral-earning-card .v-card-item,
  .coral-earning-card .v-card-text {
    padding: 16px !important;
  }

  .coral-earning-list {
    --v-card-list-gap: 16px;
  }

  .coral-earning-item {
    padding: 12px !important;
  }
}

.coral-earning-card {
  animation: fadeInUp .6s ease-out;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px)
  }

  100% {
    opacity: 1;
    transform: translateY(0)
  }
}
</style>
