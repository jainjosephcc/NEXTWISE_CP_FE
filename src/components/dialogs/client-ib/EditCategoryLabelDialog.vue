<script setup>

const selectedOption = ref(null)
const radioOptions = [
  { text: 'Premium', value: 1 },
  { text: 'Regular', value: 0 },
]
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
  clientId: {
    type: Number,
    required: true,
  },
  cat_label: {
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

onMounted(() => {
  selectedOption.value = props.cat_label
})

watch(() => props.cat_label, (newLabel) => {
  selectedOption.value = newLabel
})

function handleSubmitBtn() {
  isConfirmDialogVisible.value = true

}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isSubmitLoading.value = true

    try {
      const res = await $api('/updateClientLabel', {
        method: 'POST',
        body: {
          client_id: props.clientId,
          cat_label: selectedOption.value,
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
        successMessage.value = 'Category Label Updated Successfully !'
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
    <!-- Dialog close button -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>
    <VCard>
      <VCardTitle class="pt-3">Edit Category Label</VCardTitle>
      <VDivider/>
      <VCol cols="12">
        <VCardSubtitle>
          Type
        </VCardSubtitle>
        <VRadioGroup v-model="selectedOption" inline>
          <VRadio
            v-for="radio in radioOptions"
            :key="radio.value"
            :label="radio.text"
            color="primary"
            :value="radio.value"
          />
        </VRadioGroup>
      </VCol>
      <VCol cols="12">
        <VBtn class="me-2" color="primary" @click="handleSubmitBtn" :loading="isSubmitLoading">
          Submit
        </VBtn>
      </VCol>
    </VCard>
  </VDialog>
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Do you want to Update Category Label?" cancel-title="Cancelled"
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
