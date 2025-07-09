<script setup>


// Reactive References
import { ref } from "vue";

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
const masterId = ref(false)
const serverId = ref(false)
const isLoading = ref(false)
const slaveId = ref(null)
const isDeleteDialogVisible = ref(false)
const isChangeServerDialogVisible = ref(false)
const selectedStatus = ref(null)
const isChangeMasterDialogVisible = ref(false)
const downloadBtnLoading = ref(false)
const switchMe = ref(false)
// Computed property for label text based on switch state
const switchLabel = computed(() => (switchMe.value ? "Active" : "Turn on the progress"))

// Watch to disable text and loader when switch is active
const isDisabled = computed(() => switchMe.value)
onMounted(async () => {
  await fetchServerList()
})

const itemsPerPage = ref(15)
const page = ref(1)
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
      masterDetails.value = masterList.value[0]
      masterId.value = masterDetails.value.id
      masterDropDown.value = res.data.map(item => ({
        text: item.mc_name, // mc_name as text
        value: item.id,      // id as value
      }))
      await fetchSlaveData(masterId.value, itemsPerPage.value, page.value, searchQuery.value)
    } else {
      console.error('Failed to fetch master list or empty response')
    }
  } catch (err) {
    console.error('Error fetching master list:', err)
  }
}


const fetchSlaveData = async (masterId, perPage, page, search) => {
  isLoading.value = true
  try {
    // Build the base URL with required parameters
    let url = `/slaves?master_id=${masterId}&per_page=${perPage}&page=${page}`

    // Only append the search parameter if searchQuery length is greater than 1
    if (searchQuery.value.length > 1) {
      url += `&search=${encodeURIComponent(searchQuery.value)}` // Make sure to encode the search query
    }

    const res = await $api(url, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error fetching slave data:', response)
      },
    })

    slaveList.value = []
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
    isLoading.value = false
    // isSwitchLoading.value = false
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
  fetchSlaveData(masterId.value, itemsPerPage.value, page.value, searchQuery.value)
}

function changeMaster() {
  isChangeMasterDialogVisible.value = true
}


function deleteSlave(slave) {
  slaveId.value = slave.id
  masterId.value = slave.master_id
  isDeleteDialogVisible.value = true
  fetchSlaveData(masterId.value, itemsPerPage.value, page.value, searchQuery.value)

}

const handleConfirm = async (confirmed) => {
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
  fetchSlaveData(masterId.value, itemsPerPage.value, page.value, searchQuery.value)
  isSwitchLoading.value = false
}

watch([page, itemsPerPage, searchQuery], () => {
  fetchSlaveData(masterId.value, itemsPerPage.value, page.value, searchQuery.value)
}, { deep: true, immediate: false })


const handleDownload = async () => {
  downloadBtnLoading.value = true
  try {
    const url = `/masters/${masterId.value}/slaves-report`
    const res = await $api(url, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error fetching slave data:', response)
      },
    })

    // Check if the response contains CSV data
    if (res) {

      // Convert the response data to a Blob
      const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' })

      // Create a download link
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "slaves_report.csv")

      // Append link to body, trigger click, and remove link
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      downloadBtnLoading.value = false
    } else {
      console.error("No data found in the response")
    }
  } catch (error) {
    console.error("Error fetching slave data:", error)
  }
}
const handleMasterIdReload = (masterId) => {
  isAddSlaveDialogVisible.value = false

  fetchSlaveData(masterId, itemsPerPage.value, page.value, searchQuery.value)
  isSwitchLoading.value = false

}

const isSwitchLoading = ref(false)

