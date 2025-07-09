<script setup>
import md5 from "blueimp-md5"
import { computed, defineEmits, defineProps, onMounted, ref, toRaw, watch } from 'vue'

// Reactive state for the modals and other data
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
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
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

const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val)
}

const transData = ref(structuredClone(toRaw(props.selectedTransaction)))

// Validation: Check if approved amount exceeds requested amount
const isAmountInvalid = computed(() => apamount.value > reqamount.value)

// Fetch transaction details including client_id and mt_id
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
        // Store the transaction details
        transdetails.value = res.transaction_details
        bankDetails.value = res.bank_details || []
        mtBalance.value = res.mt_balance || 0

        // Extract client_id and mt_id from the first transaction detail
        const { client_id, mt_id } = transdetails.value[0] // Assuming first entry

        // Log the values for debugging
        //console.log("client_id:", client_id);
        //console.log("MT5_ID:", mt_id);

        // Generate checksum
        MD5Hash.value = String(client_id) + String(mt_id) + String(props.transaction_id)
        checksum.value = md5(MD5Hash.value).toLowerCase()

        //console.log("Generated checksum:", checksum.value);
      } else {
        console.error('Failed to fetch Withdraw or empty response')
      }
    } catch (err) {
      console.error('Error fetching transaction data:', err)
    }
  } else {
    console.error('Transaction ID is not defined')
  }
}

// Handle confirm approval
const handleConfirm = async (confirmed) => {
  if (confirmed) {
    // Check if the approved amount exceeds the requested amount
    if (isAmountInvalid.value) {
      errorTitle.value = "Invalid Amount!"
      errorMessage.value = "Approved amount cannot be greater than the requested amount."
      isErrorDialogVisible.value = true
      return
    }

    // Check if the approved amount exceeds the MT balance
    if (apamount.value > mtBalance.value) {
      errorTitle.value = "Insufficient Balance!"
      errorMessage.value = "Approved amount cannot be greater than available MT balance."
      isErrorDialogVisible.value = true
      return
    }

    isApproveBtnLoading.value = true

    try {
      const res = await $api('/processWithdrawRequest', {
        method: 'POST',
        body: {
          transId: String(props.transaction_id),
          amount: apamount.value,
          checksum: checksum.value,
          action: 1, // Action for approve
          comment: "WITHDRAW APP. CRM",
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong!'
          errorMessage.value = response._data.message || 'Unknown error'
          isApproveBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })

      if (res && res.success) {
        successTitle.value = 'Approved'
        successMessage.value = res.message || 'Withdraw Request Approved Successfully!'
        bonusRequested.value = true
        isSuccessDialogVisible.value = true
      } else {
        throw new Error(res.message || 'Failed to Withdraw Request')
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!'
      errorMessage.value = Ex.response?.data?.message || Ex.message
      isErrorDialogVisible.value = true
    } finally {
      isApproveBtnLoading.value = false
    }
  }
}


// Watch for changes in transaction_id and fetch transaction data
watch(() => props.transaction_id, async (newTransactionId) => {
  if (newTransactionId !== undefined && newTransactionId !== null) {
    await fetchDetailsWithdraw()
  }
})

// Set initial values for requested and approved amount
watch(props, () => {
  transData.value = structuredClone(toRaw(props.selectedTransaction))
  reqamount.value = props.selectedTransaction.amount_req
  apamount.value = props.selectedTransaction.amount_req
})

// Fetch data on component mount if transaction_id is valid
onMounted(async () => {
  if (props.transaction_id) {
    await fetchDetailsWithdraw()
  }
})

// Handle page reload
const handlePageReload = () => {
  window.location.reload()
}
</script>


<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>

    <VCard>
      <VCardTitle> Approve Withdrawal</VCardTitle>
      <VDivider/>

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
        <!-- Render transaction details -->
        <tr v-for="trans in transdetails" :key="trans.mt_id">
          <td>
            <li class="d-flex align-center cursor-pointer outlined">
              <VAvatar rounded size="25" :color="'primary'" variant="tonal" class="p-2">
                <VImg v-if="props.selectedTransaction.is_wallet === 0" src="/images/mt5.png"
                      style="width: 10px; padding: 5px;"
                />
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

      <VDivider/>
      <VForm @submit.prevent="() => { }">
        <VCardText>
          <VRow>
            <VCol cols="6">
              <AppTextField v-model="reqamount" label="Requested Amount" suffix="USD" disabled/>
            </VCol>
            <VCol cols="6">
              <AppTextField v-model="apamount" label="Approved Amount" suffix="USD"/>
              <!-- Show error if the approved amount is greater than the requested amount -->
              <VAlert v-if="isAmountInvalid" type="error" class="mt-2">
                Approved amount cannot be greater than requested amount.
              </VAlert>
            </VCol>
            <VCol cols="6">
              <AppTextarea v-model="comment" label="Comments"/>


            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">
          <!-- Approve Button -->
          <VBtn color="primary" class="me-2" :loading="isApproveBtnLoading"
                :disabled="isApproveBtnLoading || isAmountInvalid" @click="isConfirmDialogVisible = true"
          >
            Approve Withdrawal
            <VIcon end icon="tabler-discount-check-filled"/>
          </VBtn>

          <VBtn color="secondary" @click="dialogModelValueUpdate(false)">
            <VIcon start icon="tabler-circle-minus"/>
            Cancel
          </VBtn>

        </VCardText>
      </VForm>
    </VCard>
  </VDialog>

  <!-- Confirm and Success Dialogs -->
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Are you sure to Approve this Withdrawal?" confirm-title="Confirm"
                 cancel-title="Cancel"
  />


  <!-- Success Dialog -->
  <VDialog v-model="isSuccessDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="success" class="my-4"
              style="block-size: 88px; inline-size: 88px; pointer-events: none;"
        >
          <VIcon icon="tabler-check" size="38"/>
        </VBtn>
        <h1 class="text-h4 mb-4">{{ successTitle }}</h1>
        <p>{{ successMessage }}</p>
        <VBtn color="success" @click="handlePageReload">OK</VBtn>
      </VCardText>
    </VCard>
  </VDialog>


</template>
