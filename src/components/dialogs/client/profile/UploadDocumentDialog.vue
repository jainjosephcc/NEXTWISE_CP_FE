<script setup>
import { ref } from 'vue';

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },
});

const isUpdateLoading = ref(false);
const isUpdateDisabled = ref(false);
const isConfirmDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
let errorTitle = ref('');
let errorMessage = ref('');
let successTitle = ref('');
let successMessage = ref('');

const emit = defineEmits(['update:isDialogVisible']);
const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes

const fileRules = [
  fileList => !fileList || !fileList.length || fileList[0].size <= maxFileSize || 'File size should be less than 2 MB!',
  fileList => !fileList || !fileList.length || ['image/png', 'image/jpeg', 'image/bmp', 'application/pdf'].includes(fileList[0].type) || 'Only image or PDF files are allowed!',
];

const poi = ref(null);
const poi1 = ref(null);
const poa = ref(null);
const poa1 = ref(null);

const handlePageReload = () => {
  window.location.reload();
};

const isDataValidated = async () => {
  let validFilesCount = 0;

  // Validate each file input
  const files = [poi.value, poi1.value, poa.value, poa1.value];
  for (const file of files) {
    if (file && file.length && fileRules.every(rule => rule(file) === true)) {
      validFilesCount++;
    }
  }

  // Check if at least two files are selected and valid
  if (validFilesCount >= 2) {
    isConfirmDialogVisible.value = true;
  } else {
    errorTitle.value = 'Validation Error';
    errorMessage.value = 'At least two valid files must be selected.';
    isErrorDialogVisible.value = true;
  }
};

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isUpdateLoading.value = true;
    const formData = new FormData();
    formData.append('poi', poi.value ? poi.value[0] : '');
    formData.append('poi1', poi1.value ? poi1.value[0] : '');
    formData.append('poa', poa.value ? poa.value[0] : '');
    formData.append('poa1', poa1.value ? poa1.value[0] : '');
    formData.append('client_id', props.clientId);

    try {
      const res = await $api('/storeClientDocument', {
        method: 'POST',
        body: formData,
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !';
          errorMessage.value = response._data.message;
          isUpdateLoading.value = false;
          isErrorDialogVisible.value = true;
        },
      });
      if (res) {
        successTitle.value = 'Success !';
        successMessage.value = 'Documents Updated Successfully !';
        isUpdateLoading.value = false;
        isSuccessDialogVisible.value = true;
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !';
      errorMessage.value = Ex.response ? Ex.response.data.message : Ex.message;
      isUpdateLoading.value = false;
      isErrorDialogVisible.value = true;
    }
  }
};

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val);
};
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 700" :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate">
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard title="Upload Documents">
      <VCardText>
        <VRow>
          <VCol cols="6">
            <VFileInput v-model="poi" :rules="fileRules" label="Upload POI"
              accept="image/png, image/jpeg, image/bmp, application/pdf" placeholder="Select file for POI"
              prepend-icon="tabler-camera" />
          </VCol>
          <VCol cols="6">
            <VFileInput v-model="poi1" :rules="fileRules" label="Upload POI1"
              accept="image/png, image/jpeg, image/bmp, application/pdf" placeholder="Select file for POI1"
              prepend-icon="tabler-camera" />
          </VCol>
          <VCol cols="6">
            <VFileInput v-model="poa" :rules="fileRules" label="Upload POA"
              accept="image/png, image/jpeg, image/bmp, application/pdf" placeholder="Select file for POA"
              prepend-icon="tabler-camera" />
          </VCol>
          <VCol cols="6">
            <VFileInput v-model="poa1" :rules="fileRules" label="Upload POA1"
              accept="image/png, image/jpeg, image/bmp, application/pdf" placeholder="Select file for POA1"
              prepend-icon="tabler-camera" />
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="dialogModelValueUpdate(false)">
          Close
        </VBtn>
        <VBtn :loading="isUpdateLoading" :disabled="isUpdateDisabled" @click="isDataValidated" class="align-self-end"
          :block="$vuetify.display.md">
          Upload Documents
        </VBtn>
      </VCardText>

      <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm" cancel-title="Cancelled"
        confirm-title="Confirm" confirmation-question="Are you sure you want to upload the selected documents?" />

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
            <VBtn color="success" @click="handlePageReload">
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
            <VBtn color="success" @click="isErrorDialogVisible = false">
              OK
            </VBtn>
          </VCardText>
        </VCard>
      </VDialog>

    </VCard>
  </VDialog>
</template>
