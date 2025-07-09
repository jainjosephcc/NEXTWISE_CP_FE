<script setup>
import { hexToRgb } from '@layouts/utils'
import { useTheme } from 'vuetify'
import { onMounted } from "vue"
import { fetchPermissions } from "@/utils/permission.js"
import { formatLargeNumber } from "@/utils/formatCurrency.js"

const vuetifyTheme = useTheme()
const currentTab = ref(0)
const refVueApexChart = ref()
const TTL = 60 * 60 * 1000

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


const fetchDataWithLocalStorage = async (key, apiEndpoint, dataRef) => {
  const localStorageData = getWithExpiry(key)
  if (localStorageData) {
    dataRef.value = localStorageData
    //return localStorageData;
  }
  const res = await $api(apiEndpoint, {
    method: 'GET',
    onResponseError({ response }) {
      console.error(response)
    },
  })

  if (res) {
    dataRef.value = res
    setWithExpiry(key, res, TTL)
    return res
  }
}

const summaryData = ref(null)
const chartConfigs = ref([])
const fetchMonthlySummary = () => {
  fetchDataWithLocalStorage('monthlySummary', 'admin/dashboard/monthly-summary', summaryData)

}

const setChartConfigs = () => {
  if (!summaryData.value) return
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables
  const labelPrimaryColor = `rgba(${hexToRgb(currentTheme.primary)},${variableTheme['dragged-opacity']})`
  const legendColor = `rgba(${hexToRgb(currentTheme['on-background'])},${variableTheme['high-emphasis-opacity']})`
  const borderColor = `rgba(${hexToRgb(String(variableTheme['border-color']))},${variableTheme['border-opacity']})`
  const labelColor = `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`

  const configs = []

  const addConfig = (title, icon, seriesData, monthsData, primaryIndex, isAmount) => {
    configs.push({
      title,
      icon,
      chartOptions: {
        chart: {
          parentHeightOffset: 0,
          type: 'bar',
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            columnWidth: '32%',
            borderRadiusApplication: 'end',
            borderRadius: 4,
            distributed: true,
            dataLabels: { position: 'top' },
          },
        },
        grid: {
          show: false,
          padding: {
            top: 0,
            bottom: 0,
            left: -10,
            right: -10,
          },
        },
        colors: Array(9).fill(labelPrimaryColor).map((color, index) => index === primaryIndex ? `rgba(${hexToRgb(currentTheme.primary)}, 1)` : color),
        dataLabels: {
          enabled: true,
          formatter(val) {
            if (isAmount)
              return `${formatLargeNumber(val)}`
            else
              return val
          },
          offsetY: -25,
          style: {
            fontSize: '15px',
            colors: [legendColor],
            fontWeight: '600',
            fontFamily: 'Public Sans',
          },
        },
        legend: { show: false },
        tooltip: { enabled: false },
        xaxis: {
          categories: monthsData,
          axisBorder: {
            show: true,
            color: borderColor,
          },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: labelColor,
              fontSize: '13px',
              fontFamily: 'Public Sans',
            },
          },
        },
        yaxis: {
          labels: {
            offsetX: -15,
            formatter(val) {
              if (isAmount)
                return `${formatLargeNumber(val)}`
              else
                return val
            },
            style: {
              fontSize: '13px',
              colors: labelColor,
              fontFamily: 'Public Sans',
            },
            min: 0,
            max: 60000,
            tickAmount: 6,
          },
        },
        responsive: [
          {
            breakpoint: 1441,
            options: { plotOptions: { bar: { columnWidth: '41%' } } },
          },
          {
            breakpoint: 590,
            options: {
              plotOptions: { bar: { columnWidth: '61%' } },
              yaxis: { labels: { show: false } },
              grid: {
                padding: {
                  right: 0,
                  left: -20,
                },
              },
              dataLabels: {
                style: {
                  fontSize: '12px',
                  fontWeight: '400',
                },
              },
            },
          },
        ],
      },
      series: [{
        data: seriesData,
      }],
    })
  }

  const fetchedData = summaryData?.value
  addConfig('Deposits', 'tabler-credit-card-refund', fetchedData?.totalDeposits, fetchedData.months, 8, true)
  addConfig('Withdrawals', 'tabler-receipt', fetchedData?.totalWithdraws, fetchedData.months, 8, true)
  addConfig('Clients', 'tabler-users-plus', fetchedData?.totalClients, fetchedData.months, 8, false)
  addConfig('IBs', 'tabler-users-group', fetchedData?.totalIBs, fetchedData.months, 8, false)

  chartConfigs.value = configs
}


watch(summaryData, (newValue) => {
  if (newValue) {
    setChartConfigs()
  }
}, { immediate: true })


onMounted(async () => {
  //fetchPermissions();
  await fetchMonthlySummary()
})

</script>

<template>
  <VCard title="Overall Statistics" subtitle="Last 6 Months">
    <template #append>
      <div class="mt-n4 me-n2">
        <MoreBtn size="small" :menu-list="moreList"/>
      </div>
    </template>

    <VCardText>
      <VSlideGroup v-model="currentTab" show-arrows mandatory class="mb-10">
        <VSlideGroupItem v-for="(report, index) in chartConfigs" :key="report.title" v-slot="{ isSelected, toggle }"
                         :value="index"
        >
          <div style="block-size: 100px; inline-size: 110px;"
               :style="isSelected ? 'border-color:rgb(var(--v-theme-primary)) !important' : ''"
               :class="isSelected ? 'border' : 'border border-dashed'"
               class="d-flex flex-column justify-center align-center cursor-pointer rounded py-4 px-5 me-4"
               @click="toggle"
          >
            <VAvatar rounded size="38" :color="isSelected ? 'primary' : ''" variant="tonal" class="mb-2">
              <VIcon size="22" :icon="report.icon"/>
            </VAvatar>
            <h6 class="text-base font-weight-medium mb-0">
              {{ report.title }}
            </h6>
          </div>
        </VSlideGroupItem>

        <!-- 👉 slider more -->
        <!--        <VSlideGroupItem>
                  <div style="block-size: 100px; inline-size: 110px;"
                       class="d-flex flex-column justify-center align-center rounded border border-dashed py-4 px-5">
                    <VAvatar rounded size="38" variant="tonal">
                      <VIcon size="22" icon="tabler-plus" />
                    </VAvatar>
                  </div>
                </VSlideGroupItem>-->
      </VSlideGroup>
      <VueApexCharts v-if="summaryData&&chartConfigs" ref="refVueApexChart" :key="currentTab"
                     :options="chartConfigs[Number(currentTab)].chartOptions"
                     :series="chartConfigs[Number(currentTab)].series" height="230" class="mt-3"
      />
    </VCardText>
  </VCard>
</template>
