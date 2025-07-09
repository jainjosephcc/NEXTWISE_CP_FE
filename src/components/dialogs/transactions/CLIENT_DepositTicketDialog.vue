<script setup>
import CustomBonusStatusChip from "@/components/CustomBonusStatusChip.vue"
import md5 from "blueimp-md5"

const props = defineProps({
  selectedTransaction: {
    type: Object,
    required: false,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

const transData = ref(structuredClone(toRaw(props.selectedTransaction)))
const updatedDepositAmount = ref(0)


let MD5Hash = ref('')
let checksum = ref('')
let snackMessage = ref('')

const isConfirmDialogVisible = ref(false)
const isConfirmRejectDialogVisible = ref(false)
const showRequestBonusDialogVisible = ref(false)
const EditRequestBonusDialogVisible = ref(false)
const ApproveDepositTicketDialogVisible = ref(false)
const isApproveBtnLoading = ref(false)
const isRejectBtnLoading = ref(false)

const isSuccessDialogVisible = ref(false)
let successTitle = ref('')
let successMessage = ref('')

const isErrorDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')


const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isApproveBtnLoading.value = true

    var client_id = String(props.selectedTransaction.client_id)
    var MT5_ID = String(props.selectedTransaction.mt_id)
    var transaction_id = String(props.selectedTransaction.transaction_id)
    MD5Hash.value = client_id + MT5_ID + transaction_id
    checksum.value = md5(MD5Hash.value)

    try {
      const res = await $api('/approveClientDepositTicket', {
        method: 'POST',
        body: {
          transId: transaction_id,
          approvedAmt: updatedDepositAmount.value,
          checksum: checksum.value,
          action: 1,
          comment: "DEPOSIT APP. CRM",
        },
        onResponseError({ response }) {
          // Handle API response errors
          errorTitle.value = 'Something Went Wrong!'
          errorMessage.value = response._data.message || 'Unknown error'
          isApproveBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })

      // Check if the response contains 'Success' and is true
      if (res && res.Success) {
        successTitle.value = 'Approved!'
        successMessage.value = res.message || 'Deposit Request Approved Successfully!'
        isSuccessDialogVisible.value = true
      } else {
        // Handle unexpected response structure or unsuccessful result
        errorTitle.value = 'Unexpected Response!'
        errorMessage.value = res.message || 'The response format was not as expected.'
        isErrorDialogVisible.value = true
      }
    } catch (Ex) {
      // Handle exceptions
      errorTitle.value = 'Something Went Wrong!'
      errorMessage.value = Ex.data?.message || 'Unknown error'
      isErrorDialogVisible.value = true
    } finally {
      // Ensure that loading is always turned off after handling
      isApproveBtnLoading.value = false
    }
  }
}


const handleRejectConfirm = async (confirmed) => {
  if (confirmed) {
    // Set loading state for reject action
    isRejectBtnLoading.value = true

    var client_id = String(props.selectedTransaction.client_id)
    var MT5_ID = String(props.selectedTransaction.mt_id)
    var transaction_id = String(props.selectedTransaction.transaction_id)
    MD5Hash.value = client_id + MT5_ID + transaction_id
    checksum.value = md5(MD5Hash.value)

    try {
      const res = await $api('/approveClientDepositTicket', {
        method: 'POST',
        body: {
          transId: transaction_id,
          approvedAmt: updatedDepositAmount.value,
          checksum: checksum.value,
          action: 0,  // Action for reject
          comment: "DEPOSIT REJECTED",
        },
        onResponseError({ response }) {
          // Handle API response errors
          errorTitle.value = 'Something Went Wrong!'
          errorMessage.value = response._data.message || 'Unknown error'
          isRejectBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })

      // Check if the response contains 'Success' and is true
      if (res && res.Success) {
        successTitle.value = 'Rejected!'
        successMessage.value = res.result || 'Deposit Request Rejected Successfully!'
        isSuccessDialogVisible.value = true
      } else {
        // Handle unexpected response structure or unsuccessful result
        errorTitle.value = 'Unexpected Response!'
        errorMessage.value = res.message || 'The response format was not as expected.'
        isErrorDialogVisible.value = true
      }
    } catch (Ex) {
      // Handle exceptions
      errorTitle.value = 'Something Went Wrong!'
      errorMessage.value = Ex.data?.message || 'Unknown error'
      isErrorDialogVisible.value = true
    } finally {
      // Ensure that loading is always turned off after handling
      isRejectBtnLoading.value = false
    }
  }
}


watch(props, () => {
  transData.value = structuredClone(toRaw(props.selectedTransaction))
  updatedDepositAmount.value = props.selectedTransaction.amount_in_usd
})

const handlePageReload = async (confirmed) => {
  window.location.reload()
}

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}


// To access the properties individually and maintain reactivity, use toRefs
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>
    <VCard class="pa-6 pa-sm-10">
      <!-- SECTION Header -->
      <div
        class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6"
      >
        <!-- 👉 Left Content -->
        <div>
          <div class="d-flex align-center app-logo mb-6">
            <!-- 👉 Logo -->
            <!-- <VNodeRenderer  /> -->

            <!-- 👉 Title -->
            <h6 class="app-logo-title">
              Deposit Ticket Details
            </h6>
          </div>

          <VListItem class="p-0 m-0">
            <VListItemTitle class="font-weight-medium ms-0 ps-0 text-h5">
              {{ props.selectedTransaction.client_name }}
            </VListItemTitle>
            <template #prepend>
              <VAvatar color="secondary" size="35" variant="tonal" rounded icon="tabler-user-square-rounded"/>
            </template>
            <VListItemSubtitle>
              {{ props.selectedTransaction.email }}
            </VListItemSubtitle>
          </VListItem>
          <VListItem v-if="props.selectedTransaction.manager_id != null" class="p-0 m-0">
            <VListItemTitle class="font-weight-medium ms-0 ps-0">
              {{ props.selectedTransaction.rm_name }}
            </VListItemTitle>
            <template #prepend>
              <VAvatar color="secondary" size="35" variant="tonal" rounded icon="tabler-user-hexagon"/>
            </template>
            <VListItemSubtitle>
              Relationship Manager
            </VListItemSubtitle>
          </VListItem>

        </div>

        <!-- 👉 Right Content -->
        <div class="d-flex flex-column">

          <!-- 👉 TICKET ID -->
          <VListItem>
            <template #prepend>
              <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                <VIcon icon="tabler-ticket" size="22"/>
              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              TICKET ID
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    #{{ props.selectedTransaction.transaction_id }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <!-- 👉 CREATED ON -->
          <VListItem>
            <template #prepend>
              <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                <VIcon icon="tabler-calendar-month" size="22"/>
              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              CREATED ON
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center gap-x-2">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ formatDate(props.selectedTransaction.created_at) }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <!-- 👉 CREATED TIME -->
          <VListItem>
            <template #prepend>
              <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                <VIcon icon="tabler-clock-hour-4" size="22"/>
              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              CREATED TIME
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center gap-x-2">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ formatTime(props.selectedTransaction.created_at) }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <!-- 👉 DEPOSIT STATUS -->
          <VListItem>
            <template #prepend>
              <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                <VIcon icon="tabler-activity" size="22"/>
              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              DEPOSIT STATUS
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center gap-x-2">
                <div class="text-body-1">
                  <CustomTransactionStatusChip :trans_status="props.selectedTransaction.status"/>
                </div>
              </div>
            </template>
          </VListItem>

        </div>
      </div>
      <!-- !SECTION -->

      <VRow>
        <VCol class="text-no-wrap">
          <h6 class="font-weight-medium me-4 text-overline mb-4">
            Deposited To:
          </h6>

          <li class="d-flex align-center cursor-pointer outlined">
            <VAvatar rounded size="25" :color="'primary'" variant="tonal" class="p-2">
              <VImg v-if="props.selectedTransaction.is_wallet === 0" src="/images/mt5.png"
                    style="width: 10px; padding: 5px;"
              />
              <i v-else class="tabler-wallet v-icon notranslate v-theme--light"></i>
            </VAvatar>
            <div class="text-base ms-2 text-h5">{{ props.selectedTransaction.mt_id }}</div>
            <div class="v-spacer"></div>
          </li>

        </VCol>

        <VCol class="text-no-wrap">
          <h6 class="font-weight-medium me-4 text-overline mb-4">
            Details:
          </h6>
          <!-- 👉 MT GROUP -->
          <VListItem class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              MT GROUP
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ props.selectedTransaction.mt_group_name }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <!-- 👉 Deposit Method -->
          <VListItem class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              Deposit Method
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ props.selectedTransaction.deposit_method }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <!-- 👉 Deposited Currency -->
          <VListItem class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              Deposited Currency
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ props.selectedTransaction.currency }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <!-- 👉 Amount in Deposited Currency -->
          <VListItem class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              Amount (Dep. Currency)
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ props.selectedTransaction.amount }} {{ props.selectedTransaction.currency }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <VDivider class="my-2 border-dashed"/>

          <!-- 👉 BONUS STATUS -->
          <VListItem class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              BONUS STATUS
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <CustomBonusStatusChip :bonus_status="props.selectedTransaction.bonus_status"/>
                </div>
              </div>
            </template>
          </VListItem>

          <!-- 👉 BONUS VALUE -->
          <VListItem v-if="props.selectedTransaction.bonus_status !== 4" class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              BONUS PERCENTAGE REQUESTED
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ props.selectedTransaction.bonus_percentage }} %
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <!-- 👉 BONUS TYPE -->
          <VListItem v-if="props.selectedTransaction.bonus_status !== 4" class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              REQUESTED BONUS TYPE
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ props.selectedTransaction.bonus_type == 0 ? 'L BONUS' : 'NL BONUS' }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <VDivider class="my-2 border-dashed"/>

          <!-- 👉 CLIENT NOTE -->
          <VListItem class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              CLIENT NOTE
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ props.selectedTransaction.client_note }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <!-- 👉 Amount in USD -->
          <VListItem class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              Amount in USD
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ formatCurrency(props.selectedTransaction.amount_in_usd) }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <VDivider class="my-2 border-dashed"/>


        </VCol>
      </VRow>

      <VDivider class="mt-6 border-dashed"/>

      <VDivider class="mt-1 mb-6 border-dashed"/>

      <!-- 👉IF APPROVED SUMMARY -->
      <div v-if="props.selectedTransaction.status === 3"
           class="d-flex justify-space-between flex-wrap flex-column flex-sm-row"
      >
        <div class="mb-6 mb-sm-0">

        </div>

        <div>
          <table class="w-100">
            <tbody>
            <tr>
              <td class="font-weight-medium me-4 text-overline">
                Deal Id :
              </td>
              <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                <h6 class="font-weight-medium me-4 text-overline">
                  #{{ props.selectedTransaction.dealid }}
                </h6>
              </td>
            </tr>

            <tr>
              <td class="font-weight-medium me-4 text-overline">
                Approved at :
              </td>
              <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                <h6 class="font-weight-medium me-4 text-overline">
                  {{ formatFullDateTime(props.selectedTransaction.updated_at) }}
                </h6>
              </td>
            </tr>
            <!--              <tr>
                            <td class="font-weight-medium me-4 text-overline">
                              Approved By :
                            </td>
                            <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                              <h6 class="font-weight-medium me-4 text-overline">
                                {{ props.selectedTransaction.processed_by_rm }}
                              </h6>
                            </td>
                          </tr>-->
            </tbody>
          </table>

          <VDivider class="mt-4 mb-3"/>

          <table class="w-100">
            <tbody>
            <tr>
              <td class="font-weight-medium me-4 text-overline">
                Approved Amount :
              </td>
              <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                <!-- <h6 class="text-h5">
{{ formatCurrency(props.selectedTransaction.approved_amount) }}
</h6> -->
                <VChip size="default" color="secondary" variant="tonal" class="text-h5">
                  {{ formatCurrency(props.selectedTransaction.approved_amount) }}
                </VChip>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <VRow v-if="props.selectedTransaction.status === 0">
        <!-- <VCol class="col-2"></VCol> -->
        <VCol class="col-10 text-sm-end">


          <VBtn v-if="hasAccess('approve_deposit_ticket')" class="me-2" :loading="isApproveBtnLoading"
                :disabled="isApproveBtnLoading" color="primary" @click="ApproveDepositTicketDialogVisible = true"
          >
            Approve Deposit
            <VIcon end icon="tabler-checkbox"/>
          </VBtn>

          <VBtn v-if="hasAccess('reject_deposit_ticket')" color="error" :loading="isRejectBtnLoading"
                :disabled="isApproveBtnLoading" class="me-2" @click="isConfirmRejectDialogVisible = true"
          >
            Reject
            <VIcon end icon="tabler-circle-x"/>
          </VBtn>


          <VBtn v-if="hasAccess('request_for_bonus') && props.selectedTransaction.bonus_status === 4" color="info"
                class="me-2" @click="showRequestBonusDialogVisible = true" :disabled="isApproveBtnLoading"
          >
            Request Bonus
            <VIcon end icon="tabler-discount-check-filled"/>
          </VBtn>


          <VBtn color="secondary" @click="dialogModelValueUpdate(false)">
            <VIcon start icon="tabler-circle-minus"/>
            Cancel
          </VBtn>
        </VCol>
      </VRow>

      <VRow v-if="props.selectedTransaction.status === 3">
        <VCol class="col-10 text-sm-end">

          <!-- Show Request Bonus button when bonus_status is 4 -->
          <VBtn v-if="hasAccess('request_for_bonus') && props.selectedTransaction.bonus_status === 4" color="info"
                class="me-2" @click="showRequestBonusDialogVisible = true" :disabled="isApproveBtnLoading"
          >
            Request Bonus
            <VIcon end icon="tabler-discount-check-filled"/>
          </VBtn>

          <VBtn v-if="props.selectedTransaction.bonus_status === 4" color="secondary"
                @click="dialogModelValueUpdate(false)"
          >
            <VIcon start icon="tabler-circle-minus"/>
            Cancel
          </VBtn>


        </VCol>
      </VRow>

      <VRow v-if="props.selectedTransaction.bonus_status === 0 && props.selectedTransaction.status === 3">
        <!-- <VCol class="col-2"></VCol> -->
        <VCol class="col-10 text-sm-end">

          <VBtn v-if="hasAccess('approve_reject_bonus')" class="me-2" :loading="isApproveBtnLoading"
                :disabled="isApproveBtnLoading" color="warning" @click="EditRequestBonusDialogVisible = true"
          >
            Approve/Reject Bonus
            <VIcon end icon="tabler-pencil-plus"/>
          </VBtn>

          <VBtn color="secondary" @click="dialogModelValueUpdate(false)">
            <VIcon start icon="tabler-circle-minus"/>
            Cancel
          </VBtn>


        </VCol>
      </VRow>


      <!-- <div>
