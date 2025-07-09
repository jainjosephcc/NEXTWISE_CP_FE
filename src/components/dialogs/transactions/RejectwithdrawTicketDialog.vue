<script setup>
import md5 from "blueimp-md5";


// Reactive state variables
const reqamount = ref(0)
const message = ref('')
const success = ref(true)
const comment = ref('')
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
const isConfirmRejectDialogVisible = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const successTitle = ref('')
const successMessage = ref('')
const isApproveBtnLoading = ref(false)
const bonusRequested = ref(false)
const MD5Hash = ref('')
const checksum = ref('')
const transdetails = ref([])
const isRejectBtnLoading = ref(false)
const bankDetails = ref([])
const mtBalance = ref(0)
const apamount = ref(0)

// Define props and emits
const props = defineProps({
  isDialogVisible: { type: Boolean, required: true },
  transaction_id: {
    type: Number,
    default: null, // Provide a default value if it’s optional
  },
  amount: {
    type: Number,
    default: 0, // Provide a default value if it’s optional
  },
  selectedTransaction: {
    type: Object,
    default: () => ({}), // Provide a default empty object
  },
})

const emit = defineEmits(['update:isDialogVisible'])
const dialogModelValueUpdate = (val) => emit('update:isDialogVisible', val)

// Create a clone of selectedTransaction
const transData = ref(structuredClone(toRaw(props.selectedTransaction)))

// Fetch transaction details from API
const fetchDetailsWithdraw = async () => {
  if (props.transaction_id) {
    try {
      const res = await $api(`getDetailedWithdrawTransaction/${props.transaction_id}`, {
        method: 'GET',
        onResponseError({ response }) {
          console.log('API error response:', response)
        },
      })

      if (res && res.transaction_details && res.transaction_details.length > 0) {
        transdetails.value = res.transaction_details
        bankDetails.value = res.bank_details || []
        mtBalance.value = res.mt_balance || 0

        if (transdetails.value.length > 0) {
          const { client_id, mt_id } = transdetails.value[0]
          MD5Hash.value = String(client_id) + String(mt_id) + String(props.transaction_id)
          checksum.value = md5(MD5Hash.value).toLowerCase()
        }
      } else {
        console.error('Failed to fetch Withdraw or empty response')
      }
    } catch (err) {
      console.error('Error fetching transaction data:', err)
    }
  }
}


// Handle reject confirmation
const handleRejectConfirm = async (confirmed) => {
  if (confirmed) {
    isRejectBtnLoading.value = true
    try {
      const res = await $api('/processWithdrawRequest', {
        method: 'POST',
        body: {
          transId: String(props.transaction_id),
          amount: apamount.value,
          checksum: checksum.value,
          action: 0, // Reject action
          comment: comment.value,
        },
        onResponseError({ response }) {
          // Directly show the message from the API response
          errorTitle.value = 'Something Went Wrong!'
          errorMessage.value = response._data.message || 'Unknown error'
          isRejectBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })

      // Directly use the API response message
      if (res && res.success) {
        successTitle.value = 'Rejected!'
        successMessage.value = res.message // Show API message
        isSuccessDialogVisible.value = true
      } else {
        errorTitle.value = 'Error!'
        errorMessage.value = res.message || 'Unexpected error occurred'
        isErrorDialogVisible.value = true
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!'
      errorMessage.value = Ex.data?.message || 'Unknown error'
      isErrorDialogVisible.value = true
    } finally {
      isRejectBtnLoading.value = false
    }
  }
}


// Watchers to track changes in transaction ID and selectedTransaction
watch(() => props.transaction_id, async (newTransactionId) => {
  if (newTransactionId) await fetchDetailsWithdraw()
})

watch(props, () => {
  transData.value = structuredClone(toRaw(props.selectedTransaction))
  reqamount.value = props.selectedTransaction.amount_req
  apamount.value = props.selectedTransaction.amount_req
})

// Fetch data on component mount
onMounted(async () => {
  if (props.transaction_id) await fetchDetailsWithdraw()
})
// Handle page reload
const handlePageReload = () => {
  window.location.reload()
}
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate">

    <!-- Dialog close button -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardTitle>Reject Withdrawal</VCardTitle>
      <VDivider />

      <VTable class="text-no-wrap">
        <thead>
          <tr>
            <th>ID</th>
            <th>GROUP</th>
            <th>REQUESTED WITHDRAW AMOUNT IN USD</th>
            <th>Available Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trans in transdetails" :key="trans.mt_id">
            <td>
              <li class="d-flex align-center cursor-pointer outlined">
                <VAvatar rounded size="25" :color="'primary'" variant="tonal" class="p-2">
                  <VImg v-if="props.selectedTransaction.is_wallet === 0" src="/images/mt5.png"
                    style="width: 10px; padding: 5px;" />
                  <i v-else class="tabler-wallet v-icon notranslate v-theme--light"></i>
                </VAvatar>
                <div class="text-base ms-2 text-h5">{{ trans.mt_id }}</div>
                <div class="v-spacer"></div>
              </li>
            </td>
            <td>{{ trans.mt_group_name }}</td>
            <td>{{ formatCurrency(trans.trans_amount) }}</td>
            <td v-if="mtBalance !== null">{{ formatCurrency(mtBalance) }}</td>
          </tr>
        </tbody>
      </VTable>

      <VDivider />

      <VForm @submit.prevent="() => { }">
        <VCardText>
          <VRow>
            <VCol cols="6">
              <AppTextarea v-model="comment" label="Reason" />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">
          <!-- Reject Button -->
          <VBtn color="error" :loading="isRejectBtnLoading" :disabled="isApproveBtnLoading" class="me-2"
            @click="isConfirmRejectDialogVisible = true">
            Reject
            <VIcon end icon="tabler-circle-x" />
          </VBtn>

          <VBtn color="secondary" @click="dialogModelValueUpdate(false)">
            <VIcon start icon="tabler-circle-minus" />
            Cancel
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
  </VDialog>

  <!-- Confirm Reject Dialog -->

  <ConfirmDialog v-model:isDialogVisible="isConfirmRejectDialogVisible" @confirm="handleRejectConfirm"
    confirmation-question="Are you sure you want to reject this withdrawal?" confirm-title="Confirm"
    cancel-title="Cancel" />

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

  <!-- Error Dialog -->
  <VDialog v-model="isErrorDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="error" class="my-4"
          style="block-size: 88px; inline-size: 88px; pointer-events: none;">
          <span class="text-5xl font-weight-light">X</span>
        </VBtn>
        <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
        <p>{{ errorMessage }}</p>
        <VBtn color="success" @click="handlePageReload">Ok</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
