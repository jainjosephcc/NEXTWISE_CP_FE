<script setup>
import { ref, onMounted, watch, defineProps } from 'vue'

const chartColors = {
  line: {
    series1: '#FFB400',
    series2: '#9055FD',
    series3: '#7367f029',
  },
}

const headingColor = 'rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity))'
const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'
const borderColor = 'rgba(var(--v-border-color), var(--v-border-opacity))'

const series = ref([
  {
    name: 'Net Deposit',
    type: 'column',
    data: [],
  },
  {
    name: 'Target',
    type: 'line',
    data: [],
  },
])

const getLastSixMonths = () => {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }))
  }
  return months
}

const shipmentConfig = ref({
  chart: {
    type: 'line',
    stacked: false,
    parentHeightOffset: 0,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  markers: {
    size: 5,
    colors: '#fff',
    strokeColors: chartColors.line.series2,
    hover: { size: 6 },
    borderRadius: 4,
  },
  stroke: {
    curve: 'smooth',
    width: [0, 3],
    lineCap: 'round',
  },
  legend: {
    show: true,
    position: 'bottom',
    markers: {
      width: 8,
      height: 8,
      offsetX: -3,
    },
    height: 40,
    itemMargin: {
      horizontal: 10,
      vertical: 0,
    },
    fontSize: '15px',
    fontFamily: 'Open Sans',
    fontWeight: 400,
    labels: {
      colors: headingColor,
      useSeriesColors: !1,
    },
    offsetY: 10,
  },
  grid: {
    strokeDashArray: 8,
    borderColor,
  },
  colors: [
    chartColors.line.series1,
    chartColors.line.series2,
  ],
  fill: {
    opacity: [1, 1],
  },
  plotOptions: {
    bar: {
      columnWidth: '30%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    tickAmount: 10,
    categories: getLastSixMonths(),
    labels: {
      style: {
        colors: labelColor,
        fontSize: '13px',
        fontWeight: 400,
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    tickAmount: 4,
    min: 0,
    max: 50,
    labels: {
      style: {
        colors: labelColor,
        fontSize: '13px',
        fontWeight: 400,
      },
      formatter(val) {
        return `${val.toFixed(2)} $`
      },
    },
  },
  responsive: [
    {
      breakpoint: 1400,
      options: {
        chart: { height: 320 },
        xaxis: { labels: { style: { fontSize: '10px' } } },
        legend: {
          itemMargin: {
            vertical: 0,
            horizontal: 10,
          },
          fontSize: '13px',
          offsetY: 12,
        },
      },
    },
    {
      breakpoint: 1025,
      options: {
        chart: { height: 415 },
        plotOptions: { bar: { columnWidth: '50%' } },
      },
    },
    {
      breakpoint: 982,
      options: { plotOptions: { bar: { columnWidth: '30%' } } },
    },
    {
      breakpoint: 480,
      options: {
        chart: { height: 250 },
        legend: { offsetY: 7 },
      },
    },
  ],
})

const props = defineProps({
  staffTargetData: {
    type: Object,
    required: true,
  },
})


const updateYAxisMax = (data) => {
  const allValues = [...data.individual_summary[0].monthly_net_deposits, ...data.individual_summary[0].monthly_targets]
  const maxValue = Math.max(...allValues)
  shipmentConfig.value = {
    ...shipmentConfig.value,
    yaxis: {
      ...shipmentConfig.value.yaxis,
      max: Math.ceil(maxValue / 10) * 10, // Round up to the nearest 10
    },
  }
}

watch(
  () => props.staffTargetData,
  (newVal) => {
    if (newVal && newVal.individual_summary && newVal.individual_summary.length > 0) {
      console.log('New Value:', newVal) // Debugging line
      series.value[0].data = newVal.individual_summary[0].monthly_net_deposits
      series.value[1].data = newVal.individual_summary[0].monthly_targets

      shipmentConfig.value.xaxis.categories = newVal.individual_summary[0].months.map((month) => {
        const [year, monthNum] = month.split('-')
        const date = new Date(year, monthNum - 1)
        return date.toLocaleString('default', { month: 'short', year: 'numeric' })
      })

      updateYAxisMax(newVal)
    } else {
      console.warn('Invalid or empty individual_summary data')
    }
  },
  { immediate: true }, // Ensure the watcher runs immediately on component load
)

</script>

<template>
  <VCard>
    <VCardItem
      title="Performance statistics"
    >
      <template #append>
        <p>Evaluating : Target - Net Deposit</p>
      </template>
    </VCardItem>

    <VCardText>
      <VueApexCharts
        id="shipment-statistics"
        type="line"
        height="320"
        :options="shipmentConfig"
        :series="series"
      />
    </VCardText>
  </VCard>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart";

.v-btn-group--divided .v-btn:not(:last-child) {
  border-inline-end-color: rgba(var(--v-theme-primary), 0.5);
}

#shipment-statistics {
  .apexcharts-legend-text {
    font-size: 16px !important;
  }

  .apexcharts-legend-series {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 0.375rem;
    block-size: 83%;
    padding-block: 4px;
    padding-inline: 16px 12px;
  }
}
</style>
