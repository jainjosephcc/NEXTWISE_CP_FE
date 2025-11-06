<script setup>
import AnalyticsAverageDailySales from '@/views/dashboards/analytics/AnalyticsAverageDailySales.vue'
import AnalyticsMonthlyCampaignState from '@/views/dashboards/analytics/AnalyticsMonthlyCampaignState.vue'
import AnalyticsProjectTable from '@/views/dashboards/analytics/AnalyticsProjectTable.vue'
import AnalyticsSalesByCountries from '@/views/dashboards/analytics/AnalyticsSalesByCountries.vue'
import AnalyticsSourceVisits from '@/views/dashboards/analytics/AnalyticsSourceVisits.vue'
import AnalyticsSupportTracker from '@/views/dashboards/analytics/AnalyticsSupportTracker.vue'
import AnalyticsTotalEarning from '@/views/dashboards/analytics/AnalyticsTotalEarning.vue'
import AnalyticsWebsiteAnalytics from '@/views/dashboards/analytics/AnalyticsWebsiteAnalytics.vue'

// Page metadata
definePage({
  meta: {
    title: 'Analytics Dashboard',
    description: 'Comprehensive analytics and performance metrics for Coral Markets',
  },
})
</script>

<template>
  <div class="coral-analytics-dashboard">
    <!-- Enhanced Page Header -->
    <div class="analytics-header mb-8">
      <div class="d-flex align-center justify-space-between flex-wrap gap-4">
        <div>
          <h1 class="text-h3 font-weight-bold text-high-emphasis mb-2">
            Analytics Dashboard
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-0">
            Comprehensive insights into your trading performance and market analytics
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="d-flex align-center gap-3">
          <VBtn variant="outlined" color="primary" prepend-icon="tabler-download" class="coral-btn-outlined">
            Export Report
          </VBtn>
          <VBtn color="primary" prepend-icon="tabler-refresh" class="coral-btn-primary">
            Refresh Data
          </VBtn>
        </div>
      </div>
    </div>

    <!-- Main Analytics Grid -->
    <VRow class="match-height analytics-grid">
      <!-- 👉 Website Analytics - Hero Card -->
      <VCol cols="12" lg="8" class="analytics-hero-col">
        <div class="analytics-hero-wrapper">
          <AnalyticsWebsiteAnalytics />
        </div>
      </VCol>

      <!-- 👉 Quick Stats Row -->
      <VCol cols="12" lg="4" class="d-flex flex-column gap-4">
        <!-- Average Daily Sales -->
        <div class="analytics-stat-card">
          <AnalyticsAverageDailySales />
        </div>

        <!-- Sales Overview -->
        <div class="analytics-stat-card">

        </div>
      </VCol>

      <!-- 👉 Earning Reports - Full Width -->
      <!-- <VCol cols="12" class="analytics-chart-col">
        <div class="analytics-chart-wrapper">
          <AnalyticsEarningReportsWeeklyOverview />
        </div>
      </VCol> -->

      <!-- 👉 Support Tracker & Total Earning Row -->
      <VCol cols="12" lg="6" class="analytics-support-col">
        <div class="analytics-support-wrapper">
          <AnalyticsSupportTracker />
        </div>
      </VCol>

      <VCol cols="12" lg="6" class="analytics-earning-col">
        <div class="analytics-earning-wrapper">
          <AnalyticsTotalEarning />
        </div>
      </VCol>

      <!-- 👉 Secondary Metrics Grid -->
      <VCol cols="12" sm="6" lg="3" class="analytics-metric-col">
        <div class="analytics-metric-wrapper">
          <AnalyticsSalesByCountries />
        </div>
      </VCol>

      <VCol cols="12" sm="6" lg="3" class="analytics-metric-col">
        <div class="analytics-metric-wrapper">
          <AnalyticsMonthlyCampaignState />
        </div>
      </VCol>

      <VCol cols="12" sm="6" lg="3" class="analytics-metric-col">
        <div class="analytics-metric-wrapper">
          <AnalyticsSourceVisits />
        </div>
      </VCol>

      <VCol cols="12" sm="6" lg="3" class="analytics-metric-col">
        <div class="analytics-metric-wrapper">
          <VCard class="coral-metric-card h-100">
            <VCardText class="text-center pa-6">
              <VAvatar size="48" color="primary" variant="tonal" class="mb-4">
                <VIcon icon="tabler-trending-up" size="24" />
              </VAvatar>
              <h6 class="text-h6 font-weight-semibold mb-2">
                Market Sentiment
              </h6>
              <div class="text-h4 font-weight-bold text-primary mb-1">
                87%
              </div>
              <VChip color="success" size="small" class="mb-2">
                <VIcon icon="tabler-chevron-up" size="16" class="me-1" />
                +12.5%
              </VChip>
              <p class="text-caption text-medium-emphasis mb-0">
                Bullish sentiment across markets
              </p>
            </VCardText>
          </VCard>
        </div>
      </VCol>

      <!-- 👉 Project Table - Full Width -->
      <VCol cols="12" class="analytics-table-col">
        <div class="analytics-table-wrapper">
          <AnalyticsProjectTable />
        </div>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";

