<script setup>
import { onMounted, ref } from "vue"

const currentTab = ref('window-1')
const selectedMTAccount = ref(null)
const selectedPaymentMethod = ref(null)
const selectedToAccount = ref(null)
const selectedCurrency = ref(null)
const currencyList = ref([])
const paymentList = ref([])
const mtAccountsList = ref([])
const amtInCurrency = ref(null)
const amtInUSD = ref(0)
const depo_doc = ref(null)
const note = ref(null)
const isMandotoryFilled = ref(null)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const currency_in_usd = ref(null)
const isBtnLoading = ref(null)
const is_wallet = ref(null)
const paymentOptions = ref([])
const accountBalance = ref(null)

const filterNames = ['Others', 'Bank', 'USDT']

const maxFileSize = 2 * 1024 * 1024 // 2MB in bytes

const fileRules = [
  fileList => !fileList || !fileList.length || fileList[0].size <= maxFileSize || 'File size should be less than 2 MB!',
  fileList => !fileList || !fileList.length || ['image/png', 'image/jpeg', 'image/bmp', 'application/pdf'].includes(fileList[0].type) || 'Only image or PDF files are allowed!',
]


const props = defineProps({
  mt5ListData: {
    type: Object,
  },
  depositMethods: {
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
  const res = await $api(`getDepoDropdown/${props.clientId}`, {
    method: 'GET',
    onResponseError({ response }) {
      //console.log(response);
      // errors.value = response._data.message
    },
  })
  if (res) {
    mtAccountsList.value = res.mt5_data

    paymentList.value = res.payment_methods
    currencyList.value = res.currency

  }
  paymentOptions.value = paymentList.value.filter(item => filterNames.includes(item.dispaly_name))

}

// const mtAccountsList = ref([]); // Your original accounts list

const transformedAccountsList = computed(() => {
  if (mtAccountsList.value.length === 0) {
    return [{ display_name: 'Loading...', mt_userid: null }]
  }
  return mtAccountsList.value.map(account => {
    const title = account.is_wallet ? `WALLET(${account.mt_userid})` : `MT${account.mt_userid}`
    return {
      ...account,
      display_name: title,
    }
  })
})

watch([selectedCurrency, amtInCurrency], () => {
  const selectedItem = currencyList.value.find(item => item.id === selectedCurrency.value)
  currency_in_usd.value = selectedItem.to_usd
  amtInUSD.value = 0
  calcAmount()


}, { deep: true, immediate: false })

function calcAmount() {

  amtInUSD.value = currency_in_usd.value * amtInCurrency.value
}

watch([selectedToAccount], () => {
  const selectedAccount = mtAccountsList.value.find(item => item.mt_userid === selectedToAccount.value)
  is_wallet.value = selectedAccount.is_wallet
  accountBalance.value = selectedAccount.balance
}, { deep: true, immediate: false })

function handleDepositSubmit() {

  if (selectedToAccount.value === null || selectedPaymentMethod.value === null || selectedCurrency.value === null || amtInCurrency.value === null || amtInUSD.value === null || depo_doc.value === null || note.value === null) {
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
    formData.append('images[]', depo_doc.value ? depo_doc.value[0] : '')
    formData.append('userId', props.clientId)
    formData.append('mt5id', selectedToAccount.value)
    formData.append('trans_amount', amtInCurrency.value)
    formData.append('trans_usd', amtInUSD.value)
    formData.append('payment_method', selectedPaymentMethod.value)
    formData.append('payment_currency', selectedCurrency.value)
    formData.append('admin_note', note.value)
    formData.append('is_wallet', is_wallet.value)

    try {
      const res = await $api('/createClientDepositTicket', {
        method: 'POST',
        body: formData,
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Deposit Ticket Created Successfully !'
        isBtnLoading.value = false
        isSuccessDialogVisible.value = true
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.response ? Ex.response.data.message : Ex.message
      isBtnLoading.value = false
      isErrorDialogVisible.value = true
    }
  }
}
const handlePageReload = () => {
  window.location.reload()
}

</script>

<template>
  <!-- <VCard class="col-12"> -->
  <VAlert v-if="mt5ListData.length===0" type="warning">
    Unable to create a Deposit ticket: <strong>No MT5 Account found.</strong>
  </VAlert>
  <div v-else class="px-2 col-12 mt-4">

    <VRow>
      <VCol cols="6">
        <AppSelect v-model="selectedToAccount" :items="transformedAccountsList" item-title="display_name"
                   item-value="mt_userid" label="Deposit To" single-line :rules="[requiredValidator]"
        />
      </VCol>
      <VCol cols="6" v-if="selectedToAccount">
        <VChip size="x-large" class="mt-4">
          <div class="pr-1">
            <VImg v-if="is_wallet === 0" :src="'/images/svg/mt5_lined.svg'" style="padding: 5px; width: 25px;"/>
            <i v-else class="tabler-wallet v-icon notranslate v-theme--light"></i>
          </div>
          <div>
            <span style="margin-right: 30px;">{{ is_wallet === 0 ? selectedToAccount : 'Wallet' }}</span>
            <span style="margin-left: 30px;">{{ formatCurrency(accountBalance) }}</span>
          </div>
        </VChip>
      </VCol>
      <VCol cols="6">
        <AppSelect v-model="selectedPaymentMethod" :items="paymentOptions" item-title="dispaly_name" item-value="id"
                   label="Payment Method" single-line :rules="[requiredValidator]"
        />
      </VCol>
      <VCol cols="6">
        <AppSelect v-model="selectedCurrency" :items="currencyList" item-title="currency" item-value="id"
                   label="Currency" single-line :rules="[requiredValidator]"
        />
      </VCol>
      <VCol cols="6">
        <AppTextField v-model="amtInCurrency" label="Amount in selected Currency" :rules="[requiredValidator]"/>
      </VCol>
      <VCol cols="6">
        <AppTextField v-model="amtInUSD" label="Amount in USD" :rules="[requiredValidator]" readonly/>
      </VCol>
      <VCol cols="6" class="mt-5">
        <VFileInput v-model="depo_doc" :rules="fileRules" label="Proof of deposit"
                    accept="image/png, image/jpeg, image/bmp, application/pdf" prepend-icon="tabler-camera"
        />
      </VCol>
      <VCol cols="12">
        <AppTextarea class="mt-2" v-model="note" label="Note" auto-grow/>
      </VCol>

      <VCol cols="12" class="mt-2">
        <p v-if="isMandotoryFilled===false" class="text-body-2 pt-3 pb-0 mb-3 text-error ps-3">All fields are
          mandatory</p>
        <VBtn class="me-2" color="primary" @click="handleDepositSubmit" :loading="isBtnLoading">
          Submit
        </VBtn>
      </VCol>
    </VRow>

  </div>
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Do you want to create deposit ticket?" cancel-title="Cancelled"
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
