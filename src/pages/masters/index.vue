<script setup>
const serverName = import.meta.env.VITE_SERVER_NAME
// Reactive References for Table Controls
const searchQuery = ref('')
const selectedStatus = ref(null)
const selectedRows = ref([])

import { onMounted, ref } from "vue";
const serverDetails = ref([])
const serverList = ref(null)
const masterList = ref([])
const isAddMasterDialogVisible = ref(false)
const isEditDialogVisible = ref(false)
const masterDetails = ref(null)
const isDeleteDialogVisible = ref(false)
const masterId = ref(null)
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const isBtnLoading = ref(false)
const isChangeServerDialogVisible = ref(false)
const serverId = ref(false)
const isLoading = ref(false)


onMounted(async () => {
  await fetchServerList()
})


// Fetch server list from API
const fetchServerList = async () => {
  try {
    const res = await $api('/meta-servers', {
      method: 'GET',
      onResponseError({ response }) {
        console.error(response) // Error logging
      },
    })
    serverList.value = res.data
    serverDetails.value = serverList.value[0]
    serverId.value = serverDetails.value.id
    fetchMasterData()

  } catch (error) {
    console.error(error)
  }
}

const fetchMasterData = async () => {
  isLoading.value = true;
  try {
    const res = await $api(`/masters?server_id=${serverId.value}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response);
      },
    });

    if (res) {
      masterList.value = res.data

      isLoading.value = false;

    } else {
      console.error('Failed to fetch group list or empty response');
    }
  } catch (err) {
    console.error('Error fetching group list:', err);
  }
};


function editMaster(master) {
  masterDetails.value = master
  isEditDialogVisible.value = true;
}

function deleteMaster(id) {
  masterId.value = id
  isDeleteDialogVisible.value = true;

}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isBtnLoading.value = true;
    try {
      const res = await $api('masters/delete', {
        method: 'POST',
        body: {
          id: masterId.value,
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !';
          errorMessage.value = response._data.message;
          isBtnLoading.value = false;
          isErrorDialogVisible.value = true;
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Master Deleted Successfully !';
        isBtnLoading.value = false;
        isSuccessDialogVisible.value = true;
      }
    }
    catch (Ex) {
      errorTitle.value = 'Something Went Wrong !';
      errorMessage.value = 'Something Went Wrong !';
      isBtnLoading.value = false;
      isErrorDialogVisible.value = true;
    }

  }
}
const handlePageReload = async (confirmed) => {
  window.location.reload();
}

function changeServer() {
  isChangeServerDialogVisible.value = true
}

const handleServerChanged = (newServerId) => {
  serverId.value = newServerId;
  serverDetails.value = serverList.value.find(server => server.id === serverId.value);
  fetchMasterData()
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
                <h5 class="text-h6">{{ serverName }}</h5>
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
                <h5 class="text-h6">{{ serverDetails.server_ip }}</h5>
                <span class="text-body-2 text-capitalize">IP Address</span>
              </div>
              <VAvatar variant="tonal" rounded size="42">
                <VIcon icon="tabler-cpu-2" size="26" color="high-emphasis" />
              </VAvatar>
            </div>
          </VCol>
          <VDivider vertical />
          <!-- Static Column 3 -->
          <VCol cols="12" sm="6" md="3" class="px-4">
            <div class="d-flex justify-space-between align-center border-r">
              <div class="d-flex flex-column">
                <h5 class="text-h6">--</h5>
                <span class="text-body-2 text-capitalize">Manager</span>
              </div>
              <VAvatar variant="tonal" rounded size="42">
                <VIcon icon="tabler-user-bolt" size="26" color="high-emphasis" />
              </VAvatar>
            </div>
          </VCol>
          <VDivider vertical />
          <!-- Static Column 4 -->
          <VCol cols="12" sm="6" md="3" class="px-2">
            <div class="d-flex justify-space-between align-center border-r">
              <div class="d-flex flex-column mb-6">
                <VChip color="primary" outlined size="small">
                  ACTIVE
                </VChip>
              </div>
              <div class="d-flex flex-column align-center">
                <VAvatar variant="tonal" rounded size="42">
                  <VIcon icon="tabler-activity" size="26" color="high-emphasis" />
                </VAvatar>
                <VBtn color="secondary" size="x-small" variant="outlined" class="mt-2" @click="changeServer">
                  <VIcon start icon="tabler-settings" />Change server
                </VBtn>
              </div>
            </div>

          </VCol>
        </VRow>

      </VCardText>
    </VCard>

    <VCard id="invoice-list">
      <VCardText class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div class="d-flex gap-4 align-center flex-wrap">
          <div class="d-flex align-center gap-2">
            <VCardTitle>Mapped Master Accounts</VCardTitle>
          </div>

        </div>

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div class="invoice-list-filter">
            <AppTextField v-model="searchQuery" placeholder="Search Master Account" />
          </div>

          <!-- 👉 Select status -->
          <div class="invoice-list-filter">
            <AppSelect v-model="selectedStatus" placeholder="Status" clearable clear-icon="tabler-x" single-line
              :items="['Active', 'Inactive']" />
          </div>
          <!-- 👉 Create Master -->
          <VBtn @click="isAddMasterDialogVisible = true">
            Add Master Account
          </VBtn>
        </div>
      </VCardText>
      <VDivider />

      <!-- SECTION table -->
      <VSkeletonLoader v-if="isLoading" v-for="i in 3" :key="i" type="table-tbody" />
      <VTable v-if="masterList.length > 0" height="800" fixed-header class="text-no-wrap">
        <thead>
          <tr>
            <th>
              ID
            </th>
            <th>
              MASTER NAME
            </th>
            <th>
              SERVER NAME
            </th>
            <th>
              COMPANY NAME
            </th>
            <th>
              MT5 ACCOUNT
            </th>
            <th>
              GLOBAL CONFIG
            </th>
            <th>
              STATUS
            </th>
            <th>
              ACTION
            </th>
          </tr>
        </thead>

        <tbody>
          <tr class="" v-for="master in masterList" :key="master.id">

            <td class="text-caption me-0 ms-0 px-0 py-0" style="padding-left: 2px;">
              <VChip size="x-small">
                {{ master.id }}
              </VChip>
              <br />
              {{ formatDateToMonthShort(master.created_at) }}
            </td>

            <td>

              {{ master.mc_name }}
            </td>
            <td>
              {{ master.server.server_name }}
            </td>
            <td>
              {{ master.server.company_name }}
            </td>
            <td>
              <VChip size="medium" class="pr-3 pl-3 pt-1 pb-1">
                <div class="pr-1">
                  <VImg src="/images/svg/mt5_lined.svg" style="padding: 5px; width: 25px;" />
                </div>
                {{ master.mc_mt5_id }}
              </VChip>
            </td>
            <td>
              <VChip v-if="master.is_config_identical === 1" color="green" outlined class="ma-1" variant="outlined">
                Enabled
              </VChip>
              <VChip v-else color="red" outlined class="ma-1" variant="outlined">
                Disabled
              </VChip>
            </td>
            <td>
              <VChip v-if="master.status === 1" color="green" outlined variant="outlined" class="ma-1">
                Active
              </VChip>
              <VChip v-else color="red" outlined class="ma-1" variant="outlined">
                Inactive
              </VChip>
            </td>
            <td>
              <VBtn color="secondary" size="x-small" variant="tonal" class="px-2 me-2 rounded" icon="tabler-edit"
                @click="editMaster(master)">
              </VBtn>
              <VBtn color="error" size="x-small" variant="tonal" class="px-2 me-2 rounded" icon="tabler-trash"
                @click="deleteMaster(master.id)" :loading="isBtnLoading">
              </VBtn>
            </td>


          </tr>
        </tbody>
      </VTable>

      <!-- !SECTION -->
    </VCard>
  </section>

  <AddMasterDialog v-model:isDialogVisible="isAddMasterDialogVisible" :serverDetails="serverDetails" />

  <EditMasterDialog v-model:isDialogVisible="isEditDialogVisible" :masterDetails="masterDetails" />

  <ChangeServerDialog v-model:isDialogVisible="isChangeServerDialogVisible" :serverDetails="serverList"
    :serverId="serverDetails.id" @serverChanged="handleServerChanged" />

  <ConfirmDialog v-model:isDialogVisible="isDeleteDialogVisible" @confirm="handleConfirm"
    confirmation-question="Are you want to delete master?" cancel-title="Cancelled" confirm-title="Confirm" />

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
