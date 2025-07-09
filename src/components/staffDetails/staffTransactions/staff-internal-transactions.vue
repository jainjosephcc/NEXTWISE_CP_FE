<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { manager_list, withdraw_method_list } from "@/utils/apiUtils.js"
import CLIENT_InternalTransactionDialog from "@/components/dialogs/transactions/CLIENT_InternalTransactionDialog.vue"

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


const props = defineProps({
  staffId: {
    type: Number,
    required: true,
  },
})

const fetchInternalTransactions = async () => {
  const res = await $api('/transactions/internal-listing', {
    method: 'POST',
    body: {
      page: page.value,
      manager:props.staffId,
      from_date:selectedFromDate.value,
      to_date:selectedToDate.value,
      mt5id:mt5SearchQuery.value,
      keyword: searchQuery.value,
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
  fetchInternalTransactions();
});


watch([page, itemsPerPage, sortBy, orderBy,selectedManager,searchQuery,mt5SearchQuery,selectedFromDate,selectedToDate], () => {
  fetchInternalTransactions();
}, { deep: true, immediate: false });



watchEffect(() => {

});

// Drawer visibility
const isAddNewUserDrawerVisible = ref(false);

// CRUD Operations
const isTransactionDetailsDialogVisible = ref(false);
const selectedTransaction = ref(null);

function showDetails(trans) {
  selectedTransaction.value = trans;
  isTransactionDetailsDialogVisible.value = true;
}

</script>


<template>
  <section>
    <!-- 👉 Widgets -->
    <VCard class="mb-6">

      <VRow class="mb-2">
        <VCol cols="12" sm="3">
          <AppTextField label="Search by Name/Email" v-model="searchQuery" placeholder="Search client by name/email" />
        </VCol>
        <VCol cols="12" sm="3">
          <AppTextField label="Search by MT5 ID" v-model="mt5SearchQuery" placeholder="Search MT5 ID" />
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

      <VDivider />

      <VTable v-if="transData" height="800" class="text-no-wrap">
        <thead>
        <tr>
          <th>

          </th>
          <th>
            NAME/EMAIL
          </th>
          <th>
            FROM
          </th>
          <th>
            TO
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
            <VChip size="x-small">
              #{{ trans.transaction_id }}
            </VChip><br />
            {{ formatDateToMonthShort(trans.created_at) }}
          </td>

          <td>
            <CustomClientCardChip :client_id="trans.client_id" :client_name="trans.client_name" :email="trans.email"/>
          </td>


          <td>
            <CustomMT5SmallChip :client_id="trans.client_id" :mt_id="trans.from_mt_id" :is_wallet="trans.from_mt_wallet"/>
          </td>

          <td>
            <CustomMT5SmallChip :client_id="trans.client_id" :mt_id="trans.to_mt_id" :is_wallet="trans.to_mt_wallet"/>
          </td>
          <td>
            {{ formatCurrency(trans.trans_amount) }}
          </td>

          <td>
            <VChip v-if="trans.status === 0" color="secondary" variant="">
              <VIcon start icon="tabler-hourglass-high" />
            </VChip>
            <VChip v-if="trans.status === 1" color="warning" variant="">
              <VIcon start icon="tabler-info-square-rounded" />
            </VChip>
            <VChip v-if="trans.status === 2" color="error" variant="">
              <VIcon start icon="tabler-ban" />
            </VChip>
            <VChip v-if="trans.status === 3" color="success" variant="">
              <VIcon start icon="tabler-check" />
            </VChip>
          </td>
          <td>
            <!-- <VIcon icon="tabler-trash me-2" /> -->

            <VIcon icon="tabler-eye me-2" @click="showDetails(trans)" />
          </td>

        </tr>
        <VSkeletonLoader v-else type="table-tbody" />
        </tbody>
      </VTable>
      <VSkeletonLoader v-else type="table-tbody" />
      <VCardText class="pt-2">
        <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">
          <VPagination v-model="page" :total-visible="$vuetify.display.smAndDown ? 3 : 5"
                       :length="Math.ceil(totalTransactions / itemsPerPage)" />
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

  <CLIENT_InternalTransactionDialog v-model:isDialogVisible="isTransactionDetailsDialogVisible"
                                    :selectedTransaction="selectedTransaction" />
</template>
