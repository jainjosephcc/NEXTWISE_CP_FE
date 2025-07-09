<script setup>
import { currency_list, fetchFilterData, payment_method_list } from "@/utils/apiUtils"
import { computed, onMounted, ref, watch, watchEffect } from 'vue'

// Reactive state definitions
const searchQuery = ref('')
const mt5SearchQuery = ref('')
const selectedMTStatus = ref(null)
const selectedDepositStatus = ref(null)
const selectedDocStatus = ref(null)
const selectedCurrency = ref(null)
const selectedPaymentMenthod = ref(null)


const selectedIBStatus = ref(null)
const selectedFromDate = ref(null)
const selectedToDate = ref(null)
const transHeaderData = ref(null)
const selectedManager = ref(null)
const selectedPercentage = ref(null)

const deposit_status_list = [
  { title: 'All', value: null },
  { title: 'Pending', value: '0' },
  { title: 'On Hold', value: '1' },
  { title: 'Rejected', value: '2' },
  { title: 'Approved', value: '3' },
]

const itemsPerPage = ref(20)
const page = ref(1)
const sortBy = ref(null)
const orderBy = ref(null)

const transData = ref(null)


const fetchDepositList = async () => {
  transData.value = null
  const res = await $api('/transactions/deposit-listing', {
    method: 'POST',
    body: {
      page: page.value,
      deposit_status: selectedDepositStatus.value,
      currency: selectedCurrency.value,
      payment_method: selectedPaymentMenthod.value,
      manager: selectedManager.value,
      keyword: searchQuery.value,
      mt5id: mt5SearchQuery.value,
      from_date: selectedFromDate.value,
      to_date: selectedToDate.value,
      bonus_percentage: selectedPercentage.value,
    },
    onResponseError({ response }) {
      // errors.value = response._data.message
    },
  })
  transData.value = res

}


const transactions = computed(() => transData.value?.transaction_details.data || [])
const totalTransactions = computed(() => transData.value?.transaction_details.total || 0)

// Download related states
const isDownloading = ref(false)
const downloadFormat = ref('xlsx') // Default format

// Define available download formats
const downloadFormats = [
  { title: 'Excel (XLSX)', value: 'xlsx' },
  { title: 'CSV', value: 'csv' },
]

// Download functionality
const downloadDepositListing = async () => {
  isDownloading.value = true
  try {
    const response = await $api('/transactions/deposit-listing/download', {
      method: 'POST',
      responseType: 'blob', // Important for handling binary data
      body: {
        // Pass the same filters as fetchDepositList
        deposit_status: selectedDepositStatus.value,
        currency: selectedCurrency.value,
        payment_method: selectedPaymentMenthod.value,
        manager: selectedManager.value,
        keyword: searchQuery.value,
        mt5id: mt5SearchQuery.value,
        from_date: selectedFromDate.value,
        to_date: selectedToDate.value,
        bonus_percentage: selectedPercentage.value,
        // Specify the format based on user selection
        format: downloadFormat.value, // 'xlsx' or 'csv'
      },
      onResponseError({ response }) {
        // Handle errors here, e.g., display a notification
      },
    })

    // Create a blob from the response
    const blob = new Blob([response], { type: response.type })

    // Extract filename from headers if available, else use default
    const contentDisposition = response.headers.get('Content-Disposition')
    let fileName = 'deposit_listing.' + downloadFormat.value // Default filename
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/)
      if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1]
    }

    // Trigger the download using FileSaver
    saveAs(blob, fileName)

  } catch (error) {
    console.error('Download failed:', error)
    // Optionally, display an error notification to the user
  } finally {
    isDownloading.value = false
  }
}


// Call API on mounted

onMounted(async () => {
  await fetchFilterData()
  await fetchDepositList()
})

// Watching sort options to refetch data
watch([page, itemsPerPage, selectedMTStatus, mt5SearchQuery, selectedFromDate, selectedToDate, selectedManager, selectedDepositStatus, selectedDocStatus, selectedCurrency, selectedPaymentMenthod, selectedIBStatus, searchQuery, sortBy, orderBy], () => {
  fetchDepositList()
}, { deep: true, immediate: false })


watchEffect(() => {

})


// Drawer visibility
const isAddNewUserDrawerVisible = ref(false)

// CRUD Operations
const isTransactionDetailsDialogVisible = ref(false)
const selectedTransaction = ref(null)

function showDetails(trans) {
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
        DEPOSIT LIST
      </VCardText>
      <VDivider/>
      <VCardText>
        <VRow>

          <VCol cols="12" sm="2" v-if="deposit_status_list && deposit_status_list.length > 0">
            <AppSelect v-model="selectedDepositStatus" label="Deposit Status" placeholder="Deposit Status"
                       :items="deposit_status_list" clearable clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select CURRENCY -->
          <VCol v-if="currency_list && currency_list.length > 2" cols="12" sm="2">
            <AppSelect v-model="selectedCurrency" label="Deposited Currency" placeholder="Deposited Currency"
                       :items="currency_list" clearable clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Country -->
          <VCol v-if="payment_method_list && payment_method_list.length > 1" cols="12" sm="2">
            <AppSelect v-model="selectedPaymentMenthod" label="Payment Method" placeholder="Payment Method"
                       :items="payment_method_list" clearable clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select ASSIGNED MANAGER -->
          <CustomManagerSelectWidget v-if="hasAccess('view_all_clients') || hasAccess('view_my_team_clients')"
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

          <VBtn color="primary" @click="downloadDepositListing" :loading="isDownloading">
            <VIcon left>mdi-download</VIcon>
            Download
          </VBtn>
        </div>
      </VCardText>


      <VDivider/>
      <VTable v-if="transData" height="800" class="text-no-wrap">
        <thead>
        <tr>
          <th>

          </th>
          <th>
            NAME|EMAIL
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
            APP.AMNT
          </th>
          <th>
            METHOD
          </th>
          <th>
            STATUS
          </th>
          <th v-if="hasAccess('view_deposit_details_page')">
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
            <CustomClientCardChip :client_id="trans.client_id" :client_name="trans.client_name"
                                  :email="trans.email"
            />
          </td>
          <td>
            <CustomStaffCardChip v-if="trans.manager_id" :rm_id="trans.manager_id" :rm_name="trans.rm_name"/>
            <VChip v-else size="x-small" variant="outlined">
              <span class="text-caption text-xs">RM NOT MAPPED</span>
            </VChip>
          </td>
          <td>
            <CustomMT5Chip :client_id="trans.client_id" :mt_id="trans.mt_id?.toString()"
                           :is_wallet="trans.is_wallet"
            />
          </td>

          <td>
            {{ formatCurrency(trans.amount_in_usd) }}
          </td>
          <td>
            {{ formatCurrency(trans.approved_amount) }}
          </td>
          <td>
            {{ trans.deposit_method }}
          </td>
          <td>
            <CustomTransactionStatusChip :trans_status="trans.status"/>
          </td>
          <td v-if="hasAccess('view_deposit_details_page')">
            <VBtn color="secondary" size="x-small" variant="elevated" class="px-2 me-2 rounded"
                  icon="tabler-file-description" @click="showDetails(trans)"
            >
            </VBtn>
          </td>

        </tr>
        <VSkeletonLoader v-else type="table-tbody"/>
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

  <CLIENT_DepositTicketDialog v-model:isDialogVisible="isTransactionDetailsDialogVisible"
                              :selectedTransaction="selectedTransaction"
  />
</template>
