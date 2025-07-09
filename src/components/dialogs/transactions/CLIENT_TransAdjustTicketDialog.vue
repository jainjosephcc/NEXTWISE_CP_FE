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
const AdjustTicketDialogVisible = ref(false)
watch(props, () => {
  transData.value = structuredClone(toRaw(props.selectedTransaction))

})
const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}
// To access the properties individually and maintain reactivity, use `toRefs`
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
              Adjustment Ticket Details
            </h6>
          </div>

          <VListItem class="p-0 m-0">
            <CustomClientCardChip :client_id="props.selectedTransaction.client_id"
                                  :client_name="props.selectedTransaction.client_name"
                                  :email="props.selectedTransaction.email"
            />
          </VListItem>
          <VListItem v-if="props.selectedTransaction.manager_id != null" class="p-0 m-0">
            <CustomStaffCardChip :rm_id="props.selectedTransaction.manager_id"
                                 :rm_name="props.selectedTransaction.rm_name" rm_email="Relationship Manager"
            />

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
                <VIcon icon="tabler-droplet-dollar" size="22"/>
              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              TRANSACTION STATUS
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
            Transffered To:
          </h6>

          <CustomMT5Chip :client_id="props.selectedTransaction.client_id"
                         :is_wallet="props.selectedTransaction.is_wallet" :mt_id="props.selectedTransaction.mt_id"
          />
        </VCol>

        <VCol class="text-no-wrap">
          <h6 class="font-weight-medium me-4 text-overline mb-4">
            Details:
          </h6>
          <!-- 👉 MT GROUP -->
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

          <!-- 👉  Transaction Type -->
          <VListItem class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              Transaction Type
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ props.selectedTransaction.transaction_type }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>
          <!-- 👉 Requested Amount IN USD-->
          <VListItem class="my-0 py-0">
            <VListItemTitle class="font-weight-medium me-4 text-overline">
              Requested Amount IN USD
            </VListItemTitle>
            <template #append>
              <div class="d-flex align-center">
                <div class="text-body-1">
                  <VChip variant="outlined">
                    {{ formatCurrency(props.selectedTransaction.amount) }}
                  </VChip>
                </div>
              </div>
            </template>
          </VListItem>
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
            <tr>
              <td class="font-weight-medium me-4 text-overline">
                Approved By :
              </td>
              <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                <h6 class="font-weight-medium me-4 text-overline">
                  {{
                    props.selectedTransaction.approved_by_rm_name ? props.selectedTransaction.approved_by_rm_name :
                      'AUTO'
                  }}
                </h6>
              </td>
            </tr>
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
                  {{ formatCurrency(props.selectedTransaction.amount) }}
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


          <VBtn v-if="hasAccess('process_credit_in')" class="me-2" color="primary"
                @click="AdjustTicketDialogVisible = true"
          >
            Approve/Reject Credit In
            <VIcon end icon="tabler-checkbox"/>
          </VBtn>


          <VBtn color="secondary" @click="dialogModelValueUpdate(false)">
            <VIcon start icon="tabler-circle-minus"/>
            Cancel
          </VBtn>
        </VCol>
      </VRow>

      <VDivider class="my-6 border-dashed"/>


    </VCard>
  </VDialog>

  <EditAdjustTicketDialog v-if="props.selectedTransaction" v-model:isDialogVisible="AdjustTicketDialogVisible"
                          :selectedTransaction="props.selectedTransaction"
                          :transaction_id="props.selectedTransaction?.transaction_id"
  />
</template>
