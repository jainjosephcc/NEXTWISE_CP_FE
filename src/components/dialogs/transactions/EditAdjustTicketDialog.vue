<script setup>
import { defineEmits, defineProps, ref, toRaw, watch } from 'vue'


const isConfirmDialogVisible = ref(false)
const isConfirmRejectDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const successTitle = ref('')
const successMessage = ref('')
const isApproveBtnLoading = ref(false)
const isRejectBtnLoading = ref(false)
const reqamount = ref(0)
const apamount = ref(0)

const mtid = ref('')

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  transaction_id: {
    type: Number,
    required: true,
  },
  selectedTransaction: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible'])

const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val)
}
const transData = ref(structuredClone(toRaw(props.selectedTransaction)))
const type = computed(() => {
  return props.selectedTransaction.transaction_type === 'losable' ? 0 : 1
})
// Validation: Check if approved amount exceeds requested amount
const isAmountInvalid = computed(() => apamount.value > reqamount.value)

// Approval Handler
const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isApproveBtnLoading.value = true
    try {
      const res = await $api('/processCreditIn', {
        method: 'POST',
        body: {
          adjustment_id: props.selectedTransaction.transaction_id,
          amount: apamount.value,
          type: type.value,
          client_id: props.selectedTransaction.client_id,
          mt5id: props.selectedTransaction.mt_id,
          action: 1, // Approval
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong!'
          errorMessage.value = response._data.message
          isErrorDialogVisible.value = true
        },
      })

      if (res && res.success) {
        successTitle.value = 'Success!'
        successMessage.value = res.message || 'Credit Added to account'
        isSuccessDialogVisible.value = true
      } else {
        throw new Error(res.message || 'Failed to process Credit request')
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


// Set initial values for requested and approved amount
watch(props, () => {
  transData.value = structuredClone(toRaw(props.selectedTransaction))
  reqamount.value = props.selectedTransaction.amount
  apamount.value = props.selectedTransaction.amount
})

// Rejection Handler
const handleRejectConfirm = async (confirmed) => {
  if (confirmed) {
    isRejectBtnLoading.value = true

    try {
      const res = await $api('/processCreditIn', {
        method: 'POST',
        body: {
          adjustment_id: props.selectedTransaction.transaction_id,
          amount: apamount.value, // This is usually set to 0 or handled on the backend
          type: type.value,
          client_id: props.selectedTransaction.client_id,
          mt5id: props.selectedTransaction.mt_id,
          action: 0, // Rejection
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong!'
          errorMessage.value = response._data.message
          isErrorDialogVisible.value = true
        },
      })

      if (res && res.success) {
        successTitle.value = 'Rejected!'
        successMessage.value = res.message || 'Credit Add Request Rejected Successfully!'
        isSuccessDialogVisible.value = true
      } else {
        throw new Error(res.message || 'Failed to reject credit request')
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!'
      errorMessage.value = Ex.response?.data?.message || Ex.message
      isErrorDialogVisible.value = true
    } finally {
      isRejectBtnLoading.value = false
    }
  }
}

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
      <VCardTitle>Approve / Reject Credit In Ticket</VCardTitle>
      <VDivider/>

      <VTable class="text-no-wrap">
        <thead>
        <tr>
          <th>MT5 ID</th>
          <th>TRANSACTION TYPE</th>

        </tr>
        </thead>
        <tbody>
        <tr>
          <td>
            <CustomMT5Chip :client_id="props.selectedTransaction.client_id"
                           :is_wallet="props.selectedTransaction.is_wallet"
                           :mt_id="props.selectedTransaction.mt_id"
            />
          </td>
          <td>{{ props.selectedTransaction.transaction_type }}</td>

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

          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">
          <VBtn v-if="hasAccess('process_credit_in')" color="primary" class="me-2" :loading="isApproveBtnLoading"
                :disabled="isApproveBtnLoading"
                @click="isConfirmDialogVisible = true"
          >
            Approve
            <VIcon end icon="tabler-discount-check-filled"/>
          </VBtn>

          <VBtn v-if="hasAccess('process_credit_in')" color="error" class="me-2" :loading="isRejectBtnLoading"
                :disabled="isRejectBtnLoading"
                @click="isConfirmRejectDialogVisible = true"
          >
            Reject
            <VIcon end icon="tabler-circle-x"/>
          </VBtn>
          <VBtn color="secondary" @click="dialogModelValueUpdate(false)">
            <VIcon start icon="tabler-circle-minus"/>
            Cancel
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
  </VDialog>

  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Do you want to Approve this Credit?" cancel-title="Cancelled"
                 confirm-title="Confirmed!"
  />

  <ConfirmDialog v-model:isDialogVisible="isConfirmRejectDialogVisible" @confirm="handleRejectConfirm"
                 confirmation-question="Are you sure to Reject this Credit?" cancel-title="Cancelled"
                 confirm-title="Rejected!"
  />

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
              style="block-size: 88px; inline-size: 88px; pointer-events: none;"
        >
          <span class="text-5xl font-weight-light">X</span>
        </VBtn>
        <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
        <p>{{ errorMessage }}</p>
        <VBtn color="success" @click="isErrorDialogVisible = false">
          OK
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
