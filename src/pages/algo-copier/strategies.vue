<script setup>

import { onMounted, ref } from 'vue';
//import AlgoStrategiesUpdateDialog from '@/components/algocopier/Algo_StrategiesUpdateDialoge .vue';

// Reactive references to store data and errors
const algoData = ref(null);
const error = ref(null);
// CRUD Operations
const isStrategiesDetailsDialogVisible = ref(false);
const selectedStrategies = ref(null);

// Function to fetch data from the API
const fetchAlgoData = async () => {
  try {
    const res = await $api('/algo-copiers', {
      method: 'GET',
    });
    if (res) {
      algoData.value = res;
    }
    //console.log(algoData.value.length);
  } catch (err) {
    console.error('Error fetching algo list:', err);
    error.value = err;
  }
}

// Fetch data when the component is mounted
onMounted(() => {
  fetchAlgoData();
});

// Function to show details in the modal
const showDetails = (trans) => {
  selectedStrategies.value = trans;
  isStrategiesDetailsDialogVisible.value = true;
}




</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <VCol cols="12">
          <VCard>
            <VCardText>
              Strategies
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <VRow v-if="algoData">
      <VCol v-for="item in algoData" :key="item.id" cols="12" md="5" sm="6">
        <VCard>
          <VCardText>
            <h5 class="mb-0">{{ item.copier_name }}</h5>
            <span>Details</span>
            <VDivider></VDivider>
            <VList>
              <p class="mb-2">{{ item.strategy_description }}</p>
              <ul class="list-unstyled mb-6">
                <li class="mb-2">
                  <span class="h6 me-1">Minimum Deposit:</span>
                  <span>{{ item.minimum_amount }}</span>
                </li>
                <li class="mb-2">
                  <span class="h6 me-1">Group ID:</span>
                  <span>{{ item.group_id }}</span>
                </li>
                <li class="mb-2">
                  <span class="h6 me-1">Sub Label:</span>
                  <span>{{ item.copier_sublabel }}</span>
                </li>
                <li class="mb-2">
                  <span class="h6 me-1">Risk Score:</span>
                  <span>{{ item.risk_score }}</span>
                </li>

                <li class="mb-2">
                  <span class="h6 me-1">Commission Rate:</span>
                  <span>{{ item.commission_rate }}</span>
                </li>


                <li class="mb-2">
                  <span class="h6 me-1">Equity:</span>
                  <span>{{ item.equity }}</span>
                </li>

                <li class="mb-2">
                  <span class="h6 me-1">Lock Days:</span>
                  <span>{{ item.lock_days }}</span>
                </li>
                <li class="mb-2">
                  <span class="h6 me-1">Floating Profit:</span>
                  <span>{{ item.floating_profit }}</span>
                </li>
                <li class="mb-2">
                  <span class="h6 me-1">Balance:</span>
                  <span>{{ item.balance }}</span>
                </li>

                <li class="mb-2">
                  <span class="h6 me-1">Bonus:</span>
                  <span>{{ item.bonus }}</span>
                </li>
                <li class="mb-2">
                  <span class="h6 me-1">Leverage:</span>
                  <span>{{ item.leverage }}</span>
                </li>

                <li class="mb-2">
                  <span class="h6 me-1">Status:</span>
                  <span class="badge bg-label-success">Active</span>
                </li>
              </ul>
              <!-- BUTTON FOR UPDATE DETAILS -->
              <div class="text-left">
                <VBtn class="btn btn-primary mt-2" @click="showDetails(item)">
                  UPDATE
                </VBtn>
              </div>
            </VList>
          </VCardText>


        </VCard>
      </VCol>
    </VRow>
    <VSkeletonLoader v-else
                     v-for="i in 3"
                     :key="i"
                     type="card-avatar"
    />

  </section>
  <Algo_StrategiesDialog v-model:isDialogVisible="isStrategiesDetailsDialogVisible"
    :selectedStrategies="selectedStrategies" />
</template>

<style scoped lang="scss"></style>
