<script setup>
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'
import { onMounted } from "vue"
import { fetchPermissions } from "@/utils/permission.js"

const vuetifyTheme = useTheme()

const series = ref([
  {
    name: 'Targets',
    data: []
  },
  {
    name: 'Achieved',
    data: []
  }
]);
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

const targetDataSummary = ref(null);
const cumulativeSummary = ref({
  months: [],
  total_deposits: [],
  total_withdrawals: [],
  total_net_deposits: [],
  total_targets: []
});

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatMonthYear = (dateString) => {
  const [year, month] = dateString.split("-");
  return `${monthNames[parseInt(month, 10) - 1]}, ${year}`;
};

const fetchTargetSummary = async () => {
  const res = await $api('admin/dashboard/target-info', {
    method: 'GET',
    onResponseError({ response }) {
      console.error(response);
    },
  });

  if (res) {
    targetDataSummary.value = res;
    cumulativeSummary.value = res.cumulative_summary;
    cumulativeSummary.value.months = cumulativeSummary.value.months.map(formatMonthYear);


    const maxDeposit = Math.max(...cumulativeSummary.value.total_net_deposits);
    const maxTarget = Math.max(...cumulativeSummary.value.total_targets);
    const globalMax = Math.max(maxDeposit, maxTarget);

    series.value = [
      {
        name: 'Targets',
        data: normalizeData(cumulativeSummary.value.total_targets, globalMax)
      },
      {
        name: 'Achieved',
        data: normalizeData(cumulativeSummary.value.total_net_deposits, globalMax)
      }
    ];
  }
};
const normalizeData = (data, max) => {
  return data.map(value => (value / max) * 100);
};

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors;
  const variableTheme = vuetifyTheme.current.value.variables;
  const borderColor = `rgba(${hexToRgb(String(variableTheme['border-color']))},${variableTheme['border-opacity']})`;
  const labelColor = `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`;
  const legendColor = `rgba(${hexToRgb(currentTheme['on-background'])},${variableTheme['medium-emphasis-opacity']})`;

  return {
    chart: {
      type: 'radar',
      toolbar: { show: false },
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: borderColor,
          connectorColors: borderColor,
        },
      },
    },
    stroke: {
      show: false,
      width: 0,
    },
    legend: {
      show: true,
      fontSize: '13px',
      position: 'bottom',
      labels: {
        colors: legendColor,
        useSeriesColors: false,
      },
      markers: {
        height: 12,
        width: 12,
        offsetX: -8,
      },
      itemMargin: { horizontal: 10 },
      onItemHover: { highlightDataSeries: false },
    },
    colors: [
      currentTheme.primary,
      currentTheme.info,
    ],
    fill: {
      opacity: [
        1,
        0.85,
      ],
    },
    markers: { size: 0 },
    grid: {
      show: false,
      padding: {
        top: 0,
        bottom: -5,
      },
    },
    xaxis: {
      categories: cumulativeSummary.value.months,
      labels: {
        show: true,
        style: {
          colors: cumulativeSummary.value.months.map(() => labelColor),
          fontSize: '13px',
          fontFamily: 'Public Sans',
        },
      },
    },
    yaxis: {
      show: false,
      min: 0,
      max: 100,
      tickAmount: 4,
    },
    responsive: [{
      breakpoint: 769,
      options: { chart: { height: 372 } },
    }],
  }
});

onMounted(async () => {
  await fetchTargetSummary();
});

</script>

<template>
  <VCard>
    <VCardItem class="pb-4">
      <VCardTitle>Performance</VCardTitle>
      <VCardSubtitle>Last 6 Months</VCardSubtitle>

      <template #append>
        <div class="mt-n4 me-n2">
          <MoreBtn
            size="small"
            :menu-list="moreList"
          />
        </div>
      </template>
    </VCardItem>

    <VCardText>
      <VueApexCharts
        :options="chartOptions"
        :series="series"
        height="300"
      />
    </VCardText>
  </VCard>
</template>
