<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { manager_list, withdraw_method_list } from "@/utils/apiUtils.js"
import CLIENT_InternalTransactionDialog from "@/components/dialogs/transactions/CLIENT_InternalTransactionDialog.vue"

// Reactive state definitions

const searchQuery = ref('')
const mt5SearchQuery = ref('')
const itemsPerPage = ref(20)
const page = ref(1)
const sortBy = ref(null)
const orderBy = ref(null)
const selectedManager = ref(null)
const transData = ref(null)
const selectedFromDate = ref(null)
const selectedToDate = ref(null)


const fetchInternalTransactions = async () => {
  const res = await $api('/transactions/internal-listing', {
    method: 'POST',
    body: {
      page: page.value,
      manager: selectedManager.value,
      from_date: selectedFromDate.value,
      to_date: selectedToDate.value,
      mt5id: mt5SearchQuery.value,
      keyword: searchQuery.value,
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
  fetchInternalTransactions()
})


watch([page, itemsPerPage, sortBy, orderBy, selectedManager, searchQuery, mt5SearchQuery, selectedFromDate, selectedToDate], () => {
  fetchInternalTransactions()
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
        INTERNAL TRANSACTIONS
      </VCardText>
      <VDivider/>
      <VCardText>
        <VRow>

          <!-- 👉 Select ASSIGNED MANAGER -->
          <CustomManagerSelectWidget v-if="hasAccess('view_all_clients')||hasAccess('view_my_team_clients')"
                                     v-model="selectedManager"
          />
          <!-- 👉 Select ASSIGNED MANAGER -->

          <VCol cols="12" sm="2">
            <AppDateTimePicker
              v-model="selectedFromDate"
              label="From Date"
              placeholder="Select date"
              clearable clear-icon="tabler-x"
            />
          </VCol>

          <VCol cols="12" sm="2">
            <AppDateTimePicker
              v-model="selectedToDate"
              label="To Date"
              placeholder="Select date"
              clearable clear-icon="tabler-x"
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
            MAPPED RM
          </th>
          <th>
            FROM
          </th>
          <th>
            TO
          </th>
          <th>
            TRNS.AMNT
          </th>
          <th>
            STATUS
          </th>
          <th v-if="hasAccess('view_internal_transfer_details_page')">
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
            <CustomClientCardChip :client_id="trans.client_id" :client_name="trans.client_name" :email="trans.email"/>
          </td>
          <td>
            <CustomStaffCardChip v-if="trans.manager_id" :rm_id="trans.manager_id" :rm_name="trans.rm_name"/>
            <VChip v-else size="x-small" variant="outlined">
              <span class="text-caption text-xs">RM NOT MAPPED</span>
            </VChip>
          </td>


          <td>
            <CustomMT5Chip :client_id="trans.client_id" :mt_id="trans.from_mt_id" :is_wallet="trans.from_mt_wallet"/>
          </td>

          <td>
            <CustomMT5Chip :client_id="trans.client_id" :mt_id="trans.to_mt_id" :is_wallet="trans.to_mt_wallet"/>
          </td>
          <td>
            {{ formatCurrency(trans.trans_amount) }}
          </td>

          <td>
            <CustomTransactionStatusChip :trans_status="trans.status"/>
          </td>
          <td v-if="hasAccess('view_internal_transfer_details_page')">
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

  <CLIENT_InternalTransactionDialog v-model:isDialogVisible="isTransactionDetailsDialogVisible"
                                    :selectedTransaction="selectedTransaction"
  />
</template>
