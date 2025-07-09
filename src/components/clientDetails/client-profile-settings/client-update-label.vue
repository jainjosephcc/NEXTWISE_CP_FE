<script setup>
import { ref } from "vue"


const selectedOption = ref(null)
const radioOptions = [
  { text: 'Premium', value: 0 },
  { text: 'Regular', value: 1 },
]
const isSubmitLoading = ref(false)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')


const props = defineProps({
  clientId: {
    type: Number,
    required: true,
  },
})

function handleSubmitBtn() {
  isConfirmDialogVisible.value = true

}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isSubmitLoading.value = true
    try {
      const res = await $api('/submitCreditInRequest1', {
        method: 'POST',
        body: {
          amount: amtInUSD.value,
          transaction_type: selectedOption.value,
          client_id: props.clientId,
          mt_id: props.mt_id,
          // action: 1
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
        successMessage.value = 'Credit Requested Successfully !'
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
  <VRow class="ms-5">
    <VCol cols="12">
      <div class="mt-3 ms-3">
        <h5 class="text-h5">Update Label54</h5>
      </div>
      <VDivider/>
    </VCol>
    <VCol cols="12">
      <VCardSubtitle>
        Type
      </VCardSubtitle>
      <VRadioGroup v-model="selectedOption" inline>
        <VRadio
          v-for="radio in radioOptions"
          :key="radio.value"
          :label="radio.text"
          :color="primary"
          :value="radio.value"
        />
      </VRadioGroup>
    </VCol>
    <VCol cols="12">
      <VBtn class="me-2" color="primary" @click="handleSubmitBtn" :loading="isSubmitLoading">
        Submit
      </VBtn>
    </VCol>
  </VRow>
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Do you want to update label?" cancel-title="Cancelled"
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
