<script setup>
import { ref } from "vue"
import { fetchStaffList, staffList } from "@/utils/apiUtils.js"

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },
  isAssign: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible'])

const selectedManager = ref(null);
const isConfirmDialogVisible = ref(false);
const isUpdateLoading = ref(false);
const isUpdateDisabled = ref(false);
const isSuccessDialogVisible = ref(false);
let successTitle = ref('')
let successMessage = ref('')
const isErrorDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')

const managerList = ref([]);

watch(() => props.isDialogVisible, async (newVal) => {
  if (newVal) {
    await fetchStaffList();
    managerList.value = staffList.value.map(staff => ({
      title: staff.staff_name,
      value: staff.id.toString() // Convert id to string to match your example
    }));
  }
}, { immediate: true })

const handleAssignmanagerSubmit = async (confirmed) => {
  if (confirmed) {
    isConfirmDialogVisible.value=false;
    isUpdateLoading.value=true;
    isUpdateDisabled.value=true;
    const res = await $api('/updateClientManager', {
      method: 'POST',
      body: {
        client_id: props.clientId,
        manager_id: selectedManager.value,
      },
      onResponseError({ response }) {
        isUpdateLoading.value=false;
        isUpdateDisabled.value=false;
        errorTitle.value = 'Something Went Wrong !';
        errorMessage.value = 'Something Went Wrong !';
        isErrorDialogVisible.value=true;
      },
    })
    if(res){
      successTitle.value = 'Manager Assigned !'
      successMessage.value = 'Manager assigned to the client Successfully !';
      isSuccessDialogVisible.value = true;
      isUpdateLoading.value=false;
      isUpdateDisabled.value=false;
    }
  }
}

const handlePageReload = async (confirmed) => {
  window.location.reload();
}

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <!-- 👉 upgrade plan -->
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 650"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pt-1">
      <VCardText>
        <!-- 👉 Title -->
        <h5 class="text-h4 text-start mb-2">
          {{isAssign?'Assign Manager':'Reassign Manager'}}
        </h5>
        <p class="text-body-1 text-start mb-3">
          {{isAssign?'Choose a manager to map the client.':'Choose a manager to re-map the client.'}}
        </p>
        <VDivider class="py-3"/>

        <div class="d-flex justify-space-between flex-column flex-sm-row gap-4 pb-10">
          <AppSelect
            v-model="selectedManager"
            label="Select Manager"
            placeholder="Assigned Manager"
            :items="managerList"
            clearable
            clear-icon="tabler-x"
          />

          <VBtn
            :loading="isUpdateLoading"
            :disabled="isUpdateDisabled"
            @click="isConfirmDialogVisible=true"
            class="align-self-end"
            :block="$vuetify.display.xs"
          >
            Update
          </VBtn>
        </div>
      </VCardText>

      <!-- 👉 Confirm Dialog -->
      <ConfirmDialog
        v-model:isDialogVisible="isConfirmDialogVisible"
        @confirm="handleAssignmanagerSubmit"
        cancel-title="Cancelled"
        confirm-title="Cancelled!"
        confirmation-question="Are you sure you want to assign the selected manager to the client ?"
      />

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


    </VCard>
  </VDialog>
</template>
