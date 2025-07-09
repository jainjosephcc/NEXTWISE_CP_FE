<script setup>
import { ref, onMounted, watch, defineProps, computed } from 'vue';
import { useTheme } from 'vuetify';
import { getHorizontalBarChartConfig } from '@core/libs/chartjs/chartjsConfig.js';
import BarChart from '@core/libs/chartjs/components/BarChart.js';

const chartJsCustomColors = {
  white: '#fff',
  yellow: '#ffe802',
  primary: '#836af9',
  areaChartBlue: '#2c9aff',
  barChartYellow: '#ffcf5c',
  polarChartGrey: '#4f5d70',
  polarChartInfo: '#299aff',
  lineChartYellow: '#d4e157',
  polarChartGreen: '#28dac6',
  lineChartPrimary: '#9e69fd',
  lineChartWarning: '#ff9800',
  horizontalBarInfo: '#26c6da',
  polarChartWarning: '#ff8131',
  scatterChartGreen: '#28c76f',
  warningShade: '#ffbd1f',
  areaChartBlueLight: '#84d0ff',
  areaChartGreyLight: '#edf1f4',
  scatterChartWarning: '#ff9f43',
};

const vuetifyTheme = useTheme();

const getLastSixMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i <= 5; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
  }
  return months.reverse();
};

const data = ref({
  labels: getLastSixMonths(),
  datasets: [
    {
      maxBarThickness: 15,
      label: 'Deposits',
      backgroundColor: chartJsCustomColors.warningShade,
      borderColor: 'transparent',
      data: [],
    },
    {
      maxBarThickness: 15,
      backgroundColor: chartJsCustomColors.horizontalBarInfo,
      label: 'Withdrawals',
      borderColor: 'transparent',
      data: [],
    },
  ],
});

const chartOptions = computed(() => {
  const maxValue = Math.max(...data.value.datasets[0].data, ...data.value.datasets[1].data);
  const baseOptions = getHorizontalBarChartConfig(vuetifyTheme.current.value);

  return {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      x: {
        ...baseOptions.scales.x,
        max: Math.ceil(maxValue / 10) * 10, // Round up to the nearest 10
      },
    },
  };
});

const staffTargetData = ref(null);
const isDataChanged = ref(false);

const props = defineProps({
  staffId: {
    type: Number,
    required: true,
  },
});

const fetchPerformanceData = async () => {
  try {
    const res = await $api(`/admin/staff/target-info/${props.staffId}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response);
      },
    });

    if (res) {
      staffTargetData.value = res;
    } else {
      console.error('Failed to fetch data or empty response');
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

watch(staffTargetData, (newVal) => {
  if (newVal) {
    data.value.labels = getLastSixMonths().reverse();
    data.value.datasets[0].data = newVal.individual_summary[0].monthly_deposits.map(val => parseFloat(val.toFixed(2))).reverse();
    data.value.datasets[1].data = newVal.individual_summary[0].monthly_withdrawals.map(val => parseFloat(val.toFixed(2))).reverse();
    isDataChanged.value = true;
  }
});

onMounted(async () => {
  await fetchPerformanceData();
});
</script>

<template>
  <VCard>
    <VCardItem class="d-flex flex-wrap justify-space-between gap-4">
      <VCardTitle>Transaction Statistics</VCardTitle>

      <template #append>
        <VCardSubtitle>Evaluating : Deposits-Withdrawals </VCardSubtitle>
      </template>
    </VCardItem>

    <VCardText v-if="isDataChanged">
      <BarChart
        :height="375"
        :chart-data="data"
        :chart-options="chartOptions"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">
</style>
