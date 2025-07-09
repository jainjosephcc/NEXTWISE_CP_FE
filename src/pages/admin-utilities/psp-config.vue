<script setup>

const pspList=ref(null);
const currentTab = ref('window-1')
const currencyEntityList=ref(null);
const pspListData=ref(null);
const psp_id=ref(0);
const entityList=ref(null);
const currencyList=ref(null);
const selectedEntities=ref([]);
const selectedCurrencies=ref([]);


const fetchPspList= () => fetchDataWithLocalStorage('pspListData', 'getPspList', pspListData);
watch(pspListData, (newVal) => {
  if(newVal){
    pspList.value=newVal.psp_list;
    currentTab.value = pspList.value[0].id;
  }
});

onMounted(async () => {
  fetchPspList();
  fetchCurrencyEntityList();
});


const fetchCurrencyEntityList = async () => {
  const res = await $api(`/getEntityAndCurrencyList/${psp_id.value}`, {
    method: 'GET',
    onResponseError({ response }) {
      //console.log(response);
      // errors.value = response._data.message
    },
  })
  if(res){
    currencyEntityList.value=res;
    entityList.value=currencyEntityList.value.entity_list
    currencyList.value=currencyEntityList.value.currency_list;
    console.log(currencyList.value);
  }
  // console.log(mt5ListData.value);
}
watch(selectedCurrencies, (newVal) => {
      // console.log('Selected Entities:', newVal);
    });
    

function getCurrencyAndEntities(id){
  psp_id.value=id;
  fetchCurrencyEntityList()
}


</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <VRow class="mb-6">
    <VCol cols="12">
      <VCard>
        <VCardTitle>
          PSP Configuration
        </VCardTitle>
      </VCard>
    </VCol>
    <VCol cols="12" class="d-flex gap-6">
      <!-- Tabs Card -->
      <VCard class="flex-shrink-0" style="width: 250px;">
        <VCardItem>
          <VTabs v-model="currentTab" direction="vertical" class="v-tabs-pill">
            <VTab v-for="psp in pspList" :key="psp.id" :value="psp.id" @click="getCurrencyAndEntities(psp.id)">
              <VIcon start icon="tabler-building-bank" /> 
              {{ psp.payment_name }}
            </VTab>
          </VTabs>
        </VCardItem>
      </VCard>

      <!-- Window Content Card -->
      <VCard class="flex-grow-1">
        <VCardItem>
          <VWindow v-model="currentTab">
            <VWindowItem v-for="psp in pspList" :key="psp.id" :value="psp.id">
              <VCard>
                <VCardTitle>
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div>
                      Entities
                    </div>
                    <div>
                      <VBtn class="me-2">Update</VBtn>
                    </div>
                  </div>
                  <VDivider/>
                  <VRow class="mt-3">
                    <VCol cols="6" v-for="entity in entityList" :key="entity.id">
                      <VCheckbox
                        v-model="selectedEntities"
                        :label="entity.entity_name"
                        :value="entity.id"
                      />
                    </VCol>
                  </VRow>
                </VCardTitle>
                  <VCardTitle class="mt-4">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div>
                      Currencies
                    </div>
                    <div>
                      <VBtn class="me-2">Update</VBtn>
                    </div>
                  </div>
                  <VDivider/>
                  <VRow class="mt-3">
                    <!-- {{currencyList}} -->
                    <VCol cols="6" v-for="currency in currencyList" :key="currency.id">
                      <VCheckbox
                        v-model="selectedCurrencies"
                        :label="currency.currency"
                        :value="currency.id"
                      />
                    </VCol>
                  </VRow>
                </VCardTitle>
              </VCard>
            </VWindowItem>
          </VWindow>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
  </section>
</template>

<style scoped lang="scss">

</style>
