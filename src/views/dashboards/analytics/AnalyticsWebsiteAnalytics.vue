<script setup>
import sliderBar1 from '@images/illustrations/sidebar-pic-1.png'
import sliderBar2 from '@images/illustrations/sidebar-pic-2.png'
import sliderBar3 from '@images/illustrations/sidebar-pic-3.png'
import { h } from 'vue'
import { VIcon } from 'vuetify/components/VIcon'

const websiteAnalytics = [
  {
    name: 'Traffic',
    slideImg: sliderBar1,
    data: [
      {
        number: '1.5k',
        text: 'Sessions',
      },
      {
        number: '3.1k',
        text: 'Page Views',
      },
      {
        number: '1.2k',
        text: 'Leads',
      },
      {
        number: '12%',
        text: 'Conversions',
      },
    ],
  },
  {
    name: 'Spending',
    slideImg: sliderBar2,
    data: [
      {
        number: '12h',
        text: 'Spend',
      },
      {
        number: '182',
        text: 'Order Size',
      },
      {
        number: '127',
        text: 'Order',
      },
      {
        number: '23k',
        text: 'Items',
      },
    ],
  },
  {
    name: 'Revenue Sources',
    slideImg: sliderBar3,
    data: [
      {
        number: '268',
        text: 'Direct',
      },
      {
        number: '890',
        text: 'Organic',
      },
      {
        number: '622',
        text: 'Referral',
      },
      {
        number: '1.2k',
        text: 'Campaign',
      },
    ],
  },
]
</script>

<template>
  <VCard class="coral-analytics-hero-card" height="240">
    <VCarousel cycle :continuous="false" :show-arrows="false" hide-delimiter-background
      :delimiter-icon="() => h(VIcon, { icon: 'fa-circle', size: '8' })" height="320"
      class="carousel-delimiter-top-end web-analytics-carousel">
      <VCarouselItem v-for="item in websiteAnalytics" :key="item.name">
        <VCardText class="position-relative pa-6">
          <VRow class="align-center">
            <VCol cols="12">
              <div class="d-flex align-center justify-space-between mb-2">
                <div>
                  <h5 class="text-h4 font-weight-bold text-white">
                    Trading Analytics
                  </h5>
                  <p class="text-body-1 text-coral-100 mb-0">
                    Real-time performance metrics and insights
                  </p>
                </div>
                <VChip color="success" size="small" class="coral-success-chip">
                  <VIcon icon="tabler-trending-up" size="16" class="me-1" />
                  Live
                </VChip>
              </div>
            </VCol>

            <VCol cols="12" sm="6" order="2" order-sm="1">
              <VRow>

                <VCol v-for="d in item.data" :key="d.number" cols="6" class="text-no-wrap pb-3">
                  <div class="coral-metric-item">
                    <VChip label variant="flat" size="default"
                      class="coral-metric-chip font-weight-semibold text-white rounded-lg me-2 px-3 py-1">
                      <span class="text-h6">{{ d.number }}</span>
                    </VChip>
                    <span class="text-coral-100 text-sm font-medium d-inline-block">{{ d.text }}</span>
                  </div>
                </VCol>
              </VRow>
            </VCol>

            <VCol cols="12" sm="6" order="1" order-sm="2" class="text-center">
              <div class="coral-analytics-visual">
                <img :src="item.slideImg" class="card-website-analytics-img"
                  style="filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.3));">
                <div class="coral-visual-overlay">
                  <div class="coral-pulse-ring"></div>
                  <div class="coral-pulse-ring coral-pulse-ring-2"></div>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCarouselItem>
    </VCarousel>
  </VCard>
</template>

<style lang="scss">
// Coral Markets Analytics Hero Card Styling
.coral-analytics-hero-card {
  background: linear-gradient(135deg, #f16326 0%, #e05520 50%, #cf470d 100%) !important;
  border: none !important;
  border-radius: 20px !important;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%);
    pointer-events: none;
    z-index: 1;
  }

  .v-card__text {
    position: relative;
    z-index: 2;
  }
}

// Enhanced image styling
.card-website-analytics-img {
  block-size: 160px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

@media screen and (min-width: 600px) {
  .card-website-analytics-img {
    position: absolute;
    margin: auto;
    inset-block-end: 1.5rem;
    inset-inline-end: 3rem;
  }
}

// Coral metric styling
.coral-metric-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.coral-metric-chip {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3) !important;
    transform: translateY(-1px);
  }
}

.coral-success-chip {
  background: rgba(241, 99, 38, 0.2) !important;
  border: 1px solid rgba(241, 99, 38, 0.4) !important;
  color: #f16326 !important;
  backdrop-filter: blur(8px);
  animation: pulse 2s infinite;
}

// Visual enhancements
.coral-analytics-visual {
  position: relative;
  display: inline-block;
}

.coral-visual-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.coral-pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

.coral-pulse-ring-2 {
  animation-delay: 1s;
  width: 140px;
  height: 140px;
}

// Text color overrides
.text-coral-100 {
  color: rgba(255, 255, 255, 0.9) !important;
}

// Enhanced carousel controls
.web-analytics-carousel {
  .v-carousel__controls {
    .v-carousel__controls__item {
      &.v-btn--active {
        .v-icon {
          opacity: 1 !important;
          color: rgba(255, 255, 255, 0.9) !important;
        }
      }

      .v-icon {
        color: rgba(255, 255, 255, 0.5) !important;
        transition: all 0.3s ease;

        &:hover {
          color: rgba(255, 255, 255, 0.8) !important;
        }
      }
    }
  }
}

// Animations
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

// Responsive enhancements
@media (max-width: 960px) {
  .coral-analytics-hero-card {
    .v-card__text {
      padding: 20px !important;
    }
  }

  .card-website-analytics-img {
    block-size: 120px;
    position: static !important;
    margin: 16px auto !important;
  }

  .coral-pulse-ring {
    width: 80px;
    height: 80px;
  }

  .coral-pulse-ring-2 {
    width: 100px;
    height: 100px;
  }
}

// Dark theme adjustments


// Light theme adjustments
.v-theme--light {
  .coral-analytics-hero-card {
    box-shadow: 0 12px 40px rgba(34, 197, 139, 0.25), 0 4px 16px rgba(34, 197, 139, 0.15) !important;
  }
}
</style>
