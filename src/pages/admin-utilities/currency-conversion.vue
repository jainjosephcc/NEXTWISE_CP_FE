<script setup>
import { onMounted, ref } from 'vue';

const currencylist = ref(null); // Initialize as an empty array
const isCurrencyUpdateModalVisible = ref(false);
const selectedCurrency = ref(null);
// Function to fetch data from the API getCurrencies
const fetchCurrencies = async () => {
  try {
    const res = await $api('/getCurrencies', {
      method: 'GET',
    });
    if (res && res.currency) {
      currencylist.value = res.currency; // Access the 'currency' array from the response
    } else {
      console.warn('Currency data not found:', res);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Calling functions
onMounted(() => {
  fetchCurrencies();
});
//to show modal data
function showUpdateGroupModal(tran) {
  selectedCurrency.value = tran;
  isCurrencyUpdateModalVisible.value = true;
}
</script>

<template>
  <section>
    <!-- Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <VCol cols="12">
          <VCard>
            <VCardText>
              Currency Conversion
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <VCard class="custom-card">
      <VCardItem>
        <VCardTitle>Manage Currency Data</VCardTitle>
        <VCardSubtitle>
          USD Conversion
        </VCardSubtitle>
      </VCardItem>
      <VCardText>
        <VList v-if="currencylist" class="card-list">
          <VListItem v-for="item in currencylist" :key="item.id">
            <template #prepend>
              <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>

                {{ item.currency }}

              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium me-2">
              1

            </VListItemTitle>
            <VListItemSubtitle class="me-4">
              {{ item.code }}
            </VListItemSubtitle>

            <template #append>
              <div class="d-flex align-center gap-x-2">
                <div class="text-body-1">
                  {{ item.to_usd }}
                </div>
                <div class="text-body-1">
                  USD
                </div>
                <VChip :label="false" color="success" v-if="item.status == 1">
                  <small>Active</small>
                </VChip>
                <VChip :label="false" color="error" v-else>
                  <small>Inactive</small>
                </VChip>
                <VIcon icon="tabler-edit" @click="showUpdateGroupModal(item)" />
              </div>
            </template>
          </VListItem>
        </VList>
        <VSkeletonLoader v-else type="table-tbody" />

      </VCardText>
    </VCard>

  </section>
  <UpdateCurrencyDialog v-model:isDialogVisible="isCurrencyUpdateModalVisible" :selectedCurrency="selectedCurrency" />
</template>

<style lang="scss" scoped>
.custom-card {
  max-width: 600px;
  /* Adjust the max width as needed */
  margin: 0 auto;
  // Center the card */
}

.card-list {
  --v-card-list-gap: 1.5rem;
}
</style>
