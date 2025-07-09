<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { manager_list, withdraw_method_list } from "@/utils/apiUtils.js"
import CLIENT_TransAdjustTicketDialog from "@/components/dialogs/transactions/CLIENT_TransAdjustTicketDialog.vue"

// Reactive state definitions

const searchQuery = ref('');
const mt5SearchQuery = ref('');
const itemsPerPage = ref(20);
const page = ref(1);
const sortBy = ref(null);
const orderBy = ref(null);
const selectedManager = ref(null)
const transData = ref(null);
const selectedFromDate = ref(null);
const selectedToDate = ref(null);
const selectedTransType = ref(null)
const adj_types_list = [
  { title: 'All', value: null },
  { title: 'All Credit In', value: '6' },
  { title: 'LS Credit In', value: '0' },
  { title: 'NLS Credit In', value: '1' },
  { title: 'Credit Out', value: '2' },
  { title: 'Adjustments', value: '3' },
  { title: 'IB Commission', value: '4' },
]

const props = defineProps({
  staffId: {
    type: Number,
    required: true,
  },
})


const fetchTransactionAdjustments = async () => {
  const res = await $api('/transactions/trans-adj-listing', {
    method: 'POST',
    body: {
      page: page.value,
      manager: props.staffId,
      from_date: selectedFromDate.value,
      to_date: selectedToDate.value,
      mt5id: mt5SearchQuery.value,
      keyword: searchQuery.value,
      ta_type: selectedTransType.value,
    },
    onResponseError({ response }) {
      console.log(response);
      // errors.value = response._data.message
    },
  })
  transData.value = res;
  // console.log(transData.value.transaction_details.data);

}


const transactions = computed(() => transData.value?.transaction_details.data || []);
const totalTransactions = computed(() => transData.value?.transaction_details.total || 0);


// Call API on mounted

onMounted(async () => {
  fetchTransactionAdjustments();
});


watch([page, itemsPerPage, sortBy, orderBy, selectedManager, selectedTransType, searchQuery, mt5SearchQuery, selectedFromDate, selectedToDate], () => {
  fetchTransactionAdjustments();
}, { deep: true, immediate: false });


watchEffect(() => {

});

// Drawer visibility
const isAddNewUserDrawerVisible = ref(false);

// CRUD Operations
const isTransactionDetailsDialogVisible = ref(false);
const selectedTransaction = ref(null);

function showDetails(trans) {
  console.log(trans);
  selectedTransaction.value = trans;
  isTransactionDetailsDialogVisible.value = true;
}

</script>


<template>
  <section>

    <VCard class="mb-6">

        <VRow>
          <VCol cols="12" sm="3">
            <AppSelect v-model="selectedTransType" label="Transaction Types" placeholder="Transaction Type"
                       :items="adj_types_list" clearable clear-icon="tabler-x"
            />
          </VCol>
          <VCol cols="12" sm="3">
            <AppDateTimePicker
              v-model="selectedFromDate"
              label="From Date"
              placeholder="Select date"
              clearable clear-icon="tabler-x"
            />
          </VCol>
          <VCol cols="12" sm="3">
            <AppDateTimePicker
              v-model="selectedToDate"
              label="To Date"
              placeholder="Select date"
              clearable clear-icon="tabler-x"
            />
          </VCol>
        </VRow>

      <VRow class="mb-2">
        <VCol cols="12" sm="3">
          <AppTextField v-model="searchQuery" placeholder="Search client by name/email"/>
        </VCol>
        <VCol cols="12" sm="3">
          <AppTextField v-model="mt5SearchQuery" placeholder="Search MT5 ID"/>
        </VCol>
      </VRow>

      <VDivider/>

      <VTable v-if="transData" height="800" class="text-no-wrap">
        <thead>
        <tr>
          <th>

          </th>
          <th>
            NAME/EMAIL
          </th>
          <th>
            MT5 ID
          </th>
          <th>
            TYPE
          </th>
          <th>
            REQ.AMNT
          </th>

          <th>
            STATUS
          </th>
          <th>
            ACTIONS
          </th>
        </tr>
        </thead>

        <tbody>
        <tr v-if="transactions" class="" v-for="trans in transactions" :key="trans.transaction_id">

          <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
            #{{ trans.transaction_id }}
            <br/>
            {{ formatDateToMonthShort(trans.created_at) }}
          </td>

          <td>
            <CustomClientCardChip :client_id="trans.client_id" :client_name="trans.client_name" :email="trans.email"/>
          </td>


          <td>
            <CustomMT5SmallChip :client_id="trans.client_id" :mt_id="trans.mt_id" :is_wallet="trans.is_wallet"/>
          </td>

          <td>
            <VChip size="small" class="pr-1 pl-1 pt-1 pb-1">
              {{ trans.transaction_type }}
            </VChip>
          </td>
          <td>
            {{ formatCurrency(trans.amount) }}
          </td>

          <td>
            <VChip v-if="trans.status === 0" color="secondary" variant="">
              <VIcon start icon="tabler-hourglass-high"/>
            </VChip>
            <VChip v-if="trans.status === 1" color="warning" variant="">
              <VIcon start icon="tabler-info-square-rounded"/>
            </VChip>
            <VChip v-if="trans.status === 2" color="error" variant="">
              <VIcon start icon="tabler-ban"/>
            </VChip>
            <VChip v-if="trans.status === 3" color="success" variant="">
              <VIcon start icon="tabler-check"/>
            </VChip>
          </td>
          <td>
            <!-- <VIcon icon="tabler-trash me-2" /> -->

            <VIcon icon="tabler-eye me-2" @click="showDetails(trans)"/>
          </td>

        </tr>
        <VSkeletonLoader v-else type="table-tbody" />
        </tbody>
      </VTable>
      <VSkeletonLoader v-else type="table-tbody" />
      <VCardText class="pt-2">
        <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">
          <VPagination v-model="page" :total-visible="$vuetify.display.smAndDown ? 3 : 5"
                       :length="Math.ceil(totalTransactions / itemsPerPage)"
          />
        </div>
      </VCardText>
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New User -->
    <!--  <AddNewUserDrawer
  v-model:isDrawerOpen="isAddNewUserDrawerVisible"
  @user-data="addNewUser"
/> -->
  </section>

  <CLIENT_TransAdjustTicketDialog v-model:isDialogVisible="isTransactionDetailsDialogVisible"
                                  :selectedTransaction="selectedTransaction"
  />
</template>
