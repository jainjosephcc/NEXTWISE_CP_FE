<script setup>
import AddNewServerDialog from "@/components/dialogs/Servers/AddNewServerDialog.vue";
import girlUsingMobile from '@images/pages/girl-using-mobile.png';
import { onMounted, ref } from "vue";
const isRoleDialogVisible = ref(false);
const roleDetail = ref(null);
const isSnackbarVisible = ref(false);
const snackBarText = ref('');
const selectedServer = ref(null);
const isAddDialogVisible = ref(false);
const isEditServerModal = ref(false);
const serverList = ref(null);
const isDeleteConfirmDialog = ref(false);
const serverId = ref(null); // Use serverId for server deletion
const successTitle = ref('');
const successMessage = ref('');
const errorTitle = ref('');
const errorMessage = ref('');
const isSuccessDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);

const SERVER_NAME = import.meta.env.VITE_SERVER_NAME

// Fetch server list from API
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
    console.log(res)

  } catch (error) {
    console.error(error)
  }
}

// Handle delete action
function handleDelete(server) {
  serverId.value = server.id; // Set the server ID to delete
  isDeleteConfirmDialog.value = true; // Open delete confirmation dialog
}

// Confirm delete action
const handleConfirm = async (confirmed) => {
  if (confirmed) {
    try {
      const res = await $api('/meta-servers/delete', {
        method: 'POST',
        body: {
          id: serverId.value, // Pass the server ID to delete
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong!';
          errorMessage.value = response._data.message;
          isErrorDialogVisible.value = true;
        },
      });
      if (res) {
        successTitle.value = 'Deleted!';
        successMessage.value = 'Server Deleted Successfully!';
        isSuccessDialogVisible.value = true;

        // Refresh the server list after successful deletion
        await fetchServerList();
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!';
      errorMessage.value = Ex.data.message;
      isErrorDialogVisible.value = true;
    }
  }
};


// Function to show the add server modal
function showAddServerModal() {
  isAddDialogVisible.value = true;
}

// Function to show the edit modal
function showEditModal(server) {
  console.log('Editing server:', server);
  selectedServer.value = server;
  isEditServerModal.value = true;
}

// Define the copyToClipboard function here
const copyToClipboard = (text) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
};

// Function to copy IP and Port and display a snackbar
const copyIpPort = (ip, port) => {
  const data = `${ip}:${port}`;
  copyToClipboard(data);

  // Set snackbar message and show it
  snackBarText.value = 'IP and Port Copied to Clipboard';
  isSnackbarVisible.value = true;
};
const handlePageReload = async (confirmed) => {
  window.location.reload()
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-1">Managed Servers</h4>
      <p class="text-body-1 mb-0">View, Organize, and Manage All Your Servers in One Place</p>
    </VCol>

    <!-- Loop through the server list and render each server as a card -->
    <VCol v-for="(server, index) in serverList" :key="index" cols="12" sm="6" lg="4">
      <VCard>
        <!-- Server IP and Port -->
        <VCardText class="d-flex align-center pb-4">
          <div class="text-body-1">
            {{ server.server_ip }}:{{ server.server_port }}
          </div>
          <VSpacer />
          <div class="v-avatar-group">
            <div class="text-body-1">{{ server.server_type }}</div>
          </div>
        </VCardText>

        <!-- Server Name and Update Link -->
        <VCardText>
          <div class="d-flex justify-space-between align-center">
            <div>
              <h5 class="text-h5">{{ SERVER_NAME }}</h5>
              <div class="d-flex align-center pt-3">
                <VIcon icon="tabler-edit" class="me-2 me-2" @click="showEditModal(server)" />

                <a href="javascript:void(0)" class="me-2">Update </a>
                <VIcon icon="tabler-trash" class="me-2 me-2" @click="handleDelete(server)" />
                <a href="javascript:void(0)">Delete </a>
              </div>
            </div>
            <IconBtn @click="copyIpPort(server.server_ip, server.server_port)">
              <VIcon icon="tabler-copy" class="text-high-emphasis" />
            </IconBtn>
          </div>
        </VCardText>

        <!-- Server Manager and Status -->
        <VCardText class="d-flex align-center pb-4">
          <div class="text-body-1">MANAGER: --</div>
          <VSpacer />
          <div class="v-avatar-group">
            <VChip size="x-small" :color="server.status === 1 ? 'success' : 'error'">
              {{ server.status === 1 ? 'Active' : 'Inactive' }}
            </VChip>


          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Add New Server Card -->
    <VCol cols="12" sm="6" lg="4">
      <VCard class="h-100" :ripple="false">
        <VRow no-gutters class="h-100">
          <!-- Image on the left side -->
          <VCol cols="4" class="d-flex flex-column justify-center align-center">
            <img width="85" :src="girlUsingMobile" alt="Add New Server" />
          </VCol>
          <!-- Text and Button on the right side -->
          <VCol cols="8" class="d-flex flex-column justify-center align-center text-center">
            <VCardText class="d-flex flex-column align-center justify-center gap-4">
              <VBtn size="small" @click="showAddServerModal">Add New Server</VBtn>
              <div>Add new server,<br />if it doesn't exist.</div>
            </VCardText>
          </VCol>
        </VRow>
      </VCard>
    </VCol>


  </VRow>
  <ConfirmDialog v-model:isDialogVisible="isDeleteConfirmDialog" @confirm="handleConfirm"
    confirmation-question="Are you sure you want to delete this server?" cancel-title="Cancelled"
    confirm-title="Cancelled!" />

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
          style=" block-size: 88px; inline-size: 88px; pointer-events: none;">
          <span class="text-5xl font-weight-light">X</span>
        </VBtn>
        <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
        <p>{{ errorMessage }}</p>
        <VBtn color="success" @click="handlePageReload">
          Ok
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Snackbar for showing when IP and port are copied -->
  <VSnackbar v-model="isSnackbarVisible" :timeout="2000" bottom right>
    {{ snackBarText }}
  </VSnackbar>

  <!-- Add New Server Dialog -->
  <AddNewServerDialog v-model:isDialogVisible="isAddDialogVisible" />
  <!---Edit Server Dialog-->
  <EditServerDialog v-model:isDialogVisible="isEditServerModal" :selectedServer="selectedServer" />

  <!-- Edit Role Dialog -->
  <!-- Uncomment this if you have the Edit Role Dialog implemented -->
  <!-- <EditRoleDialog v-model:isDialogVisible="isRoleDialogVisible" :roleDetail="roleDetail" /> -->
</template>