// Coral Markets Analytics Dashboard Styling
.coral-analytics-dashboard {

  // Enhanced page header styling
  .analytics-header {
    padding: 24px;
    border: 1px solid rgba(var(--v-theme-primary), 0.1);
    border-radius: 16px;
    backdrop-filter: blur(8px);
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);

    h1 {
      background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
      background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  // Coral-themed button styles
  .coral-btn-primary {
    border: none !important;
    background: linear-gradient(135deg, #f16326 0%, #e05520 50%, #cf470d 100%) !important;
    box-shadow: 0 4px 15px rgba(241, 99, 38, 30%), 0 2px 8px rgba(241, 99, 38, 20%);
    color: #fff !important;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #e05520 0%, #cf470d 50%, #b83d0a 100%) !important;
      box-shadow: 0 8px 25px rgba(241, 99, 38, 40%), 0 4px 12px rgba(241, 99, 38, 30%);
      transform: translateY(-2px);
    }

    &:active {
      transform: scale(0.98) translateY(-1px);
    }
  }

  .coral-btn-outlined {
    border: 2px solid rgb(var(--v-theme-primary)) !important;
    background: transparent !important;
    color: rgb(var(--v-theme-primary)) !important;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgb(var(--v-theme-primary)) !important;
      background: rgba(var(--v-theme-primary), 0.1) !important;
      transform: translateY(-1px);
    }
  }

  // Analytics grid enhancements
  .analytics-grid {
    .analytics-hero-col {
      .analytics-hero-wrapper {
        animation: fadeInUp 0.6s ease-out;
      }
    }

    .analytics-stat-card {
      animation: fadeInUp 0.6s ease-out;
      animation-delay: 0.1s;
      animation-fill-mode: both;
    }

    .analytics-chart-col {
      .analytics-chart-wrapper {
        animation: fadeInUp 0.6s ease-out;
        animation-delay: 0.2s;
        animation-fill-mode: both;
      }
    }

    .analytics-support-col,
    .analytics-earning-col {

      .analytics-support-wrapper,
      .analytics-earning-wrapper {
        animation: fadeInUp 0.6s ease-out;
        animation-delay: 0.3s;
        animation-fill-mode: both;
      }
    }

    .analytics-metric-col {
      .analytics-metric-wrapper {
        animation: fadeInUp 0.6s ease-out;
        animation-delay: 0.4s;
        animation-fill-mode: both;
      }
    }

    .analytics-table-col {
      .analytics-table-wrapper {
        animation: fadeInUp 0.6s ease-out;
        animation-delay: 0.5s;
        animation-fill-mode: both;
      }
    }
  }

  // Custom metric card styling
  .coral-metric-card {
    border: 1px solid rgba(var(--v-theme-primary), 0.1) !important;
    border-radius: 16px !important;
    backdrop-filter: blur(8px);
    background: rgba(var(--v-theme-surface), 0.8) !important;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.2) !important;
      box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.15) !important;
      transform: translateY(-4px);
    }
  }

  // Enhanced card hover effects
  .v-card {
    border-radius: 16px !important;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 12%) !important;
      transform: translateY(-2px);
    }
  }

  // Primary color overrides for coral theme
  .v-card[color="primary"] {
    border: none !important;
    background: linear-gradient(135deg, #f16326 0%, #e05520 50%, #cf470d 100%) !important;
    box-shadow: 0 8px 24px rgba(241, 99, 38, 25%) !important;
  }

  // Enhanced text colors for better contrast
  .text-primary {
    color: rgb(var(--v-theme-primary)) !important;
  }

  .text-success {
    color: rgb(var(--v-theme-success)) !important;
  }

  // Custom animations
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

  // Responsive enhancements
  @media (max-width: 960px) {
    .analytics-header {
      padding: 16px;

      .d-flex {
        flex-direction: column;
        align-items: flex-start !important;
      }
    }
  }

  // Dark theme enhancements
  .v-theme--dark & {
    .analytics-header {
      border-color: rgba(34, 197, 139, 15%);
      background: linear-gradient(135deg, rgba(34, 197, 139, 8%) 0%, rgba(34, 197, 139, 3%) 100%);
    }

    .coral-metric-card {
      border-color: rgba(255, 255, 255, 10%) !important;
      background: rgba(15, 23, 42, 80%) !important;

      &:hover {
        border-color: rgba(34, 197, 139, 30%) !important;
        box-shadow: 0 12px 32px rgba(34, 197, 139, 20%) !important;
      }
    }
  }

  // Light theme enhancements
  .v-theme--light & {
    .analytics-header {
      border-color: rgba(34, 197, 139, 8%);
      background: linear-gradient(135deg, rgba(34, 197, 139, 3%) 0%, rgba(34, 197, 139, 1%) 100%);
    }

    .coral-metric-card {
      border-color: rgba(34, 197, 139, 10%) !important;
      background: rgba(255, 255, 255, 90%) !important;

      &:hover {
        border-color: rgba(34, 197, 139, 20%) !important;
        box-shadow: 0 12px 32px rgba(34, 197, 139, 10%) !important;
      }
    }
  }
}

// Global coral color system integration
:root {
  --coral-primary: #f16326;
  --coral-primary-dark: #e05520;
  --coral-primary-darker: #cf470d;
  --coral-primary-light: #ff7a3d;
  --coral-ink-900: #0b1220;
  --coral-ink-800: #0f172a;
  --coral-ink-700: #111827;
}

// Enhanced focus states for accessibility
.coral-analytics-dashboard {

  .v-btn:focus-visible,
  .v-card:focus-visible {
    outline: 2px solid var(--coral-primary);
    outline-offset: 2px;
  }
}

// Smooth scrolling for better UX
.coral-analytics-dashboard {
  scroll-behavior: smooth;
}

// Performance optimizations
.coral-analytics-dashboard * {
  will-change: auto;
}

.coral-analytics-dashboard .v-card:hover {
  will-change: transform, box-shadow;
}
</style>
