<script setup>
import { ref } from "vue"


const res = ref(null)
const mtAccountList = ref([])
const paymentList = ref([])
const bankDetails = ref(null)
const selectedAccount = ref(null)
const selectedPaymentMethod = ref(null)
const isBankDropdownVisible = ref(false)
const isQRCodeVisible = ref(false)
const QRCode = ref(null)
const amtToWithdraw = ref(null)
const walletId = ref(null)
const note = ref(null)
const isMandotoryFilled = ref(null)
const accountBalance = ref(null)
const iswithdrawBtnDisable = ref(false)
const selectedBank = ref('')
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const is_wallet = ref(null)
const isBtnLoading = ref(false)

const maxFileSize = 2 * 1024 * 1024 // 2MB in bytes

const fileRules = [
  fileList => !fileList || !fileList.length || fileList[0].size <= maxFileSize || 'File size should be less than 2 MB!',
  fileList => !fileList || !fileList.length || ['image/png', 'image/jpeg', 'image/bmp', 'application/pdf'].includes(fileList[0].type) || 'Only image or PDF files are allowed!',
]

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
  const res = await $api(`getWithDropdown/${props.clientId}`, {
    method: 'GET',
    onResponseError({ response }) {
      //console.log(response);
      // errors.value = response._data.message
    },
  })
  if (res) {
    res.value = res
    mtAccountList.value = res.mt5_data
    paymentList.value = res.payment_methods
    bankDetails.value = res.bank_details


  }
}
const transformedAccountsList = computed(() => {
  if (mtAccountList.value.length === 0) {
    return [{ display_name: 'Loading...', mt_userid: null }]
  }
  return mtAccountList.value.map(account => {
    const title = account.is_wallet ? `WALLET(${account.mt_userid})` : `MT${account.mt_userid}`
    return {
      ...account,
      display_name: title,
    }
  })
})

watch([selectedPaymentMethod], () => {
  if (selectedPaymentMethod.value === 1) {
    isBankDropdownVisible.value = true
    isQRCodeVisible.value = false

  } else if (selectedPaymentMethod.value === 3) {
    isQRCodeVisible.value = true
    isBankDropdownVisible.value = false
  } else {
    isBankDropdownVisible.value = false
    isQRCodeVisible.value = false
  }
}, { deep: true, immediate: false })

watch([selectedAccount, amtToWithdraw], () => {
  const selectedFromAccount = mtAccountList.value.find(item => item.mt_userid === selectedAccount.value)
  accountBalance.value = selectedFromAccount.balance
  is_wallet.value = selectedFromAccount.is_wallet
  if (accountBalance.value < amtToWithdraw.value) {
    iswithdrawBtnDisable.value = true
  } else {
    iswithdrawBtnDisable.value = false

  }
}, { deep: true, immediate: false })


function handleWithdrawSubmit() {

  if (selectedAccount.value === null || selectedPaymentMethod.value === null || amtToWithdraw.value === null) {
    isMandotoryFilled.value = false
  } else {
    isMandotoryFilled.value = true
    isConfirmDialogVisible.value = true

  }
}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isBtnLoading.value = true
    const formData = new FormData()
    formData.append('userId', props.clientId)
    formData.append('mt5id', selectedAccount.value)
    formData.append('trans_amount', amtToWithdraw.value)
    formData.append('attachment', QRCode.value ? QRCode.value[0] : '')
    formData.append('withdraw_method', selectedPaymentMethod.value)
    formData.append('bank_account', selectedBank.value)
    formData.append('balance_amount', accountBalance.value)
    formData.append('is_wallet', is_wallet.value)
    formData.append('admin_note', note.value)

    try {
      const res = await $api('/createClientWithdrawTicket', {
        method: 'POST',
        body: formData,
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isErrorDialogVisible.value = true
          isBtnLoading.value = false
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Withdraw Ticket Created Successfully !'
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
    Unable to create a Withdraw ticket: <strong>No MT5 Account found.</strong>
  </VAlert>
  <div v-else class="px-2 col-12 mt-4">
    <VRow>
      <VCol cols="6">
        <AppSelect v-model="selectedAccount" :items="transformedAccountsList" item-title="display_name"
                   item-value="mt_userid" label="Withdraw From" single-line :rules="[requiredValidator]"
        />
      </VCol>
      <VCol cols="6" v-if="selectedAccount">
        <VChip size="x-large" class="mt-4">
          <div class="pr-1">
            <VImg v-if="is_wallet === 0" :src="'/images/svg/mt5_lined.svg'" style="padding: 5px; width: 25px;"/>
            <i v-else class="tabler-wallet v-icon notranslate v-theme--light"></i>
          </div>
          <div>
            <span style="margin-right: 30px;">{{ is_wallet === 0 ? selectedAccount : 'Wallet' }}</span>
            <span style="margin-left: 30px;">{{ formatCurrency(accountBalance) }}</span>
          </div>
        </VChip>
      </VCol>

      <VCol cols="6">
        <AppSelect v-model="selectedPaymentMethod" :items="paymentList" item-title="method" item-value="id"
                   label="Withdraw Method" single-line :rules="[requiredValidator]"
        />
      </VCol>
      <VCol cols="6" v-if="isBankDropdownVisible">
        <AppSelect v-model="selectedBank" :items="bankDetails" item-title="account_no" item-value="id"
                   label="Select Bank" single-line :rules="[requiredValidator]"
        />
      </VCol>
      <VCol cols="6" class="mt-6" v-if="isQRCodeVisible">
        <VFileInput v-model="QRCode" :rules="fileRules" label="Proof of deposit"
                    accept="image/png, image/jpeg, image/bmp, application/pdf" prepend-icon="tabler-camera"
        />
      </VCol>
      <VCol cols="6">
        <AppTextField v-model="amtToWithdraw" label="Amount " :rules="[requiredValidator]"/>
        <p v-if="iswithdrawBtnDisable" class="text-error">Not Enough Balance</p>
      </VCol>

      <VCol cols="6" v-if="isQRCodeVisible">
        <AppTextarea class="mt-2" v-model="note" label="Wallet ID" auto-grow/>
      </VCol>
      <VCol v-else cols="6">
        <AppTextarea class="mt-2" v-model="note" label="Note/Comments" auto-grow/>
      </VCol>
      <VCol class="mt-10" cols="12">
        <p v-if="isMandotoryFilled===false" class="text-body-2 pt-3 pb-0 mb-3 text-error ps-3">All fields are
          mandatory</p>
        <VBtn class="me-2" color="primary" @click="handleWithdrawSubmit" :disabled="iswithdrawBtnDisable"
              :loading="isBtnLoading"
        >
          Submit
        </VBtn>
      </VCol>
    </VRow>
  </div>
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Do you want to create withdraw ticket?" cancel-title="Cancelled"
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
