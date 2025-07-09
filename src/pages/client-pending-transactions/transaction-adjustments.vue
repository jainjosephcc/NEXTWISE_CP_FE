<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { manager_list, withdraw_method_list } from "@/utils/apiUtils.js"
import CLIENT_TransAdjustTicketDialog from "@/components/dialogs/transactions/CLIENT_TransAdjustTicketDialog.vue"

// Reactive state definitions

const searchQuery = ref('')
const mt5SearchQuery = ref('')
const itemsPerPage = ref(20)
const page = ref(1)
const sortBy = ref(null)
const orderBy = ref(null)
const selectedManager = ref(null)
const selectedTransStatus = ref(null)
const transData = ref(null)
const selectedFromDate = ref(null)
const selectedToDate = ref(null)
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

const ta_status_list = [
  { title: 'All', value: null },
  { title: 'Pending', value: '0' },
  { title: 'On Hold', value: '1' },
  { title: 'Rejected', value: '2' },
  { title: 'Approved', value: '3' },
]


const fetchTransactionAdjustments = async () => {
  const res = await $api('/transactions/trans-adj-listing', {
    method: 'POST',
    body: {
      page: page.value,
      manager: selectedManager.value,
      from_date: selectedFromDate.value,
      to_date: selectedToDate.value,
      mt5id: mt5SearchQuery.value,
      keyword: searchQuery.value,
      ta_type: selectedTransType.value,
      ta_status: "0",
    },
    onResponseError({ response }) {
      console.log(response)
      // errors.value = response._data.message
    },
  })
  transData.value = res
  // console.log(transData.value.transaction_details.data);

}


const transactions = computed(() => transData.value?.transaction_details.data || [])
const totalTransactions = computed(() => transData.value?.transaction_details.total || 0)


// Call API on mounted

onMounted(async () => {
  fetchTransactionAdjustments()
})


watch([page, itemsPerPage, sortBy, orderBy, selectedManager, selectedTransType, searchQuery, mt5SearchQuery, selectedFromDate, selectedToDate], () => {
  fetchTransactionAdjustments()
}, { deep: true, immediate: false })


watchEffect(() => {

})

// Drawer visibility
const isAddNewUserDrawerVisible = ref(false)

// CRUD Operations
const isTransactionDetailsDialogVisible = ref(false)
const selectedTransaction = ref(null)

function showDetails(trans) {
  console.log(trans)
  selectedTransaction.value = trans
  isTransactionDetailsDialogVisible.value = true
}

</script>


<template>
  <section>
    <!-- 👉 HEADER WIDGET START-->
    <CustomPageHeaderWidget/>
    <!-- 👉 HEADER WIDGET END-->

    <!-- 👉 Widgets -->
    <VCard class="mb-6">
      <VCardText class="py-4">
        PENDING TRANSACTION ADJUSTMENTS
      </VCardText>
      <VDivider/>
      <VCardText>
        <VRow>

          <VCol cols="12" sm="3">
            <AppSelect v-model="selectedTransStatus" label="Transaction Status" placeholder="Transaction Status"
                       :items="ta_status_list" clearable clear-icon="tabler-x"
            />
          </VCol>


          <VCol cols="12" sm="2">
            <AppSelect v-model="selectedTransType" label="Transaction Types" placeholder="Transaction Type"
                       :items="adj_types_list" clearable clear-icon="tabler-x"
            />
          </VCol>


          <!-- 👉 Select ASSIGNED MANAGER -->
          <CustomManagerSelectWidget v-if="hasAccess('view_all_clients')||hasAccess('view_my_team_clients')"
                                     v-model="selectedManager"
          />
          <!-- 👉 Select ASSIGNED MANAGER -->

          <VCol cols="12" sm="2">
            <AppDateTimePicker v-model="selectedFromDate" label="From Date" placeholder="Select date" clearable
                               clear-icon="tabler-x"
            />
          </VCol>

          <VCol cols="12" sm="2">
            <AppDateTimePicker v-model="selectedToDate" label="To Date" placeholder="Select date" clearable
                               clear-icon="tabler-x"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider/>


      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField v-model="searchQuery" placeholder="Search client by name/email"/>
          </div>
        </div>

        <div class="me-3 d-flex gap-3">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField v-model="mt5SearchQuery" placeholder="Search MT5 ID"/>
          </div>
        </div>
        <VSpacer/>

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">

          <p class="card-subtitle pt-3">TOTAL LISTED COUNT : {{ totalTransactions ? totalTransactions : 0 }}</p>
          <!-- 👉 Export button -->

        </div>
      </VCardText>
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
            ASSIGNED RM
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
          <th v-if="hasAccess('view_transaction_adjustment_details_page')">
            VIEW
          </th>
        </tr>
        </thead>

        <tbody>
        <tr v-if="transactions" class="" v-for="trans in transactions" :key="trans.transaction_id">

          <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
            <VChip size="x-small">
              #{{ trans.transaction_id }}
            </VChip>
            <br/>
            {{ formatDateToMonthShort(trans.created_at) }}
          </td>

          <td>
            <CustomClientCardChip :client_id="trans.client_id" :client_name="trans.client_name" :email="trans.email"
            />
          </td>

          <td>
            <CustomStaffCardChip v-if="trans.manager_id" :rm_id="trans.manager_id" :rm_name="trans.rm_name"/>
            <VChip v-else size="x-small" variant="outlined">
              <span class="text-caption text-xs">RM NOT MAPPED</span>
            </VChip>
          </td>


          <td>
            <CustomMT5Chip :client_id="trans.client_id" :mt_id="trans.mt_id" :is_wallet="trans.is_wallet"/>
          </td>

          <td>
            <VChip size="small" class="pr-3 pl-3 pt-1 pb-1">
              {{ trans.transaction_type }}
            </VChip>
          </td>
          <td>
            {{ formatCurrency(trans.amount) }}
          </td>

          <td>
            <CustomTransactionStatusChip :trans_status="trans.status"/>
          </td>
          <td v-if="hasAccess('view_transaction_adjustment_details_page')">
            <VBtn
              color="secondary"
              size="x-small"
              variant="elevated"
              class="px-2 me-2 rounded"
              icon="tabler-file-description"
              @click="showDetails(trans)"
            >
            </VBtn>
          </td>

        </tr>
        <VProgressLinear v-else indeterminate color="primary"/>
        </tbody>
      </VTable>
      <VSkeletonLoader v-else type="table-tbody"/>
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
