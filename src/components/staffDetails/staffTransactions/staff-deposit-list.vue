<script setup>
import { currency_list, fetchFilterData, payment_method_list } from "@/utils/apiUtils";
import { computed, onMounted, ref, watch, watchEffect } from 'vue';

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

const props = defineProps({
  staffId: {
    type: Number,
    required: true,
  },
})


const fetchDepositList = async () => {
  transData.value = null
  const res = await $api('/transactions/deposit-listing', {
    method: 'POST',
    body: {
      page: page.value,
      deposit_status: selectedDepositStatus.value,
      currency: selectedCurrency.value,
      payment_method: selectedPaymentMenthod.value,
      manager: props.staffId,
      keyword: searchQuery.value,
      mt5id: mt5SearchQuery.value,
      from_date: selectedFromDate.value,
      to_date: selectedToDate.value,
    },
    onResponseError({ response }) {
      // errors.value = response._data.message
    },
  })
  transData.value = res

}


const transactions = computed(() => transData.value?.transaction_details.data || [])
const totalTransactions = computed(() => transData.value?.transaction_details.total || 0)


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
    <VCard class="mb-6">
        <VRow>
          <VCol cols="12" sm="3">
            <AppSelect v-model="selectedDepositStatus" label="Deposit Status" placeholder="Deposit Status"
                       :items="deposit_status_list" clearable clear-icon="tabler-x" />
          </VCol>
          <!-- 👉 Select CURRENCY -->
          <VCol v-if="currency_list && currency_list.length > 2" cols="12" sm="3">
            <AppSelect v-model="selectedCurrency" label="Deposited Currency" placeholder="Deposited Currency"
                       :items="currency_list" clearable clear-icon="tabler-x" />
          </VCol>
          <!-- 👉 Select Country -->
          <VCol v-if="payment_method_list && payment_method_list.length > 1" cols="12" sm="3">
            <AppSelect v-model="selectedPaymentMenthod" label="Payment Method" placeholder="Payment Method"
                       :items="payment_method_list" clearable clear-icon="tabler-x" />
          </VCol>
        </VRow>
      <VRow class="pb-5">
        <VCol cols="12" sm="3">
          <AppTextField v-model="searchQuery" label="Search Client Name/Email" placeholder="Search client by name/email" />
        </VCol>
        <VCol cols="12" sm="3">
          <AppTextField v-model="mt5SearchQuery" label="Search By MT5 ID" placeholder="Search MT5 ID" />
        </VCol>
        <VCol cols="12" sm="3">
          <AppDateTimePicker v-model="selectedFromDate" label="From Date" placeholder="Select date" clearable
                             clear-icon="tabler-x" />
        </VCol>
        <VCol cols="12" sm="3">
          <AppDateTimePicker v-model="selectedToDate" label="To Date" placeholder="Select date" clearable clear-icon="tabler-x" />
        </VCol>

      </VRow>
      <VDivider class="" />
      <VTable v-if="transData" height="800" class="text-no-wrap">
        <thead>
        <tr>
          <th>
          </th>
          <th>
            NAME/EMAIL
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
          <th>
            ACT
          </th>
        </tr>
        </thead>

        <tbody>
        <tr v-if="transactions" class="" v-for="trans in transactions" :key="trans.transaction_id">

          <td class="text-caption me-0 ms-0">
            #{{ trans.transaction_id }}
            <br />
            {{ formatDateToMonthShort(trans.created_at) }}
          </td>

          <td>
            <CustomClientCardChip :client_id="trans.client_id" :client_name="trans.client_name"
                                  :email="trans.email" />
          </td>
          <td>
            <CustomMT5SmallChip :client_id="trans.client_id" :mt_id="trans.mt_id?.toString()"
                           :is_wallet="trans.is_wallet" />
          </td>

          <td>
            <span class="text-sm-h6">{{ formatCurrency(trans.amount_in_usd) }}</span>
          </td>
          <td>
             <span class="text-h6">{{ formatCurrency(trans.approved_amount) }}</span>
          </td>
          <td>
            {{ trans.deposit_method }}
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

  <CLIENT_DepositTicketDialog v-model:isDialogVisible="isTransactionDetailsDialogVisible"
                              :selectedTransaction="selectedTransaction" />
</template>
