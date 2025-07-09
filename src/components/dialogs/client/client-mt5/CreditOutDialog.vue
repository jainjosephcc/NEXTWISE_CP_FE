<script setup>

const amtInUSD = ref(null)
const isSubmitBtnDisable = ref(false)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const isSubmitLoading = ref(false)

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  mt_id: {
    type: Number,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },
  account_data: {
    type: Object,
    required: true,
  },

})

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])
const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}
watch([amtInUSD], () => {
  if (props.account_data.credit < amtInUSD.value) {
    isSubmitBtnDisable.value = true
  } else {
    isSubmitBtnDisable.value = false

  }
}, { deep: true, immediate: false })

function handleSubmitBtn() {
  isConfirmDialogVisible.value = true

}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isSubmitLoading.value = true
    try {
      const res = await $api('/processCreditOut', {
        method: 'POST',
        body: {
          amount: amtInUSD.value,
          mt5id: props.mt_id,
          action: 1,
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isErrorDialogVisible.value = true
          isSubmitLoading.value = false
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Transaction Processed Successfully !'
        isSuccessDialogVisible.value = true
        isSubmitLoading.value = false
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.response ? Ex.response.data.message : Ex.message
      isErrorDialogVisible.value = true
      isSubmitLoading.value = false
    }
  }
}
const handlePageReload = () => {
  window.location.reload()
}

</script>
<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>
    <VCard>
      <VCardTitle class="pt-3">CREDIT OUT TRANSACTION</VCardTitle>
      <VDivider/>
      <VRow>
        <VCol cols="4">
          <VCardText>
            CREDIT BALANCE<br><br>
            <!-- {{account_data.credit}} -->
            {{ formatCurrency(account_data.credit) }}
          </VCardText>
        </VCol>
      </VRow>
      <VRow class="mt-2 ms-2 mb-3">
        <VCol cols="6">
          <AppTextField v-model="amtInUSD" label="Credit to be removed " :rules="[requiredValidator]">
            <template #append-inner>
              <span>USD</span>
            </template>
          </AppTextField>
          <p v-if="isSubmitBtnDisable" class="text-error">Not Enough Balance</p>
        </VCol>
        <VCol cols="12">
          <VBtn class="me-2" color="primary" @click="handleSubmitBtn"
                :disabled="amtInUSD === null || isSubmitBtnDisable" :loading="isSubmitLoading"
          >
            Submit
          </VBtn>
        </VCol>
      </VRow>
    </VCard>
  </VDialog>
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Do you want to process this credit out transaction?" cancel-title="Cancelled"
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
              style=" block-size: 88px;inline-size: 88px; pointer-events: none;"
        >
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

</template>
