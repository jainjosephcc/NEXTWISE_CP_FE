<script setup>

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
const updatedWithdrawAmount = ref(0)




let MD5Hash = ref('');
let checksum = ref('');


const isConfirmDialogVisible = ref(false);
const isConfirmRejectDialogVisible = ref(false);


const isApproveBtnLoading = ref(false);
const isRejectBtnLoading = ref(false);

const isSuccessDialogVisible = ref(false);
let successTitle = ref('')
let successMessage = ref('')

const isErrorDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')


watch(props, () => {
  transData.value = structuredClone(toRaw(props.selectedTransaction));
  updatedWithdrawAmount.value = props.selectedTransaction.amount_req;
})

const handlePageReload = async (confirmed) => {
  window.location.reload();
}

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}




// To access the properties individually and maintain reactivity, use `toRefs`
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
    <VCard class="pa-6 pa-sm-10">
      <!-- SECTION Header -->
      <div
        class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
        <!-- 👉 Left Content -->
        <div>
          <div class="d-flex align-center app-logo mb-6">
            <!-- 👉 Logo -->
            <!-- <VNodeRenderer  /> -->

            <!-- 👉 Title -->
            <h6 class="app-logo-title">
              Internal Transaction Details
            </h6>
          </div>

          <VListItem class="font-weight-medium ms-0 ps-0 text-h5">
            <CustomClientCardChip :client_id="props.selectedTransaction.client_id"
              :client_name="props.selectedTransaction.client_name" :email="props.selectedTransaction.email" />
          </VListItem>
          <VListItem v-if="props.selectedTransaction.manager_id != null" class="font-weight-medium ms-0 ps-0 text-h5">
            <CustomStaffCardChip :rm_id="props.selectedTransaction.manager_id"
              :rm_name="props.selectedTransaction.rm_name" rm_email="Relationship Manager" />

          </VListItem>

        </div>

        <!-- 👉 Right Content -->
        <div class="d-flex flex-column gap-2">
          <!-- 👉 Invoice Id -->
          <div class="d-flex align-start align-sm-center gap-x-4 font-weight-medium text-md flex-column flex-sm-row">
            <span class="font-weight-medium me-4 text-overline" style="inline-size: 8.625rem ;">Ticket ID:</span>
            <span>
              <!-- <AppTextField v-model="props.selectedTransaction.transaction_id" disabled prefix="#"
                                style="inline-size: 9.5rem;" /> -->
              <VChip size="default" color="secondary" variant="outlined" class="text-h6">
                #{{ props.selectedTransaction.transaction_id }}
              </VChip>
            </span>
          </div>

          <!-- 👉 Issue Date -->
          <div class="d-flex gap-x-4 align-start align-sm-center flex-column flex-sm-row">
            <span class="font-weight-medium me-4 text-overline" style="inline-size: 8.625rem;">Created
              Date:</span>

            <VChip size="default" color="secondary" variant="outlined" class="text-h6">
              {{ formatDate(props.selectedTransaction.created_at) }}
            </VChip>
          </div>

          <div class="d-flex gap-x-4 align-start align-sm-center flex-column flex-sm-row">
            <span class="font-weight-medium me-4 text-overline" style="inline-size: 8.625rem;">Created Time:</span>

            <VChip size="default" color="secondary" variant="outlined" class="text-h6">
              {{ formatTime(props.selectedTransaction.created_at) }}
            </VChip>
          </div>
          <div class="d-flex gap-x-4 align-start align-sm-center flex-column flex-sm-row">
            <span class="font-weight-medium me-4 text-overline" style="inline-size: 8.625rem;">Status:</span>

            <VChip v-if="props.selectedTransaction.status === 0" color="secondary" variant="outlined">
              <VIcon start icon="tabler-hourglass-high" />
              Pending
            </VChip>
            <VChip v-if="props.selectedTransaction.status === 1" color="warning" variant="outlined">
              <VIcon start icon="tabler-info-square-rounded" />
              On Hold
            </VChip>
            <VChip v-if="props.selectedTransaction.status === 2" color="error" variant="outlined">
              <VIcon start icon="tabler-ban" />
              Rejected
            </VChip>
            <VChip v-if="props.selectedTransaction.status === 3" color="success" variant="outlined">
              <VIcon start icon="tabler-check" />
              Success
            </VChip>
          </div>
        </div>
      </div>
      <!-- !SECTION -->

      <VRow>
        <VCol class="text-no-wrap">
          <h6 class="font-weight-medium me-4 text-overline">
            Transferred From:
          </h6>
          <CustomMT5Chip :client_id="props.selectedTransaction.client_id"
            :is_wallet="props.selectedTransaction.from_mt_wallet" :mt_id="props.selectedTransaction.from_mt_id" />
        </VCol>
        <VCol class="text-no-wrap">
          <h6 class="font-weight-medium me-4 text-overline">
            Transferred To:
          </h6>
          <CustomMT5Chip :client_id="props.selectedTransaction.client_id"
            :is_wallet="props.selectedTransaction.to_mt_wallet" :mt_id="props.selectedTransaction.to_mt_id" />
        </VCol>

        <VCol class="text-no-wrap">
          <h6 class="font-weight-medium me-4 text-overline">
            Details:
          </h6>

          <table>
            <tbody>

              <tr>
                <td class="font-weight-medium me-4 text-overline">
                  Transferred Amount
                </td>
                <td class="font-weight-medium me-4 text-overline">
                  <VChip size="default" color="secondary" variant="elevated" class="text-h6">
                    {{ formatCurrency(props.selectedTransaction.trans_amount) }}
                  </VChip>
                </td>
              </tr>
              <tr>
                <td>
                  <VDivider class="my-6 border-dashed" />
                </td>
                <td>
                  <VDivider class="my-6 border-dashed" />
                </td>
              </tr>
            </tbody>
          </table>
        </VCol>
      </VRow>

      <VDivider class="mt-6 border-dashed" />
      <VDivider class="mt-1 mb-6 border-dashed" />

      <!-- 👉IF APPROVED SUMMARY -->
      <div v-if="props.selectedTransaction.status === 3"
        class="d-flex justify-space-between flex-wrap flex-column flex-sm-row">
        <div class="mb-6 mb-sm-0">

        </div>

        <div>
          <table class="w-100">
            <tbody>
              <tr>
                <td class="font-weight-medium me-4 text-overline">
                  Out Trans. Deal Id :
                </td>
                <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                  <h6 class="font-weight-medium me-4 text-overline">
                    {{ props.selectedTransaction.from_deal_id }}
                  </h6>
                </td>
              </tr>
              <tr>
                <td class="font-weight-medium me-4 text-overline">
                  In Trans. Deal Id :
                </td>
                <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                  <h6 class="font-weight-medium me-4 text-overline">
                    {{ props.selectedTransaction.to_deal_id }}
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
              <tr>
                <td class="font-weight-medium me-4 text-overline">
                  Approved By :
                </td>
                <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                  <h6 class="font-weight-medium me-4 text-overline">
                    AUTO
                  </h6>
                </td>
              </tr>
            </tbody>
          </table>

          <VDivider class="mt-4 mb-3" />

          <table class="w-100">
            <tbody>
              <tr>
                <td class="font-weight-medium me-4 text-overline">
                  Transferred Amount :
                </td>
                <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                  <!-- <h6 class="text-h5">
                    {{ formatCurrency(props.selectedTransaction.approved_amount) }}
                </h6> -->
                  <VChip size="default" color="secondary" variant="tonal" class="font-weight-medium me-4 text-overline">
                    {{ formatCurrency(props.selectedTransaction.trans_amount) }}
                  </VChip>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <VDivider class="my-6 border-dashed" />


      <!-- <div>
          <h6 class="text-h6 mb-2">
              Note:
          </h6>
          <VTextarea v-model="note" placeholder="Write note here..." :rows="2" />
      </div> -->
    </VCard>
  </VDialog>
</template>
