<script setup>

const accountDetails = ref(null)
const amtInUSD = ref(null)
const radioOptions = [
  { text: 'Losable Bonus', value: 0 },
  { text: 'Non-Losable Bonus', value: 1 },
]
const selectedOption = ref(null)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const selectedCheckbox = ref(0)
const isBtnSubmit = ref(false)
const isSubmitLoading = ref(false)

// const selectedRadio=ref(null)

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

})

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])
const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}

onMounted(async () => {
  await fetchAccountSummary()
})

const fetchAccountSummary = async () => {
  const res = await $api(`getClientMTAccountSummery/${props.mt_id}`, {
    method: 'GET',
    onResponseError({ response }) {
      //console.log(response);
      // errors.value = response._data.message
    },
  })
  accountDetails.value = res

}

function handleSubmitBtn() {
  isConfirmDialogVisible.value = true

}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isSubmitLoading.value = true
    try {
      const res = await $api('/processCreditIn', {
        method: 'POST',
        body: {
          amount: amtInUSD.value,
          type: selectedOption.value,
          client_id: props.clientId,
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
watch([selectedCheckbox], () => {
  if (selectedOption.value === 1) {
    if (selectedCheckbox.value) {
      isBtnSubmit.value = false
    } else {
      isBtnSubmit.value = true
    }
  } else {
    isBtnSubmit.value = false
  }

}, { deep: true, immediate: false })
watch([selectedOption], () => {
  if (selectedOption.value === 1) {
    isBtnSubmit.value = true
  } else {
    isBtnSubmit.value = false
  }


}, { deep: true, immediate: false })

</script>
<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>

    <VCard>
      <VCardTitle class="pt-3">CREDIT IN TRANSACTION</VCardTitle>
      <VDivider/>
      <VRow>
        <VCol cols="4">
          <VCardText>
            Total Losable Bonus Given<br><br>
            {{ formatCurrency(accountDetails.mt_accounts.l_bonus) }}
          </VCardText>
        </VCol>
        <VCol cols="4">
          <VCardText>
            Total Non-Losable Bonus Given<br><br>
            {{ formatCurrency(accountDetails.mt_accounts.nl_bonus) }}
          </VCardText>
        </VCol>
        <VCol cols="4">
          <VCardText>
            Group<br><br>
            {{ accountDetails.mt_accounts.groupname }}
          </VCardText>
        </VCol>
      </VRow>
      <VDivider/>
      <VRow class="mt-2 ms-2 mb-3">
        <VCol cols="6">
          <AppTextField v-model="amtInUSD" label="Amount in USD " :rules="[requiredValidator]">
            <template #append-inner>
              <span>USD</span>
            </template>
          </AppTextField>
        </VCol>
        <VCol cols="6">
          <VLabel>
            Credit Type
          </VLabel>
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
        <VCol cols="12" v-if="selectedOption===1">
          <VCheckbox
            v-model="selectedCheckbox"
            label="Already mapped in Meta Credit Management Tool for non-losable bonus management"
            color="primary"
            :value="true"
          />

        </VCol>
        <VCol cols="12">
          <VBtn class="me-2" color="primary" @click="handleSubmitBtn"
                :disabled="amtInUSD === null ||selectedOption===null || isBtnSubmit===true" :loading="isSubmitLoading"
          >
            Submit
          </VBtn>
        </VCol>

      </VRow>
    </VCard>
  </VDialog>
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Do you want to process this credit in transaction?" cancel-title="Cancelled"
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
