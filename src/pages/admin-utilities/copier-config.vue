<script setup>
import { onMounted, ref } from "vue";

// State management
const selectedUser = ref(null)
const isAddCopierModalVisible = ref(false)
const isShowEditMasterModal = ref(false)
const selectedMaster = ref(null)
const isDeleteConfirmDialog = ref(false)
const successTitle = ref('') // Success dialog title
const successMessage = ref('') // Success message
const errorTitle = ref('') // Error dialog title
const errorMessage = ref('') // Error message
const isSuccessDialogVisible = ref(false) // Success dialog visibility
const isErrorDialogVisible = ref(false) // Error dialog visibility
const isLoading = ref(false) // Loader state
const isBtnLoading = ref(false);
const masterList = ref(null)
const slaveList = ref(null)
const slaveDetails = ref(null)
const isShowAddSlaveModal = ref(false)
const selectedSlave = ref(null)
const isSlaveEditShowModal = ref(false)
const isSubmitBtnDisable = ref(false);
const isMasterDeleteConfirmDialog=ref(false)


// On component mount, fetch master list
onMounted(async () => {
  await fetchMasterList()
})

// Fetch master list from API
const fetchMasterList = async () => {
  try {
    const res = await $api('/copier-masters', {
      method: 'GET',
      onResponseError({ response }) {
        console.error(response) // Error logging
      },
    })
    masterList.value = res.data
  } catch (error) {
    console.error(error)
  }
}

// Handle master selection
const selectMaster = (master) => {
  selectedUser.value = master.id
  slaveList.value=[]
  fetchSlaveList()
  isLoading.value = true
}

// Show add copier modal
function showAddCopierModal() {
  isAddCopierModalVisible.value = true
}

// Edit slave modal handler
function editSlave(slave) {
  selectedSlave.value = slave
  isSlaveEditShowModal.value = true
}


function editMaster(master) {
  selectedMaster.value = master
  isShowEditMasterModal.value = true
}

// Handle delete button click to open confirmation dialog
const handleDelete = (slave) => {
  selectedSlave.value = slave // Store the selected slave for deletion
  isDeleteConfirmDialog.value = true // Show confirmation dialog
}

// Fetch slave list for selected master
const fetchSlaveList = async () => {
  try {
    const res = await $api(`/copier-masters/${selectedUser.value}/slaves`, {
      method: 'GET',
      onResponseError({ response }) {
        console.error(response)
      },
    })
    slaveDetails.value = res.data
    slaveList.value = slaveDetails.value.slaves
    isLoading.value = false
  } catch (error) {
    console.error(error)
  }
}

// Show add slave modal
function showAddSlaveModal() {
  isShowAddSlaveModal.value = true
}
const loadingState = ref({});
// Handle confirmation of slave delete action
const handleConfirm = async (confirmed) => {
  if (confirmed) {
    loadingState.value[selectedSlave.value.id] = true;
    try {
      const res = await $api('/copier-slaves/delete', {
        method: 'POST',
        body: { id: selectedSlave.value.id }, // Send the slave ID in the body
        onResponseError({ response }) {
          console.error(response)
        },
      })
      if (res.status) {
        // Handle success: remove the deleted item from the list
        // slaveList.value = slaveList.value.filter(slave => slave.id !== selectedSlave.value.id)
        successTitle.value = 'Deleted!';
        successMessage.value = 'Slave Account deleted successfully!';
        isSuccessDialogVisible.value = true;
        loadingState.value[slave.id] = false;
      }
    } catch (Ex) {
      loadingState.value[slave.id] = false;
      errorTitle.value = 'Something Went Wrong!';
      errorMessage.value = Ex.response?._data?.message || 'Error occurred';
      isErrorDialogVisible.value = true;
    }
  }
};

const selectedMasterId = ref(null)

// Toggle the selected master details by ID
const toggleMasterDetails = (id) => {
  selectedMasterId.value = selectedMasterId.value === id ? null : id
}

