<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  selectedTransaction: {
    type: Object,
    default: () => ({}), // Provide a default empty object
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

const transdetails = ref([])

const bankDetails = ref([])
const mtBalance = ref(0)

const ApprovewithdrawDialogVisible = ref(false)
const RejectwithdrawDialogVisible = ref(false)

const fetchDetailsWithdraw = async () => {
  const transactionId = props.selectedTransaction?.transaction_id
  if (transactionId) { // Use optional chaining to safely access transaction_id
    try {
      const res = await $api(`getDetailedWithdrawTransaction/${transactionId}`, {
        method: 'GET',
        onResponseError({ response }) {
          console.log('API error response:', response)
        },
      })

      if (res) {
        transdetails.value = res.transaction_details || []
        bankDetails.value = res.bank_details || []
        mtBalance.value = res.mt_balance || 0
      } else {
        console.error('Failed to fetch Withdraw or empty response')
      }
    } catch (err) {
      console.error('Error fetching bonus data:', err)
    }
  } else {
    console.error('Transaction ID is not defined')
  }
}

// Watch for changes in transaction_id and fetch bonus data
watch(() => props.selectedTransaction?.transaction_id, async (newTransactionId) => {
  if (newTransactionId) {
    await fetchDetailsWithdraw()
  }
})

// Fetch data on component mount if transaction_id is valid
onMounted(async () => {
  if (props.selectedTransaction?.transaction_id) {
    await fetchDetailsWithdraw()
  }
})

const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val)
}
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
            <!-- 👉 Title -->
            <h6 class="app-logo-title">
              Withdraw Ticket Details
            </h6>
          </div>

          <VListItem class="p-0 m-0">
            <VListItemTitle class="font-weight-medium ms-0 ps-0 text-h5">
              {{ props.selectedTransaction?.c_name }}
            </VListItemTitle>
            <template #prepend>
              <VAvatar color="secondary" size="35" variant="tonal" rounded
                       icon="tabler-user-square-rounded"
              />
            </template>
            <VListItemSubtitle>
              {{ props.selectedTransaction?.c_email }}
            </VListItemSubtitle>
          </VListItem>
          <VListItem v-if="props.selectedTransaction?.manager_id != null" class="p-0 m-0">
            <VListItemTitle class="font-weight-medium ms-0 ps-0">
              {{ props.selectedTransaction?.rm_name }}
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
                <VIcon icon="tabler-droplet-dollar" size="22"/>
              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              TICKET ID
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    #{{ props.selectedTransaction?.transaction_id }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>


          <!-- 👉 CREATED ON -->
          <VListItem>
            <template #prepend>
              <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                <VIcon icon="tabler-droplet-dollar" size="22"/>
              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              CREATED ON
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center gap-x-2">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ formatDate(props.selectedTransaction?.created_at) }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>

          <!-- 👉 CREATED TIME -->
          <VListItem>
            <template #prepend>
              <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                <VIcon icon="tabler-droplet-dollar" size="22"/>
              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              CREATED TIME
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center gap-x-2">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ formatTime(props.selectedTransaction?.created_at) }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>


          <!-- 👉 Withdraw STATUS -->
          <VListItem>
            <template #prepend>
              <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                <VIcon icon="tabler-droplet-dollar" size="22"/>
              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              WITHDRAW STATUS
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center gap-x-2">
                <div class="text-body-1">
                  <VChip v-if="props.selectedTransaction?.status === 0" color="secondary"
                         variant="outlined"
                  >
                    <VIcon start icon="tabler-hourglass-high"/>
                    Pending
                  </VChip>
                  <VChip v-if="props.selectedTransaction?.status === 1" color="warning"
                         variant="outlined"
                  >
                    <VIcon start icon="tabler-info-square-rounded"/>
                    On Hold
                  </VChip>
                  <VChip v-if="props.selectedTransaction?.status === 2" color="error"
                         variant="outlined"
                  >
                    <VIcon start icon="tabler-ban"/>
                    Rejected
                  </VChip>
                  <VChip v-if="props.selectedTransaction?.status === 3" color="success"
                         variant="outlined"
                  >
                    <VIcon start icon="tabler-check"/>
                    Success
                  </VChip>
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
            Withdraw From:
          </h6>

          <li class="d-flex align-center cursor-pointer outlined">
            <VAvatar rounded size="25" :color="'primary'" variant="tonal" class="p-2">
              <VImg v-if="props.selectedTransaction?.is_wallet === 0" src="/images/mt5.png"
                    style="width: 10px; padding: 5px;"
              />
              <i v-else class="tabler-wallet v-icon notranslate v-theme--light"></i>
            </VAvatar>
            <div class="text-base ms-2 text-h5">{{ props.selectedTransaction?.from }}</div>
            <div class="v-spacer"></div>
          </li>
        </VCol>


        <VCol class="text-no-wrap">
          <h6 class="font-weight-medium me-4 text-overline mb-4">
            Details:
          </h6>

          <table>
            <tbody v-if="transdetails.length" :key="transdetails[0]?.mt_id">
            <tr>
              <td class="font-weight-medium me-4 text-overline mb-4">MT GROUP</td>

              <td>
                <div class="d-flex align-center">
                  <div class="text-body-1">
                    <VChip variant="outlined">
                      {{ transdetails[0]?.mt_group_name }}
                    </VChip>
                  </div>
                </div>
              </td>

            </tr>
            <tr>
              <td class="font-weight-medium me-4 text-overline mb-4">Withdraw Method</td>
              <td>
                <div class="d-flex align-center">
                  <div class="text-body-1">
                    <VChip variant="outlined">
                      {{ transdetails[0]?.withdraw_method_name }}
                    </VChip>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="font-weight-medium me-4 text-overline mb-4">Requested Amount IN USD</td>
              <td>
                <div class="d-flex align-center">
                  <div class="text-body-1">
                    <VChip variant="outlined">
                      {{ formatCurrency(transdetails[0]?.trans_amount) }}
                    </VChip>
                  </div>
                </div>

              </td>
            </tr>
            <tr>
              <td>
                <VDivider class="my-6 border-dashed"/>
              </td>
              <td>
                <VDivider class="my-6 border-dashed"/>
              </td>
            </tr>
            <tr v-if="bankDetails.length" class="pb-5">
              <td><span class="font-weight-medium me-4 text-overline mb-4">Bank Details :</span></td>

            </tr>
            <tr v-if="bankDetails.length">
              <td class="font-weight-medium me-4 text-overline mb-4">Holder Name</td>
              <td>
                <div class="d-flex align-center">
                  <div class="text-body-1">
                    <VChip variant="outlined">
                      {{ bankDetails[0]?.holder_name }}
                    </VChip>
                  </div>
                </div>
              </td>

            </tr>
            <tr v-if="bankDetails.length">
              <td class="font-weight-medium me-4 text-overline mb-4">Account Number</td>
              <td>
                <div class="d-flex align-center">
                  <div class="text-body-1">
                    <VChip variant="outlined">
                      {{ bankDetails[0]?.account_no }}
                    </VChip>
                  </div>
                </div>
              </td>

            </tr>
            <tr v-if="bankDetails.length">
              <td class="font-weight-medium me-4 text-overline mb-4">IFSC Code</td>
              <td>
                <div class="d-flex align-center">
                  <div class="text-body-1">
                    <VChip variant="outlined">
                      {{ bankDetails[0]?.ifsc_code }}
                    </VChip>
                  </div>
                </div>
              </td>

            </tr>
            <tr v-if="bankDetails.length">
              <td class="font-weight-medium me-4 text-overline mb-4">Bank Name</td>
              <td>
                <div class="d-flex align-center">
                  <div class="text-body-1">
                    <VChip variant="outlined">
                      {{ bankDetails[0]?.bank_name }}
                    </VChip>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="bankDetails.length">
              <td class="font-weight-medium me-4 text-overline mb-4">Address</td>
              <td>
                <div class="d-flex align-center">
                  <div class="text-body-1">
                    <VChip variant="outlined">
                      {{ bankDetails[0]?.bank_address }}, {{ transdetails[0]?.country }}
                    </VChip>
                  </div>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </VCol>
      </VRow>

      <VDivider class="mt-6 border-dashed"/>
      <VDivider class="mt-1 mb-6 border-dashed"/>

      <!-- 👉IF APPROVED SUMMARY -->
      <div v-if="props.selectedTransaction?.status === 3"
           class="d-flex justify-space-between flex-wrap flex-column flex-sm-row"
      >
        <div class="mb-6 mb-sm-0">
        </div>

        <div>
          <table class="w-100">
            <tbody>
            <tr>
              <td class="font-weight-medium me-4 text-overline mb-4">
                Deal Id :
              </td>
              <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                <h6 class="text-h6">
                  <div class="d-flex align-center">
                    <div class="text-body-1">
                      <VChip variant="outlined">
                        #{{ props.selectedTransaction?.dealid }}
                      </VChip>
                    </div>
                  </div>

                </h6>
              </td>
            </tr>
            <tr>
              <td class="font-weight-medium me-4 text-overline mb-4">
                Approved at :
              </td>
              <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                <h6 class="text-h6">
                  <div class="d-flex align-center">
                    <div class="text-body-1">
                      <VChip variant="outlined">
                        {{ formatFullDateTime(props.selectedTransaction?.updated_at) }}
                      </VChip>
                    </div>
                  </div>


                </h6>
              </td>
            </tr>
            <tr>
              <td class="font-weight-medium me-4 text-overline mb-4">
                Approved By :
              </td>
              <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                <h6 class="text-h6">
                  <div class="d-flex align-center">
                    <div class="text-body-1">
                      <VChip variant="outlined">
                        {{ props.selectedTransaction?.processed_staff_name }}
                      </VChip>
                    </div>
                  </div>

                </h6>
              </td>
            </tr>
            </tbody>
          </table>

          <VDivider class="mt-4 mb-3"/>

          <table class="w-100">
            <tbody>
            <tr>
              <td class="font-weight-medium me-4 text-overline mb-4">
                Approved Amount :
              </td>
              <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                <div class="d-flex align-center">
                  <div class="text-body-1">
                    <VChip size="default" color="secondary" variant="tonal" class="text-h5">
                      {{ formatCurrency(props.selectedTransaction?.amount_app) }}
                    </VChip>
                  </div>
                </div>

              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <VRow v-if="props.selectedTransaction?.status === 0">
        <VCol class="col-10 text-sm-end">

          <!-- Approve Button -->
          <VBtn v-if="hasAccess('approve_withdraw_ticket')" class="me-2" color="primary"
                @click="ApprovewithdrawDialogVisible = true"
          >
            Approve Withdrawal
            <VIcon end icon="tabler-pencil"/>
          </VBtn>

          <!-- Reject Button -->
          <VBtn v-if="hasAccess('reject_withdraw_ticket')" color="error" class="me-2"
                @click="RejectwithdrawDialogVisible = true"
          >
            Reject Withdrawal
            <VIcon end icon="tabler-circle-x"/>
          </VBtn>


          <!-- Cancel Button -->
          <VBtn color="secondary" @click="dialogModelValueUpdate(false)">
            <VIcon start icon="tabler-circle-minus"/>
            Cancel
          </VBtn>

        </VCol>
      </VRow>

      <VDivider class="my-6 border-dashed"/>
    </VCard>
  </VDialog>

  <ApprovewithdrawTicketDialog v-model:isDialogVisible="ApprovewithdrawDialogVisible"
                               :selectedTransaction="props.selectedTransaction"
                               :transaction_id="props.selectedTransaction?.transaction_id"
                               :amount="props.selectedTransaction?.amount_req"
  />
  <RejectwithdrawTicketDialog v-model:isDialogVisible="RejectwithdrawDialogVisible"
                              :selectedTransaction="props.selectedTransaction"
                              :transaction_id="props.selectedTransaction?.transaction_id"
                              :amount="props.selectedTransaction?.amount_req"
  />
</template>
