<script setup>
import { onMounted, ref } from 'vue';

const creditlist = ref([]); // Credit data list
const error = ref(null); // Error handling
const isDeleteConfirmDialog = ref(false); // For delete confirmation dialog
const eventId = ref(null); // Holds the selected event ID for deletion
const eventMT5ID = ref(null); // Holds the selected MT5 ID for deletion
const successTitle = ref(''); // Success dialog title
const successMessage = ref(''); // Success message
const errorTitle = ref(''); // Error dialog title
const errorMessage = ref(''); // Error message
const isSuccessDialogVisible = ref(false); // Success dialog visibility
const isErrorDialogVisible = ref(false); // Error dialog visibility
const isLoading = ref(false); // Loader state

// Fetch the credit list from API
const fetchCreditList = async () => {
  try {
    isLoading.value = true; // Show loader
    const res = await $api('meta-credit-manager/list', {
      method: 'GET',
    });
    if (res) {
      creditlist.value = res.data;
    }
  } catch (err) {
    console.error('Error fetching credit data:', err);
    error.value = err;
  } finally {
    isLoading.value = false; // Hide loader
  }
};

// Function to refresh individual MT5 data
const refreshMT5Data = async (mt_id) => {
  try {
    isLoading.value = true; // Show loader
    const res = await $api(`meta-credit-manager/mt-info/${mt_id}`, {
      method: 'GET',
    });
    if (res) {
      const updatedData = res.data;
      const index = creditlist.value.findIndex((item) => item.mt5_id === mt_id);
      if (index !== -1) {
        creditlist.value[index] = { ...creditlist.value[index], ...updatedData };
      }
    }
  } catch (err) {
    console.error(`Error fetching data for MT5 ID: ${mt_id}`, err);
  } finally {
    isLoading.value = false; // Hide loader
  }
};

// Function to refresh all MT5 data
const refreshAllMT5Data = async () => {
  try {
    isLoading.value = true; // Show loader
    const res = await $api('meta-credit-manager/mt-info/update-all', {
      method: 'GET',
    });
    if (res) {
      // Refresh the credit list after updating all data
      // await fetchCreditList();
      successTitle.value = 'Data Refreshed!';
      successMessage.value = 'All MT5 credit data has been refreshed successfully!';
      isSuccessDialogVisible.value = true;
    }
  } catch (err) {
    console.error('Error refreshing all MT5 data:', err);
    errorTitle.value = 'Something Went Wrong!';
    errorMessage.value = err.response?._data?.message || 'Error occurred';
    isErrorDialogVisible.value = true;
  } finally {
    isLoading.value = false; // Hide loader
  }
};

// Function to handle delete button click and open confirmation dialog
const handleDelete = (credit) => {
  eventId.value = credit.id; // Set selected credit id
  eventMT5ID.value = credit.mt5_id; // Set selected mt5_id
  isDeleteConfirmDialog.value = true; // Show confirmation dialog
};

// Function to handle confirmation of delete action
const handleConfirm = async (confirmed) => {
  if (confirmed) {
    try {
      const res = await $api('meta-credit-manager/delete', {
        method: 'POST',
        body: {
          id: eventId.value, // Send the selected ID
          mt5_id: eventMT5ID.value, // Send the selected MT5 ID
        },
      });

      if (res) {
        // Handle success: remove the deleted item from the list
        creditlist.value = creditlist.value.filter(
          (item) => item.id !== eventId.value
        );
        successTitle.value = 'Deleted!';
        successMessage.value = 'Credit entry deleted successfully!';
        isSuccessDialogVisible.value = true;
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!';
      errorMessage.value = Ex.response?._data?.message || 'Error occurred';
      isErrorDialogVisible.value = true;
    }
  }
};

// Reload page after confirmation dialogs
const handlePageReload = () => {
  window.location.reload();
};

// Fetch credit list on component mount
onMounted(() => {
  fetchCreditList();
});
</script>

<template>
  <section>
    <!-- Header Section -->
    <div class="d-flex mb-6">
      <VRow>
        <VCol cols="12">
          <VCard>
            <VCardText>
              <div class="d-flex align-center justify-space-between">
                <VCardTitle>
                  Credit Manager
                </VCardTitle>
                <div>
                  <VBtn class="me-2" @click="refreshAllMT5Data" :disabled="isLoading">
                    <VIcon icon="tabler-refresh" />Refresh Data
                    <VProgressCircular v-if="isLoading" indeterminate size="24" class="ms-2" />
                  </VBtn>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- Table Section -->
    <VCard class="mb-6">
      <VRow>
        <VCol cols="12">
          <VCard>
            <VTable height="800" fixed-header class="text-no-wrap">
              <thead>
                <tr>
                  <th>MT5ID</th>
                  <th>ID</th>
                  <th>CLIENET NAME</th>
                  <th>LOSABLE</th>
                  <th>NON LOSABLE</th>
                  <th>BALANCE</th>
                  <th>CREDIT</th>
                  <th>LAST FETCHED</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cr in creditlist" :key="cr.id">
                  <td>
                    <!-- Avatar and MT5ID display -->
                    <div style="block-size: 100px; inline-size: 60px;"
                      class="d-flex flex-column justify-center align-center cursor-pointer rounded py-4 px-5 me-4">
                      <VAvatar rounded size="45" variant="tonal" class="mb-2 ps-1 pe-1">
                        <VImg src="/images/svg/mt5_lined.svg" size="22" />
                      </VAvatar>
                      {{ cr.mt5_id }}
                    </div>
                  </td>
                  <td>
                    <VChip size="x-small">
                      {{ cr.id }}
                    </VChip>
                  </td>
                  <td>
                    <CustomClientCardChip :client_name="cr.client_name" :client_id="cr.client_id" :email="cr.email">
                    </CustomClientCardChip>
                  </td>


                  <td>{{ cr.losable }}</td>
                  <td>{{ cr.non_losable }}</td>
                  <td>{{ cr.balance }}</td>
                  <td>{{ cr.credit }}</td>
                  <td>{{ cr.last_fetched_at ? cr.last_fetched_at : 'Never Fetched' }}</td>
                  <td>
                    <!-- Refresh Icon for API Call -->
                    <VIcon icon="tabler-refresh" class="me-2" @click="refreshMT5Data(cr.mt5_id)" />
                    <!-- Trash Icon for Delete Action -->
                    <VIcon icon="tabler-trash" @click="handleDelete(cr)" />
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCard>
        </VCol>
      </VRow>
    </VCard>
  </section>

  <!-- Confirmation Dialog for Delete -->
  <ConfirmDialog v-model:isDialogVisible="isDeleteConfirmDialog" @confirm="handleConfirm"
    confirmation-question="Are you sure you want to delete this credit?" cancel-title="Cancel"
    confirm-title="Delete!" />

  <!-- Success Dialog -->
  <VDialog v-model="isSuccessDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="success" class="my-4" style="block-size: 88px; inline-size: 88px;">
          <VIcon icon="tabler-check" size="38" />
        </VBtn>
        <h1 class="text-h4 mb-4">{{ successTitle }}</h1>
        <p>{{ successMessage }}</p>
        <VBtn color="success" @click="handlePageReload">OK</VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Error Dialog -->
  <VDialog v-model="isErrorDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="error" class="my-4" style="block-size: 88px; inline-size: 88px;">
          <span class="text-5xl font-weight-light">X</span>
        </VBtn>
        <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
        <p>{{ errorMessage }}</p>
        <VBtn color="success" @click="handlePageReload">OK</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
/* Add component-specific styles here */
</style>