const selectedClientId = ref(null)

// Toggle the selected master details by ID
const toggleSlaveDetails = (id) => {
  selectedClientId.value = selectedClientId.value === id ? null : id
}

const handlePageReload = async (confirmed) => {
  window.location.reload();
}

// Handle delete button click to open confirmation dialog
const handleMasterDelete = (master) => {
  selectedMaster.value = master // Store the selected slave for deletion
  isMasterDeleteConfirmDialog.value = true // Show confirmation dialog
}

const handleMasterRemove = async (confirmed) => {
  if (confirmed) {
    loadingState.value[selectedMaster.value.id] = true;
    try {
      const res = await $api('/copier-masters/delete', {
        method: 'POST',
        body: { id: selectedMaster.value.id }, // Send the slave ID in the body
        onResponseError({ response }) {
          console.error(response)
        },
      })
      if (res.status) {
        successTitle.value = 'Deleted!';
        successMessage.value = 'Master Account deleted successfully!';
        isSuccessDialogVisible.value = true;
        loadingState.value[selectedSlave.value.id] = fasle;
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!';
      errorMessage.value = Ex.response?._data?.message || 'Error occurred';
      isErrorDialogVisible.value = true;
      loadingState.value[selectedSlave.value.id] = false;
    }
  }
};

</script>

<template>
  <VCard>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between">
      <div class="flex-grow-1 me-4 mt-2">
        <VCardTitle>Copier Configuration</VCardTitle>
        <VCardSubtitle class="pb-3">Manage Copier Configuration</VCardSubtitle>
      </div>
      <div class="text-right">
        <VBtn class="me-2" @click="showAddCopierModal">Add Master</VBtn>
      </div>
    </div>

    <VDivider />

    <!-- Main Content -->
    <VRow class="mb-6 mt-3 mr-2">
      <VCol cols="6">
        <VCardTitle>MASTER</VCardTitle>
        <div v-if="masterList" v-for="(master, index) in masterList" class="d-flex justify-space-between">
          <VCol cols="10">
            <VCard :key="index" class="mb-2" :class="{ 'selected-cards': selectedUser === master.id }"
              @click="selectMaster(master)">
              <h4 class="ml-4 my-1">{{ master.mc_name }}</h4>
              <VRow class="d-flex justify-space-between align-center flex-wrap">
                <VCol class="d-flex align-center">
                  <CustomClientCardChip class="mx-3 my-2" :client_name="master.client.client_name"
                    :client_id="master.client.id" :email="master.client.email" :client_pic="master.client_pic" />
                </VCol>

                <VCol class="d-flex align-center flex-column pb-6 mr-2" cols="auto">
                  <CustomMT5Chip class="mb-2" :client_id="master.client.id" :mt_id="master.mc_mt5_id?.toString()"
                    :is_wallet="0" />

                </VCol>
              </VRow>
              <VRow v-if="selectedMasterId === master.id" class="mb-4 ml-2 mr-2">
                <VTable fixed-header class="text-no-wrap">
                  <tr>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Created Time :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center">
                                <div class="text-body-1">
                                    {{ formatTime(master.created_at) }}     
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Performance Matrix :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center gap-x-2">
                                <div class="text-body-1">
                                    {{ master.performance_matrix}}     
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                  </tr>
                  <tr>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Risk Factor :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center">
                                <div class="text-body-1">
                                    {{ master.risk_factor}}     
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Identity Configuration :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center gap-x-2">
                                <div  v-if="master.is_config_identical" class="text-body-1">
                                    ACTIVE
                                </div>
                                <div v-else class="text-body-1">
                                    INACTIVE 
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                  </tr>
                  <tr>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Risk Approach :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center gap-x-2">
                                <div class="text-body-1">
                                    {{ master.risk_approach}}     
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Lot Size :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center gap-x-2">
                                <div class="text-body-1">
                                    {{ master.lot_size}}     
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                  </tr>
                  <tr>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Multiplier :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center gap-x-2">
                                <div class="text-body-1">
                                    {{ master.multiplier}}%     
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Fixed Balance :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center gap-x-2">
                                <div class="text-body-1">
                                    {{ master.fixed_balance}}    
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                  </tr>
                  <tr>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Copy Stop Loss :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center gap-x-2">
                                <div v-if="master.copy_sl" class="text-body-1">
                                    ACTIVE    
                                </div>
                                <div v-else class="text-body-1">
                                    INACTIVE    
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Copy Take Profit :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center gap-x-2">
                                <div v-if="master.copy_tp" class="text-body-1">
                                    ACTIVE    
                                </div>
                                <div v-else class="text-body-1">
                                    INACTIVE    
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                  </tr>
                  <tr>
                    <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Reverse Trade :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center gap-x-2">
                                <div v-if="master.is_reverse" class="text-body-1">
                                    ACTIVE    
                                </div>
                                <div v-else class="text-body-1">
                                    INACTIVE    
                                </div>
                              </div>
                            </template>
                          </VListItem>
                    </td>
                    <td>
                          
                    </td>
                  </tr>
                </VTable>
                
              </VRow>
            </VCard>
          </VCol>
          <VCol cols="2">
            <div class="mr-2">
              <VChip color="secondary" variant="outlined" size="small" class="d-flex align-center"
                @click="toggleMasterDetails(master.id)">
                <VIcon icon="tabler-info-circle" class="mr-1" />
                Details
              </VChip>
              <VChip color="secondary" variant="outlined" size="small" class="d-flex align-center mt-2"
                @click="editMaster(master)">
                <VIcon icon="tabler-edit" class="mr-2" />
                Edit
              </VChip>
              <VChip  variant="outlined" size="small" class="d-flex align-center mt-2" @click="handleMasterDelete(master)" :color="loadingState[master.id] ? 'grey' : 'secondary'" :disabled="loadingState[master.id]">
                <template v-if="loadingState[master.id]">
                  <VProgressCircular indeterminate size="20" color="white" /> 
                </template>
                <template v-else>
                <VIcon icon="tabler-trash" class="mr-1" />
                Delete
                </template>
              </VChip>
              
            </div>
          </VCol>
        </div>
        <VSkeletonLoader v-else v-for="i in 3" :key="i" type="table-tbody" />
      </VCol>

      <!-- Slave Section -->
      <VCol cols="6">

        <VCard v-if="slaveList">
          <div class="d-flex align-center justify-space-between">
            <div class="flex-grow-1 me-4 mt-2">
              <VCardTitle>SLAVES</VCardTitle>
            </div>
            <div class="text-right mt-2 ml-3">
              <VBtn class="me-2" @click="showAddSlaveModal">Add Slave</VBtn>
            </div>
          </div>
          <VCol cols="12">
            <VSkeletonLoader v-if="isLoading" v-for="i in 3" :key="i" type="article" />
            <VTimeline v-if="slaveList" align="start" density="compact" line-inset="8" side="end" truncate-line="start">
              <VTimelineItem v-for="slave in slaveList" size="x-small" dot-color="warning">
                <div class="rounded border-1 border-dashed selected-card">
                  <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-0">
                    <div>
                      <CustomMT5Chip class="ml-3 mb-3" :client_id="slave.client.id" :mt_id="slave.sl_mt5_id?.toString()"
                        :is_wallet="0" />
                      <br>
                      <span class="app-timeline-meta ml-3 pt-6">{{ formatDateToMonthShort(slave.created_at) }}</span>
                    </div>
                    <div class="my-2">
                      <CustomClientCardChip class="mx-3 my-2" :client_name="slave.client.client_name"
                        :client_id="slave.client.id" :email="slave.client.email"
                        :client_pic="slave.client.client_pic" />
                      <div class="d-flex mr-2">
                        <VChip color="info" size="small" class="ml-3 mt-2" @click="toggleSlaveDetails(slave.id)">
                          <VIcon icon="tabler-info-circle"  class="mr-1" />
                          Details
                        </VChip>
                        <VChip color="warning" size="small" class="ml-3 mt-2" @click="editSlave(slave)">
                          <VIcon icon="tabler-edit"  />
                          Edit
                        </VChip>
                        <VChip 
                        :color="loadingState[slave.id] ? 'grey' : 'error'"
                        size="small" 
                        class="ml-3 mt-2" 
                        @click="handleDelete(slave)" 
                        :disabled="loadingState[slave.id]">
                        <template v-if="loadingState[slave.id]">
                          <VProgressCircular indeterminate size="20" color="white" /> <!-- Loader during delete -->
                        </template>
                        <template v-else>
                          <VIcon icon="tabler-unlink" />
                          Remove
                        </template>
                      </VChip>
                      </div>
                    </div>
                  </div>
                  <div class="row mt-2" v-if="selectedClientId === slave.id">
                    <VTable fixed-header class="text-no-wrap">
                      <tr>
                        <td>
                              <VListItem>
                                <VListItemTitle class="font-weight-medium me-4 text-overline">
                                  Created Time :
                                </VListItemTitle>
                                <template #append>
                                  <div class="d-flex align-center">
                                    <div class="text-body-1">
                                        {{ formatTime(slave.created_at) }}     
                                    </div>
                                  </div>
                                </template>
                              </VListItem>
                        </td>
                        <td>
                              <VListItem>
                                <VListItemTitle class="font-weight-medium me-4 text-overline">
                                  Identity Configuration :
                                </VListItemTitle>
                                <template #append>
                                  <div class="d-flex align-center gap-x-2">
                                    <div  v-if="slave.is_config_identical" class="text-body-1">
                                        ACTIVE
                                    </div>
                                    <div v-else class="text-body-1">
                                        INACTIVE 
                                    </div>
                                  </div>
                                </template>
                              </VListItem>
                        </td>
                      </tr>
                      <tr>
                        <td>
                              <VListItem>
                                <VListItemTitle class="font-weight-medium me-4 text-overline">
                                  Risk Approach :
                                </VListItemTitle>
                                <template #append>
                                  <div class="d-flex align-center gap-x-2">
                                    <div class="text-body-1">
                                        {{ slave.risk_approach}}     
                                    </div>
                                  </div>
                                </template>
                              </VListItem>
                        </td>
                        <td>
                              <VListItem>
                                <VListItemTitle class="font-weight-medium me-4 text-overline">
                                  Lot Size :
                                </VListItemTitle>
                                <template #append>
                                  <div class="d-flex align-center gap-x-2">
                                    <div class="text-body-1">
                                        {{ slave.lot_size}}     
                                    </div>
                                  </div>
                                </template>
                              </VListItem>
                        </td>
                      </tr>
                      <tr>
                        <td>
                              <VListItem>
                                <VListItemTitle class="font-weight-medium me-4 text-overline">
                                  Multiplier :
                                </VListItemTitle>
                                <template #append>
                                  <div class="d-flex align-center gap-x-2">
                                    <div class="text-body-1">
                                        {{ slave.multiplier}}%     
                                    </div>
                                  </div>
                                </template>
                              </VListItem>
                        </td>
                        <td>
                              <VListItem>
                                <VListItemTitle class="font-weight-medium me-4 text-overline">
                                  Fixed Balance :
                                </VListItemTitle>
                                <template #append>
                                  <div class="d-flex align-center gap-x-2">
                                    <div class="text-body-1">
                                        {{ slave.fixed_balance}}    
                                    </div>
                                  </div>
                                </template>
                              </VListItem>
                        </td>
                      </tr>
                      <tr>
                        <td>
                              <VListItem>
                                <VListItemTitle class="font-weight-medium me-4 text-overline">
                                  Copy Stop Loss :
                                </VListItemTitle>
                                <template #append>
                                  <div class="d-flex align-center gap-x-2">
                                    <div v-if="slave.copy_sl" class="text-body-1">
                                        ACTIVE    
                                    </div>
                                    <div v-else class="text-body-1">
                                        INACTIVE    
                                    </div>
                                  </div>
                                </template>
                              </VListItem>
                        </td>
                        <td>
                              <VListItem>
                                <VListItemTitle class="font-weight-medium me-4 text-overline">
                                  Copy Take Profit :
                                </VListItemTitle>
                                <template #append>
                                  <div class="d-flex align-center gap-x-2">
                                    <div v-if="slave.copy_tp" class="text-body-1">
                                        ACTIVE    
                                    </div>
                                    <div v-else class="text-body-1">
                                        INACTIVE    
                                    </div>
                                  </div>
                                </template>
                              </VListItem>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <VListItem>
                            <VListItemTitle class="font-weight-medium me-4 text-overline">
                              Reverse Trade :
                            </VListItemTitle>
                            <template #append>
                              <div class="d-flex align-center gap-x-2">
                                <div v-if="slave.is_reverse" class="text-body-1">
                                    ACTIVE    
                                </div>
                                <div v-else class="text-body-1">
                                    INACTIVE    
                                </div>
                              </div>
                            </template>
                          </VListItem>
                        </td>
                        <td>
                              
                        </td>
                      </tr>
                    </VTable>
                  </div>
                </div>
              </VTimelineItem>
            </VTimeline>
          </VCol>
        </VCard>

        <!-- <VSkeletonLoader v-else v-for="i in 3" :key="i" type="table-tbody"/> -->
      </VCol>

    </VRow>


  </VCard>
  <!-- Delete Master Confirmation Dialog -->
  <ConfirmDialog v-model:isDialogVisible="isMasterDeleteConfirmDialog" @confirm="handleMasterRemove"
    confirmation-question="Are you sure you want to delete this Master Account?" cancel-title="Cancel"
    confirm-title="Delete!" />

    <!-- Delete Slave Confirmation Dialog -->
  <ConfirmDialog v-model:isDialogVisible="isDeleteConfirmDialog" @confirm="handleConfirm"
    confirmation-question="Are you sure you want to delete this Slave Account?" cancel-title="Cancel"
    confirm-title="Delete!"  />


  <VDialog v-model="isErrorDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="error" class="my-4"
          style="block-size: 88px; inline-size: 88px; pointer-events: none;">
          <span class="text-5xl font-weight-light">X</span>
        </VBtn>
        <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
        <p>{{ errorMessage }}</p>
        <VBtn color="success" @click="handlePageReload">Ok</VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog v-model="isSuccessDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="success" class="my-4"
          style="block-size: 88px; inline-size: 88px; pointer-events: none;">
          <VIcon icon="tabler-check" size="38" />
        </VBtn>
        <h1 class="text-h4 mb-4">{{ successTitle }}</h1>
        <p>{{ successMessage }}</p>
        <VBtn color="success" @click="handlePageReload()">OK</VBtn>
      </VCardText>
    </VCard>
  </VDialog>



  <AlgoCopierDialog v-model:isDialogVisible="isAddCopierModalVisible" />

  <EditMasterCopier v-model:isDialogVisible="isShowEditMasterModal" :selectedMaster="selectedMaster" />

  <AddSlaveDialog v-model:isDialogVisible="isShowAddSlaveModal" :slaveDetails="slaveDetails" />

  <EditSlaveDialog v-model:isDialogVisible="isSlaveEditShowModal" :selectedSlave="selectedSlave"
    :slaveDetails="slaveDetails" />
</template>

<style scoped>
.selected-card {
  border: 1px solid #42b983;
  background-color: rgba(0, 0, 0, 0);
}

.selected-cards {
  border: 2px solid #42b983;
  /* Adjust the color and thickness as needed */
  border-radius: 8px;
  /* Optional: to give the border rounded corners */
}
</style>