function handleStatusChange(slave) {
  slave.loading = true
  masterId.value = slave.master_id
  const updatedSlave = { ...slave, loading: true }
  console.log(slave, 'slaa')
  isSwitchLoading.value = true
  try {
    const res = $api('slaves/update', { // Assuming $api is globally available
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
    }
  } catch (Ex) {
    errorTitle.value = 'Something Went Wrong!'
    errorMessage.value = 'Something Went Wrong!'
    isErrorDialogVisible.value = true
    updatedSlave.loading = false
  } finally {
    // Ensure loading state is cleared even if an error occurs
    updatedSlave.loading = false
  }

}

</script>

<template>
  <section>
    <!-- 👉 Invoice Widgets -->
    <VCard class="mb-6">
      <VCardText class="px-3">
        <VRow>
          <!-- Static Column 1 -->
          <VCol cols="12" sm="6" md="3" class="px-4">
            <div class="d-flex justify-space-between align-center border-r pb-3">
              <div class="d-flex flex-column mb-6 align-items-start">
                <div class="d-flex align-items-center">
                  <VImg src="/images/svg/mt5_lined.svg" style="width: 30px; height: 30px; margin-right: 8px;" />
                  <h5 class="text-h5 m-0" style="    margin-right: 55px;">{{ masterDetails?.mc_mt5_id || '--' }}</h5>
                </div>
                <span class="text-body-1 text-capitalize mt-2">MASTER ACCOUNT ID</span>
              </div>

              <div class="d-flex flex-column align-center pb-6">
                <VBtn icon="tabler-refresh" rounded color="primary" @click="changeMaster" />
              </div>
            </div>

          </VCol>
          <VDivider vertical />
          <!-- Static Column 2 -->
          <VCol cols="12" sm="6" md="3" class="px-4">
            <div class="d-flex justify-space-between align-center border-r">
              <div class="d-flex flex-column">
                <h5 class="text-h5">{{ masterDetails?.mc_name || '--' }}</h5>
                <span class="text-body-1 text-capitalize">Master</span>
              </div>
              <VChip color="primary" outlined>
                ACTIVE
              </VChip>
            </div>
          </VCol>
          <VDivider vertical />


          <!-- Static Column 3 -->
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

          <!-- Static Column 4 -->
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


        </VRow>

      </VCardText>
    </VCard>


    <VCard id="invoice-list">
      <VCardText class="d-flex justify-space-between align-center flex-wrap ">
        <div class="d-flex gap-4 align-center flex-wrap">
          <div class="d-flex align-items-center gap-2">
            <VCardTitle class="d-flex align-items-center mr-0">
              Mapped Slave Accounts :
            </VCardTitle>
            <VCardTitle class="d-flex text-warning">
              {{ masterDetails?.mc_name }}
              <VChip class="d-flex align-items-center ml-3" variant="outlined" color="warning">
                <VImg src="/images/svg/mt5_lined.svg" style="width: 24px; height: 24px; margin-right: 8px;" />
                <h3 class="text-warning">{{ masterDetails?.mc_mt5_id || '--' }}</h3>
              </VChip>

            </VCardTitle>
          </div>
        </div>

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div class="invoice-list-filter">
            <AppTextField v-model="searchQuery" placeholder="Search Slave Account" />
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
      <VDivider />

      <!-- SECTION table -->
      <VTable v-if="slaveList.length > 0" height="800" fixed-header class="text-no-wrap">

        <thead>
          <tr>
            <th>ID</th>
            <th>SLAVE ACCOUNT</th>
            <!-- <th>GLOBAL CONFIG</th> -->
            <th>STRATEGY</th>
            <th>VALUE</th>
            <th>COMMISSION</th>
            <th>ADDITIONAL SETTINGS</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="slave in slaveList" :key="slave.id">
            <td class="text-caption me-0 ms-0 px-0 py-0" style="padding-left: 2px;">
              <VChip size="x-small">{{ slave.id }}</VChip>
              <br />
              {{ formatDateToMonthShort(slave.created_at) }}
            </td>
            <td>
              <VChip size="medium" class="pr-3 pl-3 pt-1 pb-1">
                <div class="pr-1">
                  <VImg src="/images/svg/mt5_lined.svg" style="padding: 5px; width: 25px;" />
                </div>
                {{ slave.sl_mt5_id }}
              </VChip>
            </td>
            <!-- <td>
          <VChip v-if="slave.is_config_identical === 1" color="green" class="ma-1">
            Enabled
          </VChip>
          <VChip v-else color="red" class="ma-1">
            Disabled
          </VChip>
        </td> -->
            <td>
              {{ slave.risk_approach }}
            </td>
            <td>
              {{
                slave.risk_approach === 'FBMUL' ? `${slave.fixed_balance} USD` :
                  slave.risk_approach === 'FIXL' ? `${slave.lot_size} Lots` :
                    slave.risk_approach === 'LMUL' || slave.risk_approach === 'BMUL' || slave.risk_approach === 'EMUL' ?
                      `${slave.multiplier} %` : 'N/A'
              }}
            </td>
            <td>{{ slave.commission_percentage }}%
              <VChip v-if="slave.commission_type === 'ONPROFIT'" size="x-small">
                OnProfit
              </VChip>
              <VChip v-if="slave.commission_type === 'ONNET'" size="x-small">
                OnNet
              </VChip>
            </td>


            <td>
              <VAvatar rounded :color="slave.is_reverse === 1 ? 'success' : 'error'" icon="tabler-a-b-2"
                :variant="slave.is_reverse === 1 ? 'outlined' : 'outlined'" class="me-1" size="30" />
              <VAvatar rounded :color="slave.copy_sl === 1 ? 'success' : 'error'"
                :variant="slave.copy_sl === 1 ? 'outlined' : 'outlined'" class="me-1 ms-2" size="30">SL
              </VAvatar>
              <VAvatar rounded :color="slave.copy_tp === 1 ? 'success' : 'error'"
                :variant="slave.copy_tp === 1 ? 'outlined' : 'outlined'" class="me-1 ms-2" size="30">TP
              </VAvatar>
            </td>
            <td>
              <VSwitch v-model="slave.status" :true-value="1" :false-value="0" @change="handleStatusChange(slave)"
                :loading="slave.loading">
                <template #label>
                  <span>{{ slave.loading ? 'Loading' : (slave.status === 1 ? 'Active' : 'Disabled') }}</span>
                </template>
              </VSwitch>


            </td>
            <td>
              <VBtn color="secondary" size="x-small" variant="tonal" class="px-2 me-2 rounded" icon="tabler-edit"
                @click="editSlave(slave)" />
              <VBtn color="error" size="x-small" variant="tonal" class="px-2 me-2 rounded" icon="tabler-trash"
                @click="deleteSlave(slave)" :loading="isBtnLoading" />
            </td>
          </tr>
        </tbody>
      </VTable>
      <VSkeletonLoader v-if="isLoading" v-for="i in 3" :key="i" type="table-tbody" />
      <VCardText v-if="slaveList.length > 0" class="pt-2">
        <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">


          <VPagination v-model="page" :total-visible="$vuetify.display.smAndDown ? 3 : 5"
            :length="Math.ceil(totalUsers / itemsPerPage)" />
        </div>
      </VCardText>
      <!-- !SECTION -->
    </VCard>
  </section>


  <AddSlavesDialog v-model:isDialogVisible="isAddSlaveDialogVisible" :masterDetails="masterDetails"
    @reload="handleMasterIdReload" />
  <EditSlavesDialog v-model:isDialogVisible="isEditSlaveDialogVisible" :masterDetails="masterDetails"
    :slaveList="selectedSlaveDetails" @reload="handleMasterIdReload" />
  <ChangeServerSlaveDialog v-model:isDialogVisible="isChangeServerDialogVisible" :serverDetails="serverList"
    @serverChanged="handleServerChanged" />

  <ChangeMasterSlaveDialog v-model:isDialogVisible="isChangeMasterDialogVisible" :masterList="masterList"
    @masterChanged="handleMasterChanged" />

  <ConfirmDialog v-model:isDialogVisible="isDeleteDialogVisible" @confirm="handleConfirm"
    confirmation-question="Are you want to delete slave?" cancel-title="Cancelled" confirm-title="Confirm" />

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
