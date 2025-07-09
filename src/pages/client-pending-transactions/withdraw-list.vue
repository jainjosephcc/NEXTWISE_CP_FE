<script setup>
import { fetchFilterData, currency_list, payment_method_list, withdraw_method_list } from "@/utils/apiUtils"
import { computed, ref } from "vue"

// Reactive state definitions
const searchQuery = ref('')
const mt5SearchQuery = ref('')
const selectedMTStatus = ref(null)
const selectedWithdrawStatus = ref(null)
const selectedDocStatus = ref(null)
const selectedFromDate = ref(null)
const selectedToDate = ref(null)
const selectedManager = ref(null)
const selectedCurrency = ref(null)
const selectedWithdrawMethod = ref(null)
const selectedIBStatus = ref(null)
const transHeaderData = ref(null)
const itemsPerPage = ref(20)
const page = ref(1)
const sortBy = ref(null)
const orderBy = ref(null)
const transData = ref(null)

const withdraw_status_list = [
  { title: 'All', value: null },
  { title: 'Pending', value: '0' },
  { title: 'On Hold', value: '1' },
  { title: 'Rejected', value: '2' },
  { title: 'Approved', value: '3' },
  { title: 'Cancelled', value: '6' },
]

const fetchWithdrawList = async () => {
  transData.value = null
  const res = await $api('/transactions/withdraw-listing', {
    method: 'POST',
    body: {
      page: page.value,
      withdraw_status: "0",
      currency: selectedCurrency.value,
      withdraw_method: selectedWithdrawMethod.value,
      manager: selectedManager.value,
      keyword: searchQuery.value,
      mt5id: mt5SearchQuery.value,
      from_date: selectedFromDate.value,
      to_date: selectedToDate.value,
    },
    onResponseError({ response }) {
      console.log(response)
      // errors.value = response._data.message
    },
  })
  transData.value = res

}

const transactions = computed(() => transData.value?.transaction_details.data || [])
const totalTransactions = computed(() => transData.value?.transaction_details.total || 0)

onMounted(async () => {
  await fetchWithdrawList()
  await fetchFilterData()
})

// Watching sort options to refetch data
watch([page, itemsPerPage, selectedManager, selectedFromDate, selectedToDate, mt5SearchQuery, selectedMTStatus, selectedWithdrawStatus, selectedDocStatus, selectedCurrency, selectedWithdrawMethod, selectedIBStatus, searchQuery, sortBy, orderBy], () => {
  fetchWithdrawList()
}, { deep: true, immediate: false })


watchEffect(() => {

})


// Drawer visibility
const isAddNewUserDrawerVisible = ref(false)

// CRUD Operations
const isTransactionDetailsDialogVisible = ref(false)
const selectedTransaction = ref(null)

function showDetails(trans) {
  //console.log(trans);
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
        PENDING WITHDRAW LIST
      </VCardText>
      <VDivider/>
      <VCardText>
        <VRow>
          <VCol cols="12" sm="3">
            <AppSelect v-model="selectedWithdrawStatus" label="Withdraw Status" placeholder="Withdraw Status"
                       :items="withdraw_status_list" clearable clear-icon="tabler-x"
            />
          </VCol>
          <VCol v-if="withdraw_method_list && withdraw_method_list.length > 1" cols="12" sm="3">
            <AppSelect v-model="selectedWithdrawMethod" label="Withdraw Method" placeholder="Withdraw Method"
                       :items="withdraw_method_list" clearable clear-icon="tabler-x"
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

        </div>
      </VCardText>


      <VDivider/>
      <VTable v-if="transData" height="800" class="text-no-wrap">
        <thead>
        <tr>
          <th class="px-0 py-0">

          </th>
          <th>
            NAME | EMAIL
          </th>
          <th>
            ASSIGNED RM
          </th>
          <th>
            TO
          </th>
          <th>
            REQ.AMNT
          </th>
          <th>
            METHOD
          </th>
          <th>
            STATUS
          </th>
          <th v-if="hasAccess('view_withdraw_details_page')">
            VIEW
          </th>
        </tr>
        </thead>

        <tbody>
        <tr v-if="transactions" class="" v-for="trans in transactions" :key="trans.transaction_id">

          <td class="text-caption me-0 ms-0 px-0 py-0" style="padding-left: 2px;">
            <VChip size="x-small">
              #{{ trans.transaction_id }}
            </VChip>
            <br/>
            {{ formatDateToMonthShort(trans.created_at) }}
          </td>

          <td>
            <CustomClientCardChip :client_id="trans.c_id" :client_name="trans.c_name" :email="trans.c_email"/>
          </td>
          <td>
            <CustomStaffCardChip v-if="trans.manager_id" :rm_id="trans.manager_id" :rm_name="trans.rm_name"/>
            <VChip v-else size="x-small" variant="outlined">
              <span class="text-caption text-xs">RM NOT MAPPED</span>
            </VChip>
          </td>


          <td>
            <CustomMT5Chip :client_id="trans.c_id" :mt_id="trans.from?.toString()" :is_wallet="trans.is_wallet"/>
          </td>

          <td>
            {{ formatCurrency(trans.amount_req) }}
          </td>
          <td>
            {{ trans.withdraw_method }}
          </td>
          <td>
            <CustomTransactionStatusChip :trans_status="trans.status"/>
          </td>
          <td v-if="hasAccess('view_withdraw_details_page')">
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

  <CLIENT_WithdrawTicketDialog v-model:isDialogVisible="isTransactionDetailsDialogVisible"
                               :selectedTransaction="selectedTransaction"
  />
</template>