<h6 class="text-h6 mb-2">
  Note:
</h6>
<VTextarea v-model="note" placeholder="Write note here..." :rows="2" />
</div> -->
      <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                     confirmation-question="Are you sure to Approve this Deposit?" cancel-title="Cancelled"
                     confirm-title="Cancelled!"
      />

      <ConfirmDialog v-model:isDialogVisible="isConfirmRejectDialogVisible" @confirm="handleRejectConfirm"
                     confirmation-question="Are you sure to Reject this Deposit?" cancel-title="Cancelled"
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
            <VBtn color="success" @click="handlePageReload">
              Ok
            </VBtn>
          </VCardText>
        </VCard>
      </VDialog>
    </VCard>
  </VDialog>
  <AddRequestBonusDialog v-model:isDialogVisible="showRequestBonusDialogVisible"
                         :selectedTransaction="props.selectedTransaction"
                         :transaction_id="props.selectedTransaction?.transaction_id"
                         :amount="props.selectedTransaction?.amount_in_usd"
  />
  <EditRequestBonusDialog v-model:isDialogVisible="EditRequestBonusDialogVisible"
                          :selectedTransaction="props.selectedTransaction"
                          :transaction_id="props.selectedTransaction?.transaction_id"
                          :amount="props.selectedTransaction?.amount_in_usd"
  />

  <ApproveDepositTicketDialog v-model:isDialogVisible="ApproveDepositTicketDialogVisible"
                              :selectedTransaction="props.selectedTransaction"
                              :transaction_id="props.selectedTransaction?.transaction_id"
                              :amount="props.selectedTransaction?.amount_in_usd"
  />


</template>
