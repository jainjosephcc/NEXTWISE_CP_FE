<script setup>
const total_deposit=ref(null);
const total_withdraw=ref(null);
const total_clients=ref(null);
const total_ib=ref(null);

const props = defineProps({
  staff_id: {
    type: [String, Number],
    required: true
  }
});

onMounted(async () => {
  await fetchHeaderData();
});

const fetchHeaderData = async () => {
  try {
        const res = await $api(`/getTeamTransactionBasedData/${props.staff_id}`, {
          method: 'GET',
          onResponseError({ response }) {
            console.error('Error response:', response);
          },
        });

        if (res ) {
          total_deposit.value=res.total_deposit;
          total_withdraw.value=res.total_withdraw;
          total_clients.value=res.total_clients;
          total_ib.value=res.total_number_ib;
        } else {
          console.error('Failed to fetch group list or empty response');
        }
      } catch (err) {
        console.error('Error fetching group list:', err);
      }
    };

const widgetData = computed(() => [
  {
    title: 'TOTAL DEPOSIT',
    value: `$${total_deposit.value}`,
    desc: 'Deposits',
    icon: 'tabler-database-import',
    iconColor: 'success'
  },
  {
    title: 'TOTAL WITHDRAW',
    value: `$${total_withdraw.value}`,
    desc: 'Withdraw',
    icon: 'tabler-database-minus',
    iconColor: 'error'
  },
  {
    title: 'TOTAL CLIENT',
    value: total_clients.value,
    desc: 'Clients',
    icon: 'tabler-users',
    iconColor: 'success'
  },
  {
    title: 'TOTAL IB',
    value: total_ib.value,
    desc: 'Active IBs',
    icon: 'tabler-chart-arrows-vertical',
    iconColor: 'success'
  },
]);
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
