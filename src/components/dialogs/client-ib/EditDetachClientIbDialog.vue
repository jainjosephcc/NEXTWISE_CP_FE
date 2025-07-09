<script setup>


const isApproveBtnLoading = ref(false)
const isConfirmDialogVisible = ref(false)
const isMandotoryFilled = ref(null)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
const isUpdateDisabled = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val)
}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isApproveBtnLoading.value = true
    try {
      const formData = new FormData()
      formData.append('client_id', props.clientId)
      const res = await $api('/detachIb', {
        method: 'POST',
        body: formData,
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isApproveBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Client Successfully Detached from the IB !'
        isApproveBtnLoading.value = false
        isSuccessDialogVisible.value = true
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.data.message
      isApproveBtnLoading.value = false
      isErrorDialogVisible.value = true
    }
  }
}

const handlePageReload = async () => {
  window.location.reload()
}

function handleAddTeamSubmit() {
  isConfirmDialogVisible.value = true
}
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close button -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>


    <VCard title="Detach Client From IB">
      <VCardText>
        <VRow>
          <VCol>
            <VForm @submit.prevent="() => { }">
              <VRow>
                <VCol cols="12">
                  <VAlert type="warning">
                    Detaching this client will stop the current IB from receiving any further commissions from the
                    client's trades. Additionally, there may be a discrepancy in the existing commissions already
                    generated for the IB, as the client will no longer be associated with them.
                  </VAlert>
                </VCol>
                <VCol cols="12">
                </VCol>
              </VRow>
            </VForm>
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="dialogModelValueUpdate(false)">
          Close
        </VBtn>
        <VBtn :loading="isApproveBtnLoading" :disabled="isUpdateDisabled" @click="handleAddTeamSubmit()"
              class="align-self-end" :block="$vuetify.display.md"
        >
          Detach
        </VBtn>
      </VCardText>

    </VCard>
    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                   confirmation-question="Are you sure you want to Detach this Client From IB?"
                   cancel-title="Cancelled"
                   confirm-title="Confirmed!"
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
  </VDialog>

</template>

<style scoped>
/* Add custom styles here if needed */
</style>
