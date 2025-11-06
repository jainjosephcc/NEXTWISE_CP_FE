<script setup>


// Reactive References
import AppSelect from "@core/components/app-form-elements/AppSelect.vue";
import { ref } from "vue";

import UpdateSlavesDialogue from "@/components/dialogs/Slave/UpdateSlavesDialogue.vue";

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'SLAVE', key: 'slave' },
  { title: 'MASTER', key: 'master' },
  { title: 'STRATEGY', key: 'strategy' },
  { title: 'CONFIG', key: 'config' },
  { title: 'COMMISSION', key: 'commission' },
  { title: 'STATUS', key: 'status' },
  { title: 'ACTION', key: 'action' },
]

const resolveStatusVariant = (status) => {
  if (status === 1)
    return { color: 'primary', text: 'Current' }
  else if (status === 2)
    return { color: 'success', text: 'Professional' }
  else if (status === 3)
    return { color: 'error', text: 'Rejected' }
  else if (status === 4)
    return { color: 'warning', text: 'Resigned' }
  else
    return { color: 'info', text: 'Applied' }
}

const isEditSlaveDialogVisible = ref(false)
const serverDetails = ref({})
const serverList = ref([])
const masterList = ref([])
const masterDetails = ref({})
const slaveList = ref([])
const masterDropDown = ref([])
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
const selectedSlaveDetails = ref(null)
const isBtnLoading = ref(false)
const isAddSlaveDialogVisible = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const successTitle = ref('')
const successMessage = ref('')
const searchQuery = ref('')
const masterId = ref(null)
const serverId = ref(false)
const isLoading = ref(false)
const slaveId = ref(null)
const isDeleteDialogVisible = ref(false)
const isChangeServerDialogVisible = ref(false)

const downloadBtnLoading = ref(false)
const switchMe = ref(false)

const isDisabled = computed(() => switchMe.value)
onMounted(async () => {
  await fetchServerList()
})

const itemsPerPage = ref(15) // How many items to display per page
const currentPage = ref(1) // Current page of the pagination
const lastPage = ref(1) // Total number of pages (from API)
const totalUsers = ref(0)

// Fetch server list (GET /meta-servers)
const fetchServerList = async () => {
  try {
    const res = await $api('/meta-servers', {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error fetching server list:', response)
      },
    })
    serverList.value = res.data
    if (serverList.value.length) {
      serverDetails.value = serverList.value[0] // Select the first server
      serverId.value = serverDetails.value.id
      await fetchMasterData(serverDetails.value.id) // Fetch masters for the selected server
    }
  } catch (error) {
    console.error('Error fetching server list:', error)
  }
}

