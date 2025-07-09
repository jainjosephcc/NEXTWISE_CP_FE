<script setup>
import { computed } from "vue"

const props = defineProps({
  clientDocs: {
    type: Object,
    required: false,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  docVerificationStatus: {
    type: Number,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },
})
const isConfirmDialogVisible = ref(false)
const isRejectDialogVisible=ref(false)
const isApproveLoading = ref(false)
const isApproveDisabled = ref(false)
const isRejectLoading = ref(false)
const isRejectDisabled = ref(false)
const isSuccessDialogVisible = ref(false)
let successTitle = ref('')
let successMessage = ref('')
const isErrorDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

const handleConfirmApproveDoc = async (confirmed) => {
  if (confirmed) {
    isConfirmDialogVisible.value = false
    isApproveLoading.value = true
    isApproveDisabled.value = true
    const res = await $api('/client/client-doc/approve', {
      method: 'POST',
      body: {
        client_id: props.clientId,
      },
      onResponseError({ response }) {
        isSubmitLoading.value = false
        isDisabled.value = false
        errorTitle.value = 'Something Went Wrong !'
        errorMessage.value = response._data.message
        isErrorDialogVisible.value = true
      },
    })
    if (res) {
      successTitle.value = 'Documents Approved !'
      successMessage.value = 'Client Docs Approved Successfully !'
      isSuccessDialogVisible.value = true
      isSubmitLoading.value = false
      isDisabled.value = false
    }
  }
}
// Rejecting client doc
const handleConfirmRejectDoc = async (confirmed) => {
  if (confirmed) {
    isRejectDialogVisible.value = false
    isRejectLoading.value = true
    isRejectDisabled.value = true
    const res = await $api('/client/client-doc/reject', {
      method: 'POST',
      body: {
        client_id: props.clientId,
      },
      onResponseError({ response }) {
        isDisabled.value = false
        errorTitle.value = 'Something Went Wrong !'
        errorMessage.value = response._data.message
        isErrorDialogVisible.value = true
      },
    })
    if (res) {
      successTitle.value = 'Documents Rejected !'
      successMessage.value = 'Client Docs Rejected Successfully !'
      isSuccessDialogVisible.value = true
    }
  }
}


watch(props, () => {
})

const handlePageReload = async (confirmed) => {
  window.location.reload()
}

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}

const getDocUrl = (clientId, docType, docPath) => {
  const baseUrl = import.meta.env.VITE_S3_BASE_URL
  return `${baseUrl}/userdocs/${clientId}/${docType}/${docPath}`
}


</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>
    <VCard class="pb-6">
      <VCardTitle class="pt-3">Uploaded Documents</VCardTitle>
      <VDivider/>

      <VCardItem v-for="doc in clientDocs" :key="doc.id">
        <div class="border rounded">
          <div class="d-flex align-center gap-4 pa-6 position-relative flex-column flex-sm-row">
            <a target="_blank" :href="getDocUrl(doc.client_id,doc.doc_type,doc.doc_path)">
              <VImg width="140"
                    :src="getDocUrl(doc.client_id,doc.doc_type,doc.doc_path)"
              />
            </a>
            <div class="d-flex w-100 flex-column flex-md-row">
              <div class="d-flex flex-column gap-y-2">
                <h6 class="text-h6">
                  {{ doc.doc_type === 'poa' ? 'Proof of Address' : 'Proof of Identity' }}
                </h6>
                <div class="d-flex align-center text-no-wrap gap-4 text-body-1">
                  <div class="text-disabled">
                    Doc :
                    <a target="_blank" :href="getDocUrl(doc.client_id,doc.doc_type,doc.doc_path)"><span
                      class="d-inline-block text-primary"
                    >{{ doc.doc_path }}</span></a>
                  </div>
                  <VChip v-if="doc.status===0" color="warning" label size="small">Pending Review</VChip>
                  <VChip v-if="doc.status===3" color="success" label size="small">Approved</VChip>
                  <VChip v-if="doc.status===2" color="error" label size="small">Rejected</VChip>
                </div>
              </div>

              <VSpacer/>

              <!--                <div v-if="doc.status===0"
                                class="d-flex flex-column text-start text-md-end"
                                :class="$vuetify.display.mdAndDown ? 'gap-2' : 'gap-4'"
                              >
                                <div>
                                  <VBtn
                                    variant="tonal"
                                    size="small">
                                    Approve
                                  </VBtn>
                                </div>
                                <div>
                                  <VBtn
                                    variant="tonal"
                                    color="error"
                                    size="small">
                                    Reject
                                  </VBtn>
                                </div>
                              </div>-->
            </div>
          </div>
        </div>
      </VCardItem>
      <VCol v-if="props.docVerificationStatus!==3"
            cols="12"
            class="d-flex gap-4 float-end align-content-end end pe-6 pt-9"
      >
        <VSpacer/>
        <VBtn
          v-if="hasAccess('process_client_document') && props.docVerificationStatus!==3"
          :loading="isApproveLoading"
          :disabled="isApproveDisabled"
          @click="isConfirmDialogVisible = true"
        >
          Approve Client Docs
        </VBtn>

        <VBtn
          v-if="hasAccess('process_client_document') && props.docVerificationStatus!==2"
          :loading="isRejectLoading"
          :disabled="isRejectDisabled"
          @click="isRejectDialogVisible = true"
          color="error"
        >
        
          Reject Client Docs
        </VBtn>

        <VBtn
          @click="dialogModelValueUpdate(false)"
          type="reset"
          color="secondary"
          variant="tonal"
        >
          Cancel
        </VBtn>
      </VCol>
    </VCard>
  </VDialog>

  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirmApproveDoc"
                 confirmation-question="Are you sure you want to approve the documents of this client?"
                 cancel-title="Cancelled"
                 confirm-title="Cancelled!"
  />

  <ConfirmDialog v-model:isDialogVisible="isRejectDialogVisible" @confirm="handleConfirmRejectDoc"
                 confirmation-question="Are you sure you want to reject the documents of this client?"
                 cancel-title="Cancelled"
                 confirm-title="Cancelled!"
  />

  <VDialog v-model="isSuccessDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="success" class="my-4"
              style=" block-size: 88px;inline-size: 88px; pointer-events: none;"
        >
          <VIcon icon="tabler-check" size="38"/>
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
              style=" block-size: 88px;inline-size: 88px; pointer-events: none;"
        >
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
