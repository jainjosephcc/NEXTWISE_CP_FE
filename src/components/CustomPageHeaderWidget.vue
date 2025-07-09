<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchHeaderData, headerData } from '@/utils/apiUtils';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const prefixWithPlus = (value) => {
  return value > 0 ? `+${value}` : `${value}`;
};

const widgetData = computed(() => [
  {
    title: 'Total Clients',
    value: headerData.value?.total_clients?.toString() || '0',
    change: 29,
    desc: 'Active Registered Clients',
    icon: 'tabler-users',
    iconColor: 'primary'
  },
  {
    title: 'IB Count',
    value: headerData.value?.ib_count?.toString() || '0',
    change: 18,
    desc: 'Introducing Brokers',
    icon: 'tabler-chart-arrows-vertical',
    iconColor: 'warning'
  },
  {
    title: 'Total Deposit',
    value: formatCurrency(headerData.value?.total_deposit || 0),
    desc: 'Approved Deposits',
    icon: 'tabler-brand-cashapp',
    iconColor: 'success'
  },
  {
    title: 'Total Withdraw',
    value: formatCurrency(headerData.value?.total_withdraw || 0),
    desc: 'Approved Withdrawals',
    icon: 'tabler-database-minus',
    iconColor: 'danger'
  },
]);

onMounted(async () => {
  await fetchHeaderData();
});
</script>
<template>
  <div class="d-flex mb-6">
    <VRow>
      <template v-for="(data, id) in widgetData" :key="id">
        <VCol cols="12" md="3" sm="6">
          <VCard>
            <VCardText>
              <div class="d-flex justify-space-between">
                <div class="d-flex flex-column gap-y-1">
                  <div class="text-body-1 text-high-emphasis">
                    {{ data.title }}
                  </div>
                  <div class="d-flex gap-x-2 align-center">
                    <h5 class="text-h5">
                      {{ data.value }}
                    </h5>
                    <div v-if="data.change" class="text-base" :class="data.change > 0 ? 'text-success' : 'text-error'">
                      ({{ prefixWithPlus(data.change) }}%)
                    </div>
                  </div>
                  <div class="text-sm">
                    {{ data.desc }}
                  </div>
                </div>
                <VAvatar :color="data.iconColor" variant="tonal" rounded size="42">
                  <VIcon :icon="data.icon" size="26" />
                </VAvatar>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </template>
    </VRow>
  </div>
</template>


<style scoped>
/* Add any additional styling here */
</style>