const fetchMasterData = async () => {
  try {
    const res = await $api(`/masters?server_id=${serverId.value}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response)
      },
    })

    if (res) {
      masterList.value = res.data
      masterDropDown.value = res.data.map(item => ({
        text: item.mc_name, // mc_name as text
        value: item.id,      // id as value
      }))
      await fetchSlaveData(masterId.value, itemsPerPage.value, currentPage.value, searchQuery.value)
    } else {
      console.error('Failed to fetch master list or empty response')
    }
  } catch (err) {
    console.error('Error fetching master list:', err)
  }
}


const fetchSlaveData = async (masterId, perPage, page, search) => {
  isLoading.value = true
  slaveList.value = []
  try {
    // Construct the URL and append query parameters like `search`, `page`, etc., if needed
    let url = `slaves-list`

    const searchInput = search.trim()
    // Await the API call to resolve the promise properly
    const res = await $api(url, {
      method: 'POST',
      body: {
        ...(masterId ? { master_id: masterId } : {}),
        per_page: perPage,
        page: page,
        search: searchInput ? searchInput : null,
      },
      onResponseError({ response }) {
        errorTitle.value = 'Something Went Wrong!'
        errorMessage.value = 'Failed to fetch slave data!'
        isErrorDialogVisible.value = true
        isLoading.value = false // Ensure the loading state is cleared
      },
    })


    //Ensure to extract the 'data' field from the response
    if (res && res.data) {
      slaveList.value = res.data.data // Access the nested data
      totalUsers.value = res.data.total
      itemsPerPage.value = res.data.per_page
      isLoading.value = false
      // isSwitchLoading.value = false
    } else {
      console.error('No data found in the response')
      isLoading.value = false
      // isSwitchLoading.value = false
    }
    slaveList.value = res.data.data.map(slave => ({
      ...slave,
      loading: false,
    }))
  } catch (error) {
    console.error('Error fetching slave data:', error)
    errorTitle.value = 'Something Went Wrong!'
    errorMessage.value = 'An error occurred while fetching slave data!'
    isErrorDialogVisible.value = true
  } finally {
    isLoading.value = false // Ensure loading state is cleared no matter what
  }
}
//change server
function changeServer() {
  isChangeServerDialogVisible.value = true
}

const handleServerChanged = (newServerId) => {
  serverId.value = newServerId
  serverDetails.value = serverList.value.find(server => server.id === serverId.value)
  fetchMasterData()
}

function editSlave(slave) {
  selectedSlaveDetails.value = slave
  isEditSlaveDialogVisible.value = true
}

const handleMasterChanged = (newMasterId) => {
  masterId.value = newMasterId
  masterDetails.value = masterList.value.find(master => master.id === masterId.value)
  fetchSlaveData(masterId.value, itemsPerPage.value, currentPage.value, searchQuery.value)
}




function deleteSlave(slave) {
  slaveId.value = slave.id
  //masterId.value = slave.master_id
  isDeleteDialogVisible.value = true
  //fetchSlaveData(masterId.value, itemsPerPage.value, page.value, searchQuery.value)
}
const handleDeleteConfirm = async (confirmed) => {
  if (confirmed) {
    isBtnLoading.value = true
    try {
      const res = await $api('slaves/delete', {
        method: 'POST',
        body: {
          id: slaveId.value,
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Slave Deleted Successfully !'
        isBtnLoading.value = false
        isSuccessDialogVisible.value = true
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = 'Something Went Wrong !'
      isBtnLoading.value = false
      isErrorDialogVisible.value = true
    }

  }
}
const handlePageReload = async (confirmed) => {
  isSuccessDialogVisible.value = false
  isErrorDialogVisible.value = false
  searchQuery.value = ''
  masterId.value = null
  fetchSlaveData(null, itemsPerPage.value, currentPage.value, '')
  isSwitchLoading.value = false
}
watch([currentPage, itemsPerPage, searchQuery, masterId], () => {
  fetchSlaveData(masterId.value, itemsPerPage.value, currentPage.value, searchQuery.value)
}, { deep: true, immediate: false })
const handleDownload = async () => {
  downloadBtnLoading.value = true
  try {

    let url = `export-slaves`

    const searchInput = searchQuery.value.trim()
    // Await the API call to resolve the promise properly
    const res = await $api(url, {
      method: 'POST',
      body: {
        ...(masterId ? { master_id: masterId.value } : {}),
        search: searchInput ? searchInput : null,
      },
      onResponseError({ response }) {
        console.error("Error while downloading Slave list:", response);
        errorTitle.value = "Something went wrong!";
        errorMessage.value = "Failed to download Slave list!";
        isErrorDialogVisible.value = true;
        downloadBtnLoading.value = false;
      },
    });

    // Create a Blob from the response data (CSV)
    const blob = new Blob([res], { type: 'text/csv' });

    // Create a temporary link element and trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'slaves_list.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Download successful.");

  } catch (error) {
    console.error("Error fetching slave data:", error);
    errorTitle.value = "Something Went Wrong!";
    errorMessage.value = "An error occurred while downloading the CSV file!";
    isErrorDialogVisible.value = true;
  } finally {
    downloadBtnLoading.value = false;
  }
}
const isSwitchLoading = ref(false)
async function handleStatusChange(slave) {
  slave.loading = true
  const updatedSlave = { ...slave, loading: true }
  console.log(slave, 'slaa')
  isSwitchLoading.value = true
  try {
    const res = await $api('slaves/update', { // Assuming $api is globally available
      method: 'POST',
      body: {
        id: slave.id,
        master_id: slave.master_id,
        sl_mt5_id: slave.sl_mt5_id,
        server_id: slave.server_id,
        is_config_unique: slave.is_config_unique,
        risk_approach: slave.risk_approach,
        lot_size: slave.lot_size,
        multiplier: slave.multiplier,
        fixed_balance: slave.fixed_balance,
        copy_sl: slave.copy_sl,
        copy_tp: slave.copy_tp,
        is_reverse: slave.is_reverse,
        status: slave.status,
        is_live: slave.is_live,
        commission_percentage: slave.commission_percentage,
      },
      onResponseError({ response }) {
        errorTitle.value = 'Something Went Wrong!'
        errorMessage.value = 'Something Went Wrong!'
        isErrorDialogVisible.value = true
        slave.loading = false
      },
    })
    if (res) {
      updatedSlave.status = slave.status // Assuming the API confirms the new status
      updatedSlave.loading = false

      // Replace the old slave object with the updated one
      const index = slaveList.value.findIndex((s) => s.id === slave.id)
      if (index !== -1) {
        slaveList.value.splice(index, 1, updatedSlave)
      }
      await fetchSlaveData(null, itemsPerPage.value, currentPage.value, '')
    }
  } catch (Ex) {
    errorTitle.value = 'Something Went Wrong!'
    errorMessage.value = 'Something Went Wrong!'
    isErrorDialogVisible.value = true
    updatedSlave.loading = false
  } finally {
    // Ensure loading state is cleared even if an error occurs
    updatedSlave.loading = false
    isSwitchLoading.value = false
  }

}






const isBulkActionVisible = ref(false)
const isBulkDeleteDialogVisible = ref(false)
const selectedRows = ref([]);
const handleSelectionChange = (newSelection) => {
  if (newSelection.length > 0) {
    isBulkActionVisible.value = true;
  }
  else {
    isBulkActionVisible.value = false;
  }
};
const items = [{ title: 'BULK DELETE', value: 'delete' }, { title: 'BULK UDPATE', value: 'update' }]
const handleBulkDeleteConfirm = async (confirmed) => {
  if (confirmed) {
    isBtnLoading.value = true
    try {
      const res = await $api('slaves/bulk-delete', {
        method: 'POST',
        body: {
          ids: selectedRows.value,
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Slaves Deleted Successfully !'
        isBtnLoading.value = false
        isSuccessDialogVisible.value = true
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = 'Something Went Wrong !'
      isBtnLoading.value = false
      isErrorDialogVisible.value = true
    }

  }
}
const handleBulkAction = (action) => {
  if (!selectedRows.value.length) {
    console.error('No rows selected for bulk action');
    return;
  }

  if (action === 'delete') {
    isBulkDeleteDialogVisible.value = true;
  } else if (action === 'update') {
    isEditSlaveDialogVisible.value = true;
  } else {
    console.warn('Unknown bulk action:', action);
  }
};
</script>

<template>
  <section>
    <!-- 👉 Invoice Widgets -->
    <VCard class="mb-6">
      <VCardText class="px-3">
        <VRow>
          <!-- Static Column 1 -->
          <VCol cols="12" sm="6" md="3" class="px-4">
            <div class="d-flex justify-space-between align-center border-r">
              <div class="d-flex flex-column">
                <h5 class="text-h6">{{ serverDetails.server_name }}</h5>
                <span class="text-body-2 text-capitalize">Server</span>
              </div>
              <VAvatar variant="tonal" rounded size="42">
                <VIcon icon="tabler-server-bolt" size="26" color="high-emphasis" />
              </VAvatar>
            </div>
          </VCol>
          <VDivider vertical />
          <!-- Static Column 2 -->
          <VCol cols="12" sm="6" md="3" class="px-4">
            <div class="d-flex justify-space-between align-center border-r">
              <div class="d-flex flex-column">
                <h5 class="text-h5">{{ serverDetails.manager_name }}</h5>
                <span class="text-body-1 text-capitalize">Manager</span>
              </div>
              <div class="d-flex flex-column align-end">
                <VBtn icon="tabler-user" rounded variant="outlined" color="secondary" />
                <!-- @click="changeServer" -->
              </div>
            </div>
          </VCol>
          <VDivider vertical />

          <!-- Static Column 3 -->
          <VCol cols="12" sm="6" md="3" class="px-4">
            <div class="d-flex justify-space-between align-center border-r">
              <div class="d-flex flex-column">
                <h5 class="text-h5">{{ totalUsers ? totalUsers : '--' }}</h5>
                <span class="text-body-1 text-capitalize">Total Slaves</span>
              </div>
              <VChip color="primary" outlined>
                ACTIVE
              </VChip>
            </div>
          </VCol>
          <VDivider vertical />




          <!-- Static Column 4 -->


          <VCol cols="12" sm="6" md="3" class="px-4">


          </VCol>
          <VDivider vertical />



        </VRow>

      </VCardText>
    </VCard>


    <VCard id="invoice-list">
      <VCardText class="d-flex justify-space-between align-center flex-wrap ">
        <div class="d-flex gap-2 align-center flex-wrap">
          <div class="d-flex align-items-center gap-2">
            <VCardTitle class="d-flex align-items-center mr-0">
              Slaves Listing
            </VCardTitle>
            <VCardTitle class="d-flex text-warning">

            </VCardTitle>
          </div>
        </div>

        <div class="d-flex align-center flex-wrap gap-2">
          <!-- 👉 Search  -->
          <VMenu v-if="isBulkActionVisible" open-on-hover>
            <template #activator="{ props }">
              <VBtn variant="tonal" v-bind="props">
                🛠 Bulk Actions
              </VBtn>
            </template>
            <VList>
              <VListItem v-for="item in items" :key="item.value" @click="handleBulkAction(item.value)">
                <VListItemTitle>{{ item.title }}</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>


          <AppSelect v-model="masterId" :items="masterDropDown" placeholder="Select Master" item-title="text"
            item-value="value" outlined dense clearable clear-icon="tabler-x" class="invoice-list-filter"
            @change="handleMasterChanged" />

          <div class="invoice-list-filter">
            <AppTextField v-model="searchQuery" placeholder="Search SlaveMT5" />
          </div>

          <!-- 👉 Create Master -->
          <VBtn @click="isAddSlaveDialogVisible = true">
            Add Slave Account
          </VBtn>
          <VBtn @click="handleDownload" :loading="downloadBtnLoading">
            Download
          </VBtn>
        </div>
      </VCardText>


      <VDataTable v-if="slaveList.length > 0 && !isLoading" :headers="headers" :items="slaveList"
        :items-per-page="itemsPerPage" v-model="selectedRows" @update:modelValue="handleSelectionChange" show-select>
        <!-- ID -->
        <template #item.id="{ item }">
          <div class="d-flex align-center">
            <span>#{{ item.id }}<br>
              <p class="text-overline mb-0 bp-0 pb-0 mb-0" style="line-height: 0.5rem">{{
                formatDateToMonthShort(item.created_at) }}</p>
            </span>
          </div>
        </template>


        <!-- SLAVE MT5 ID -->
        <template #item.slave="{ item }">
          <div class="d-flex align-center">
            <VChip size="medium" class="pr-2 pl-2 pt-1 pb-1">
              <div class="pr-1">
                <VImg src="/images/svg/mt5_lined.svg" style="padding: 5px; width: 25px;" />
              </div>
              {{ item.sl_mt5_id }}
            </VChip>
          </div>
        </template>


        <!-- MASTER MT5 ID -->
        <template #item.master="{ item }">
          <div class="d-flex align-center">
            <VChip size="medium" class="pr-2 pl-1 pt-1 pb-1 me-1">
              🥋 {{ item.master.mc_mt5_id }}
            </VChip>
            <VChip size="medium" class="pr-2 pl-1 text-overline"
              style="padding-top: 0!important; padding-bottom: 0!important;letter-spacing: 0.05rem !important;">
              🕵🏻‍♂️
              {{ item.master.mc_name }}
            </VChip>
          </div>
        </template>


        <!-- STRATEGY -->
        <template #item.strategy="{ item }">
          <div class="d-flex align-center">
            <VChip size="medium" class="pr-2 pl-1 pt-1 pb-1 me-2">
              ♟️ {{ item.risk_approach }}
            </VChip>
            {{
              item.risk_approach === 'FBMUL' ? `${item.fixed_balance} USD` :
                item.risk_approach === 'FIXL' ? `${item.lot_size} Lots` :
                  item.risk_approach === 'LMUL' || item.risk_approach === 'BMUL' || item.risk_approach === 'EMUL' ?
                    `${item.multiplier} %` : 'N/A'
            }}

          </div>
        </template>

        <!-- CONFIG -->
        <template #item.config="{ item }">
          <div class="d-flex align-center">
            <VAvatar rounded :color="item.copy_sl === 1 ? 'success' : 'error'"
              :variant="item.copy_sl === 1 ? 'tonal' : 'tonal'" class="me-1" size="30">
              SL
              <VTooltip activator="parent" location="top">
                {{ item.copy_sl === 1 ? 'Copy StopLoss Active' : 'Copy StopLoss Disabled' }}
              </VTooltip>
            </VAvatar>
            <VAvatar rounded :color="item.copy_tp === 1 ? 'success' : 'error'"
              :variant="item.copy_tp === 1 ? 'tonal' : 'tonal'" class="me-1 ms-2" size="30">TP
              <VTooltip activator="parent" location="top">
                {{ item.copy_tp === 1 ? 'Copy TakeProfit Active' : 'Copy TakeProfit Disabled' }}
              </VTooltip>
            </VAvatar>
            <VAvatar rounded :color="item.is_reverse === 1 ? 'success' : 'error'"
              :variant="item.is_reverse === 1 ? 'tonal' : 'tonal'" class="me-1 ms-2" size="30">R
              <VTooltip activator="parent" location="top">
                {{ item.is_reverse === 1 ? 'Reverse Trade Active' : 'Reverse Trade Disabled' }}
              </VTooltip>
            </VAvatar>
          </div>
        </template>

        <!-- COMMISSION PERCENT -->
        <template #item.commission="{ item }">
          <div class="d-flex align-center">
            {{ item.commission_percentage }}%
            <VChip class="ms-2" v-if="item.commission_type === 'ONPROFIT'" size="x-small">
              OnProfit
            </VChip>
            <VChip v-if="item.commission_type === 'ONNET'" size="x-small">
              OnNet
            </VChip>
          </div>
        </template>

        <!-- STATUS-->
        <template #item.status="{ item }">
          <div class="d-flex align-center">
            <VSwitch v-model="item.status" :true-value="1" :false-value="0" @change="handleStatusChange(item)"
              :loading="item.loading">
              <template #label>
                <span class="text-overline">{{ item.loading ? 'Loading' : (item.status === 1 ? 'Active' : 'Disabled')
                }}</span>
              </template>
            </VSwitch>
          </div>
        </template>

        <!-- ACTION -->
        <template #item.action="{ item }">
          <div class="d-flex align-center">
            <VBtn color="secondary" size="x-small" variant="tonal" class="px-2 me-2 rounded" icon="tabler-edit"
              @click="editSlave(item)" />
            <VBtn color="error" size="x-small" variant="tonal" class="px-2 me-2 rounded" icon="tabler-trash"
              @click="deleteSlave(item)" />
          </div>
        </template>


        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">
              <VSelect v-model="itemsPerPage" :items="[5, 10, 25, 50, 100]" label="Rows per page:" variant="underlined"
                style="max-inline-size: 8rem;min-inline-size: 5rem;" />

              <VPagination v-model="currentPage" :total-visible="$vuetify.display.smAndDown ? 3 : 5"
                :length="Math.ceil(totalUsers / itemsPerPage)" />
            </div>
          </VCardText>
        </template>

      </VDataTable>
      <VSkeletonLoader v-if="isLoading" v-for="i in 3" :key="i" type="table-tbody" />
      <!-- !SECTION -->
    </VCard>
  </section>


  <AddSlavesDialog v-if="masterList" v-model:isDialogVisible="isAddSlaveDialogVisible" :masterDropDown="masterDropDown"
    @reload="handlePageReload" />
  <!--  <EditSlavesDialog v-model:isDialogVisible="isEditSlaveDialogVisible" :masterDetails="masterDetails"
                    :slaveList="selectedSlaveDetails" @reload="handlePageReload" />-->

  <UpdateSlavesDialogue v-if="selectedRows" v-model:isDialogVisible="isEditSlaveDialogVisible"
    :masterDropDown="masterDropDown" :selectedSlaves="selectedRows" @reload="handlePageReload" />

  <ChangeServerSlaveDialog v-model:isDialogVisible="isChangeServerDialogVisible" :serverDetails="serverList"
    @serverChanged="handleServerChanged" />
  <ConfirmDialog v-model:isDialogVisible="isDeleteDialogVisible" @confirm="handleDeleteConfirm"
    confirmation-question="Do you want to delete slave?" cancel-title="Cancelled" confirm-title="Confirm" />

  <ConfirmDialog v-model:isDialogVisible="isBulkDeleteDialogVisible" @confirm="handleBulkDeleteConfirm"
    confirmation-question="Do you want to delete the selected slaves?" cancel-title="Cancelled"
    confirm-title="Confirm" />

  <VDialog v-model="isSuccessDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="success" class="my-4"
          style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
          <VIcon icon="tabler-check" size="38" />
        </VBtn>
        <h1 class="text-h4 mb-4">
          {{ successTitle }}
        </h1>
        <p>{{ successMessage }}</p>
        <VBtn color="success" @click="handlePageReload()">
          OK
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <VDialog v-model="isErrorDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="error" class="my-4"
          style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
          <span class="text-5xl font-weight-light">X</span>
        </VBtn>
        <h1 class="text-h4 mb-4">
          {{ errorTitle }}
        </h1>
        <p>{{ errorMessage }}</p>
        <VBtn color="success" @click="handlePageReload">
          Ok
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
<style scoped>
#invoice-list {
  .invoice-list-actions {
    inline-size: 8rem;
  }

  .invoice-list-filter {
    inline-size: 12rem;
  }
}
</style>
