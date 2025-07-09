<script setup>

const mtAccountList = ref([])
const accountsWithBalance = ref([])
const selectedFromAccount = ref(null)
const selectedAccount = ref([])
const toAccountList = ref([])
const selectedToAccount = ref(null)
const amtToTransfer = ref(null)
const accountBalance = ref(null)
const fromAccountCredit = ref(null)
const isTransferBtnDisable = ref(false)
const isMandotoryFilled = ref(null)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const isBtnLoading = ref(false)
const is_wallet = ref(null)
const toaccountBalance = ref(null)
const to_is_wallet = ref(null)

const props = defineProps({
  mt5ListData: {
    type: Object,
  },
  clientId: {
    type: Number,
  },
})

onMounted(async () => {
  fetchFundParams()
})


const fetchFundParams = async () => {
  const res = await $api(`getMtItransfer/${props.clientId}`, {
    method: 'GET',
    onResponseError({ response }) {
      //console.log(response);
      // errors.value = response._data.message
    },
  })
  if (res) {
    mtAccountList.value = res.mt_data
    accountsWithBalance.value = mtAccountList.value.filter(user => user.balance > 0)
  }
}
const transformedAccountsList = computed(() => {
  if (accountsWithBalance.value.length === 0) {
    return [{ display_name: 'Loading...', mt_userid: null }]
  }
  return accountsWithBalance.value.map(account => {
    const title = account.is_wallet ? `WALLET(${account.mt_userid})` : `MT${account.mt_userid}`
    return {
      ...account,
      display_name: title,
    }
  })
})
watch([selectedFromAccount], () => {
  toAccountList.value = mtAccountList.value.filter(item => item.mt_userid !== selectedFromAccount.value)

}, { deep: true, immediate: false })
const transformedtoAccountsList = computed(() => {
  if (toAccountList.value.length === 0) {
    return [{ display_name: 'Loading...', mt_userid: null }]
  }
  return toAccountList.value.map(account => {
    const title = account.is_wallet ? `WALLET(${account.mt_userid})` : `MT${account.mt_userid}`
    return {
      ...account,
      display_name: title,
    }
  })
})

watch([selectedFromAccount, amtToTransfer], () => {
  const selectedAccount = mtAccountList.value.find(item => item.mt_userid === selectedFromAccount.value)
  accountBalance.value = selectedAccount.balance
  fromAccountCredit.value = selectedAccount.credit
  is_wallet.value = selectedAccount.is_wallet
  if (accountBalance.value < amtToTransfer.value) {
    isTransferBtnDisable.value = true
  } else {
    isTransferBtnDisable.value = false

  }
}, { deep: true, immediate: false })

watch([selectedToAccount], () => {
  const selectedAccount = toAccountList.value.find(item => item.mt_userid === selectedToAccount.value)
  toaccountBalance.value = selectedAccount.balance
  to_is_wallet.value = selectedAccount.is_wallet

}, { deep: true, immediate: false })

function handleTransferSubmit() {

  if (selectedFromAccount.value === null || selectedToAccount.value === null || amtToTransfer.value === null) {
    isMandotoryFilled.value = false
  } else {
    isMandotoryFilled.value = true
    isConfirmDialogVisible.value = true

  }
}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isBtnLoading.value = true
    try {
      const res = await $api('/processInternalTransfer', {
        method: 'POST',
        body: {
          from_account: selectedFromAccount.value,
          client_id: props.clientId,
          to_account: selectedToAccount.value,
          amount: amtToTransfer.value,
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isErrorDialogVisible.value = true
          isBtnLoading.value = false
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Amount Transferred Successfully !'
        isSuccessDialogVisible.value = true
        isBtnLoading.value = false
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.response ? Ex.response.data.message : Ex.message
      isErrorDialogVisible.value = true
      isBtnLoading.value = false
    }
  }
}
const handlePageReload = () => {
  window.location.reload()
}
</script>
<template>
  <VAlert v-if="mt5ListData.length===0" type="warning">
    Unable to create a Internal Transfer ticket: <strong>No MT5 Account found.</strong>
  </VAlert>
  <div v-else class="px-2 col-12 mt-4">
    <VRow>
      <VCol cols="6">
        <AppSelect v-model="selectedFromAccount" :items="transformedAccountsList" item-title="display_name"
                   item-value="mt_userid" label="Transfer From" single-line :rules="[requiredValidator]"
        />
      </VCol>

      <VCol cols="6">
        <VChip v-if="selectedFromAccount" size="x-large" class="mt-4">
          <div class="pr-1">
            <VImg v-if="is_wallet === 0" :src="'/images/svg/mt5_lined.svg'" style="padding: 5px; width: 25px;"/>
            <i v-else class="tabler-wallet v-icon notranslate v-theme--light"></i>
          </div>
          <div>
            <span style="margin-right: 30px;">{{ is_wallet === 0 ? selectedFromAccount : 'Wallet' }}</span>
            <span style="margin-left: 30px;">Balance : {{
                formatCurrency(accountBalance)
              }}  |  Credit :{{ formatCurrency(fromAccountCredit) }}</span>
          </div>
        </VChip>
      </VCol>

      <VCol cols="6">
        <AppSelect v-model="selectedToAccount" :items="transformedtoAccountsList" item-title="display_name"
                   item-value="mt_userid" label="Transfer To" single-line :rules="[requiredValidator]"
        />
      </VCol>
      <VCol cols="6">
        <VChip v-if="selectedToAccount" size="x-large" class="mt-4">
          <div class="pr-1">
            <VImg v-if="to_is_wallet === 0" :src="'/images/svg/mt5_lined.svg'" style="padding: 5px; width: 25px;"/>
            <i v-else class="tabler-wallet v-icon notranslate v-theme--light"></i>
          </div>
          <div>
            <span style="margin-right: 30px;">{{ to_is_wallet === 0 ? selectedToAccount : 'Wallet' }}</span>
            <span style="margin-left: 30px;">{{ formatCurrency(toaccountBalance) }}</span>
          </div>
        </VChip>
      </VCol>
      <VCol cols="6">
        <AppTextField v-model="amtToTransfer" label="Amount " :rules="[requiredValidator]">
          <template #append-inner>
            <span>USD</span>
          </template>
        </AppTextField>
        <p v-if="isTransferBtnDisable" class="text-error">Not Enough Balance</p>
      </VCol>
      <VCol class="mt-5" cols="12">
        <p v-if="isMandotoryFilled===false" class="text-body-2 pt-3 pb-0 mb-3 text-error ps-3">All fields are
          mandatory</p>
        <VBtn class="me-2" color="primary" @click="handleTransferSubmit" :disabled="isTransferBtnDisable"
              :loading="isBtnLoading"
        >
          Submit
        </VBtn>
      </VCol>
    </VRow>
  </div>
  <InternalTransactionCustomConfirmDialogue v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                                            confirmation-question="Do you want to Transfer Amount?"
                                            :has-credit="fromAccountCredit>0"
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
