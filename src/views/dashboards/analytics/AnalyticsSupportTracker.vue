<script setup>
import { hexToRgb } from '@layouts/utils'
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()
const series = [85]

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  return {
    labels: ['Completed Task'],
    chart: { type: 'radialBar' },
    plotOptions: {
      radialBar: {
        offsetY: 10,
        startAngle: -140,
        endAngle: 130,
        hollow: { size: '65%' },
        track: {
          background: currentTheme.surface,
          strokeWidth: '100%',
        },
        dataLabels: {
          name: {
            offsetY: -20,
            color: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`,
            fontSize: '13px',
            fontWeight: '400',
            fontFamily: 'Public Sans',
          },
          value: {
            offsetY: 10,
            color: `rgba(${hexToRgb(currentTheme['on-background'])},${variableTheme['high-emphasis-opacity']})`,
            fontSize: '38px',
            fontWeight: '500',
            fontFamily: 'Public Sans',
          },
        },
      },
    },
    colors: [currentTheme.primary],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.5,
        gradientToColors: [currentTheme.primary],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.6,
        stops: [
          30,
          70,
          100,
        ],
      },
    },
    stroke: { dashArray: 10 },
    grid: {
      padding: {
        top: -20,
        bottom: 5,
      },
    },
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } },
    },
    responsive: [{
      breakpoint: 960,
      options: { chart: { height: 280 } },
    }],
  }
})

const supportTicket = [
  {
    avatarColor: 'primary',
    avatarIcon: 'tabler-ticket',
    title: 'New Tickets',
    subtitle: '142',
  },
  {
    avatarColor: 'info',
    avatarIcon: 'tabler-check',
    title: 'Open Tickets',
    subtitle: '28',
  },
  {
    avatarColor: 'warning',
    avatarIcon: 'tabler-clock',
    title: 'Response Time',
    subtitle: '1 Day',
  },
]

const moreList = [
  {
    title: 'View More',
    value: 'View More',
  },
  {
    title: 'Delete',
    value: 'Delete',
  },
]
</script>

<template>
  <VCard class="coral-support-card">
    <VCardItem>
      <div class="d-flex align-center justify-space-between">
        <div>
          <VCardTitle class="text-h5 font-weight-semibold mb-1">Support Tracker</VCardTitle>
          <VCardSubtitle class="text-medium-emphasis">Last 7 Days Performance</VCardSubtitle>
        </div>

        <div class="mt-n4 me-n2">
          <MoreBtn size="small" :menu-list="moreList" />
        </div>
      </div>
    </VCardItem>

    <VCardText>
      <VRow class="align-center">
        <VCol cols="12" lg="4" md="4">
          <div class="coral-support-stats mb-6">
            <div class="d-flex align-center mb-4">
              <h2 class="text-h2 font-weight-bold text-primary me-3">
                164
              </h2>
              <VChip color="success" size="small" class="coral-stats-chip">
                <VIcon icon="tabler-trending-up" size="14" class="me-1" />
                +12%
              </VChip>
            </div>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Total Tickets Resolved
            </p>
          </div>

          <VList class="coral-support-list">
            <VListItem v-for="ticket in supportTicket" :key="ticket.title" class="coral-support-item">
              <VListItemTitle class="font-weight-semibold text-high-emphasis">
                {{ ticket.title }}
              </VListItemTitle>
              <VListItemSubtitle class="text-medium-emphasis">
                {{ ticket.subtitle }}
              </VListItemSubtitle>
              <template #prepend>
                <VAvatar rounded size="36" :color="ticket.avatarColor" variant="tonal"
                  class="me-3 coral-support-avatar">
                  <VIcon size="20" :icon="ticket.avatarIcon" />
                </VAvatar>
              </template>
            </VListItem>
          </VList>
        </VCol>
        <VCol cols="12" lg="8" md="8">
          <div class="coral-chart-wrapper">
            <VueApexCharts :options="chartOptions" :series="series" height="360" class="coral-support-chart" />
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
// Coral Markets Support Tracker Styling
.coral-support-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.1) !important;
  border-radius: 16px !important;
  backdrop-filter: blur(8px);
  background: rgba(var(--v-theme-surface), 0.8) !important;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.2) !important;
    box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15) !important;
    transform: translateY(-2px);
  }
}

.coral-support-stats {
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
}

.coral-stats-chip {
  border: 1px solid rgba(var(--v-theme-primary), 0.2) !important;
  backdrop-filter: blur(8px);
  background: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
}

.coral-support-list {
  --v-card-list-gap: 16px;

  .coral-support-item {
    padding: 16px;
    border: 1px solid rgba(var(--v-theme-primary), 0.05);
    border-radius: 12px;
    background: rgba(var(--v-theme-primary), 0.02);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.1);
      background: rgba(var(--v-theme-primary), 0.05);
      transform: translateX(4px);
    }
  }
}

.coral-support-avatar {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.3);
    transform: scale(1.1);
  }
}

.coral-chart-wrapper {
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.03) 0%, rgba(var(--v-theme-primary), 0.01) 100%);
}

.coral-support-chart {
  .apexcharts-radialbar-area {
    fill: rgb(var(--v-theme-primary)) !important;
  }

  .apexcharts-radialbar-track {
    fill: rgba(255, 255, 255, 10%) !important;
  }

  .apexcharts-radialbar-series {
    .apexcharts-radialbar-area {
      fill: url("#coralRadialGradient") !important;
    }
  }
}

// Enhanced text colors
.text-primary {
  color: rgb(var(--v-theme-primary)) !important;
}

.text-success {
  color: rgb(var(--v-theme-success)) !important;
}

// Dark theme adjustments
.v-theme--dark {
  .coral-support-card {
    border-color: rgba(255, 255, 255, 10%) !important;
    background: rgba(15, 23, 42, 80%) !important;

    &:hover {
      border-color: rgba(34, 197, 139, 30%) !important;
      box-shadow: 0 8px 24px rgba(34, 197, 139, 20%) !important;
    }
  }

  .coral-support-stats {
    border-color: rgba(34, 197, 139, 10%);
    background: linear-gradient(135deg, rgba(34, 197, 139, 5%) 0%, rgba(34, 197, 139, 2%) 100%);
  }

  .coral-chart-wrapper {
    border-color: rgba(34, 197, 139, 10%);
    background: linear-gradient(135deg, rgba(34, 197, 139, 5%) 0%, rgba(34, 197, 139, 2%) 100%);
  }

  .coral-support-item {
    border-color: rgba(34, 197, 139, 8%);
    background: rgba(34, 197, 139, 3%);

    &:hover {
      border-color: rgba(34, 197, 139, 15%);
      background: rgba(34, 197, 139, 6%);
    }
  }
}

// Light theme adjustments
.v-theme--light {
  .coral-support-card {
    border-color: rgba(34, 197, 139, 10%) !important;
    background: rgba(255, 255, 255, 90%) !important;

    &:hover {
      border-color: rgba(34, 197, 139, 20%) !important;
      box-shadow: 0 8px 24px rgba(34, 197, 139, 10%) !important;
    }
  }

  .coral-support-stats {
    border-color: rgba(34, 197, 139, 6%);
    background: linear-gradient(135deg, rgba(34, 197, 139, 2%) 0%, rgba(34, 197, 139, 1%) 100%);
  }

  .coral-chart-wrapper {
    border-color: rgba(34, 197, 139, 6%);
    background: linear-gradient(135deg, rgba(34, 197, 139, 2%) 0%, rgba(34, 197, 139, 1%) 100%);
  }

  .coral-support-item {
    border-color: rgba(34, 197, 139, 3%);
    background: rgba(34, 197, 139, 1%);

    &:hover {
      border-color: rgba(34, 197, 139, 8%);
      background: rgba(34, 197, 139, 3%);
    }
  }
}

// Responsive enhancements
@media (max-width: 960px) {
  .coral-support-card {
    .v-card-item {
      padding: 16px !important;
    }

    .v-card-text {
      padding: 16px !important;
    }
  }

  .coral-support-stats {
    padding: 16px;
    margin-block-end: 20px;
  }

  .coral-support-list {
    --v-card-list-gap: 12px;
  }

  .coral-support-item {
    padding: 12px !important;
  }

  .coral-chart-wrapper {
    padding: 12px;
  }
}

// Animation enhancements
.coral-support-card {
  animation: fadeInUp 0.6s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Chart gradient definitions
.coral-support-chart {
  .apexcharts-radialbar-series {
    .apexcharts-radialbar-area {
      fill: rgb(var(--v-theme-primary)) !important;
      opacity: 0.9;
    }
  }
}
</style>
