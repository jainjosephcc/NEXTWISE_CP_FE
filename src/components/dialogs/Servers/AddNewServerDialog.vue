<script setup>
import { ref, watch } from 'vue';


const title = ref(null);
const company = ref(null);
const selectedStatus = ref(null);
const apiUrl = ref(null); // New field
const serverType = ref("MT5"); // New field
const sslEnabled = ref(false); // New field (default to false)
const managerId = ref(null); // New field
const description = ref(''); // New field
const serverIp = ref(''); // New field for IP address
const serverPort = ref(null); // New field for port number

const isMandatoryFilled = ref(null);
const isSubmitBtnDisable = ref(false);
const isSubmitBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
]);

const closeDialog = () => {
  emit('update:isDialogVisible', false); // Emit event to update dialog visibility
};

const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val);
};

function handleAddDetailsSubmit() {
  // Check if mandatory fields are filled
  if (title.value === null || selectedStatus.value === null || apiUrl.value === null ||
    serverType.value === null || managerId.value === null || description.value === '' ||
    serverIp.value === '' || serverPort.value === null) {
    isMandatoryFilled.value = false;
  } else {
    isMandatoryFilled.value = true;
    isConfirmDialogVisible.value = true;
  }
}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isSubmitBtnLoading.value = true;
    isSubmitBtnDisable.value = true;
    try {
      const res = await $api('meta-servers/store', {
        method: 'POST',
        body: {
          company_name: company.value,
          server_name: title.value,
          server_ip: serverIp.value,    // Pass IP address from user input
          server_port: serverPort.value, // Pass port number from user input
          api_url: apiUrl.value, // New field
          server_type: serverType.value, // New field
          ssl_enabled: sslEnabled.value, // New field
          manager_id: managerId.value, // New field
          status: selectedStatus.value,
          description: description.value // New field
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong!';
          errorMessage.value = response._data.message;
          isSubmitBtnLoading.value = false;
          isSubmitBtnDisable.value = false;
          isErrorDialogVisible.value = true;
        },
      });
      if (res) {
        successTitle.value = 'Success!';
        successMessage.value = 'Server details added successfully!';
        isSubmitBtnLoading.value = false;
        isSubmitBtnDisable.value = false;
        isSuccessDialogVisible.value = true;
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!';
      errorMessage.value = Ex.data.message;
      isSubmitBtnLoading.value = false;
      isSubmitBtnDisable.value = false;
      isErrorDialogVisible.value = true;
    }
  }
};

const handlePageReload = () => {
  window.location.reload();
}

const levelOption = [
  { text: 'Active', value: true },
  { text: 'Inactive', value: false },
];

watch([title], () => {
  if (title.value && title.value.length >= 30) {
    title.value = title.value.slice(0, 30); // Limit to 30 characters
  }
}, { deep: true, immediate: false });
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" v-model="props.isDialogVisible">
    <DialogCloseBtn @click="closeDialog" />
    <VCard class="pa-6 pa-sm-10">
      <div
        class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
        <div>
          <div class="d-flex align-center app-logo">
            <h6 class="app-logo-title">
              Add Server Details
            </h6>
          </div>
        </div>
      </div>
      <VForm @submit.prevent="() => { }">
        <VRow>
          <VCol cols="6">
            <AppTextField v-model="company" label="Company Name" maxlength="30" />
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="title" label="Server Name" maxlength="30" />
          </VCol>


          <VCol cols="6">
            <AppSelect v-model="selectedStatus" :items="levelOption" item-title="text" item-value="value" label="Status"
              single-line />
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="apiUrl" label="API URL" />
          </VCol>



          <VCol cols="6">
            <AppTextField v-model="serverType" label="Server Type" disabled />
          </VCol>


          <VCol cols="6">
            <AppTextField v-model="serverIp" label="Server IP" />
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="serverPort" label="Server Port" type="number" />
          </VCol>


          <VCol cols="6">
            <AppTextField v-model="managerId" label="Manager Id" type="number" />

          </VCol>
          <!-- <VCol cols="6">
            <AppCheckbox v-model="sslEnabled" label="SSL Enabled" />
          </VCol> -->


          <VCol cols="12">
            <AppTextField v-model="description" label="Description" />
          </VCol>
        </VRow>
        <p v-if="isMandatoryFilled === false" class="text-body-2 pt-3 pb-0 mb-3 text-error">All fields are mandatory</p>
        <VRow>
          <VCol cols="6">
            <VBtn class="me-2" color="primary" @click="handleAddDetailsSubmit()" :loading="isSubmitBtnLoading"
              :disabled="isSubmitBtnDisable">
              Submit
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </VDialog>

  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
    confirmation-question="Are you sure you want to add this server data?" cancel-title="Cancelled"
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
          style=" block-size: 88px; inline-size: 88px; pointer-events: none;">
          <span class="text-5xl font-weight-light">X</span>
        </VBtn>
        <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
        <p>{{ errorMessage }}</p>
        <VBtn color="success" @click="handlePageReload">
          OK
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
