<script setup>
import { computed, ref } from "vue";

// Reactive variables
const searchQuery = ref('')
const mt5UserList = ref([])
const copiername = ref('')
const identicalConfig = ref(false)
const riskApproach = ref('')
const multiplier = ref(null)
const stopLoss = ref(false)
const status = ref(false)
const takeProfit = ref(false)
const reverseTrade = ref(false)
const FMBalance = ref(null)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
const isBtnLoading = ref(false)
const mtAccountId = ref(null)
const isSubmitBtnDisable = ref(false)
const clientId = ref(null)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const lotsize = ref(null)
// Props for the modal
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  selectedMaster: {
    type: Object,
    required: false,
  },
})

// Emit events
const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])
const closeDialog = () => {
  emit('update:isDialogVisible', false)
}

// Risk approach list
const riskApproachList = [
  { text: 'Fixed Lot', value: 'FIXL' },
  { text: 'Lot Multiplier', value: 'LMUL' },
  { text: 'Balance Multiplier', value: 'BMUL' },
  { text: 'Equity Multiplier', value: 'EMUL' },
  { text: 'Fixed Balance Multiplier', value: 'FBMUL' },
]

const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val)
}


// Suffix for multiplier and lot size based on risk approach
const suffix = computed(() => {
  switch (riskApproach.value) {
    case 'FIXL':
      return ''
    case 'LMUL':
    case 'BMUL':
    case 'FBMUL':
      return '%'
    default:
      return ''
  }
})

// Decimal validator function
const decimalValidator = (value) => {
  return /^(\d+|\d*\.\d{1,2})$/.test(value.toString()) || 'Must be a number with up to 2 decimal places'
}
// Watcher for selectedMaster prop
watch(
  () => props.selectedMaster,
  (newValue) => {
    if (newValue) {

      copiername.value = newValue.mc_name || ''
      identicalConfig.value = newValue.is_config_identical === 1
      riskApproach.value = newValue.risk_approach || ''
      multiplier.value = newValue.multiplier || null
      lotsize.value = newValue.lot_size
      FMBalance.value = newValue.fixed_balance || null
      stopLoss.value = newValue.copy_sl === 1
      takeProfit.value = newValue.copy_tp === 1
      reverseTrade.value = newValue.is_reverse === 1
      status.value = newValue.status === 1

    }
  },
  { immediate: true },
)
// Handle updating the Copier Master
const handleConfirm = async (confirmed) => {
  console.log('handleConfirm called with:', confirmed) // Add this log
  if (confirmed) {
    isBtnLoading.value = true
    isSubmitBtnDisable.value = true

    try {
      const res = await $api('/copier-masters/update', {
        method: 'POST',
        body: {
          id: props.selectedMaster.id,
          mc_name: copiername.value || props.selectedMaster.mc_name,
          performance_matrix: props.selectedMaster.performance_matrix,
          risk_factor: props.selectedMaster.risk_factor,
          is_config_identical: identicalConfig.value,
          risk_approach: riskApproach.value,
          lot_size: lotsize.value,
          multiplier: multiplier.value,
          fixed_balance: FMBalance.value,
          copy_sl: stopLoss.value,
          copy_tp: takeProfit.value,
          is_reverse: reverseTrade.value,
          status: props.selectedMaster.status,
          is_live: props.selectedMaster.is_live,
        },
        onResponseError({ response }) {
          console.log('Error response:', response) // Add more logs to see response
        },
      })

      console.log('API response:', res) // Log the response to verify success

      if (res) {
        successTitle.value = 'Success!'
        successMessage.value = 'Copier Updated Successfully!'
        isBtnLoading.value = false
        isSuccessDialogVisible.value = true
        isSubmitBtnDisable.value = false
      }
    } catch (error) {
      console.log('API Error:', error) // Add more logs to track the error
    }
  }
}

watch(() => riskApproach.value, (newVal) => {
  if (newVal !== 'FIXL') {
    // Set lotsize to '0' when the risk approach is not 'FIXL'
    lotsize.value = '0'
  } else {
    // Set multiplier to '0' for other risk approaches
    multiplier.value = '0'
  }
})
const handlePageReload = () => {
  window.location.reload()
}

</script>


<template>
  < <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 650" :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate">

    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
    <VCard>
      <div class="sticky-card">
        <VCardTitle class="pt-3">Edit Master Account</VCardTitle>
        <VDivider />
      </div>

      <VDivider />
      <VForm class="ml-3" @submit.prevent="() => { }">
        <VRow class="mt-2 ml-2">
          <VCol cols="12" class="ml-2">

            <h4 class="ml-4 my-1">Master : {{ props.selectedMaster?.mc_name }}</h4>

            <VRow class="d-flex justify-space-between align-center flex-wrap">
              <VCol class="d-flex align-center">
                <CustomClientCardChip class="mx-3 my-2" :client_name="props.selectedMaster?.client?.client_name"
                  :client_id="props.selectedMaster?.client?.id" :email="props.selectedMaster?.client?.email"
                  :client_pic="props.selectedMaster?.client_pic" />
              </VCol>

              <VCol class="d-flex align-center flex-column pb-6 mr-6" cols="auto">

                <CustomMT5Chip class="mb-2 mr-2" :client_id="props.selectedMaster?.client?.id"
                  :mt_id="props.selectedMaster?.mc_mt5_id?.toString()" :is_wallet="0" />
                <div class="">Master Account</div>
              </VCol>
            </VRow>
            <!-- </VCard> -->
          </VCol>


          <VCol cols="6">
            <div>
              <AppTextField label="Update Copier Name" v-model="copiername" />
            </div>

          </VCol>
          <VCol cols="6">
            <VSwitch :model-value="identicalConfig" v-model="identicalConfig"
              label="Set Identical Configuration for all slaves" />
          </VCol>

          <VCol cols="6" v-if="identicalConfig">
            <AppSelect v-model="riskApproach" :items="riskApproachList" item-title="text" item-value="value"
              label="Risk Approach" />
          </VCol>
          <VCol cols="5" v-if="riskApproach === 'FIXL'" class="mr-1">
            <AppTextField label="Lot Size" v-model="lotsize" type="number" min="0"
              :rules="[requiredValidator, decimalValidator]" />
          </VCol>

          <VCol cols="5"
            v-if="riskApproach === 'LMUL' || riskApproach === 'BMUL' || riskApproach === 'EMUL' || riskApproach === 'FBMUL'"
            class="mr-1">
            <AppTextField label="Multiplier" v-model="multiplier" type="number" min="0" suffix="%"
              :rules="[requiredValidator, decimalValidator]" />
          </VCol>

          <VCol cols="6" v-if="riskApproach === 'FBMUL'">
            <AppTextField label="Fixed Master Balance" v-model="FMBalance" type="number" min="0"
              :rules="[requiredValidator, decimalValidator]" />
          </VCol>
        </VRow>

        <VRow v-if="identicalConfig" class="ml-2">
          <VCardTitle>Advanced Settings</VCardTitle>
        </VRow>
        <VRow v-if="identicalConfig" class="ml-2">
          <VCol cols="4">
            <div class="mt-4">
              <VSwitch v-model="stopLoss" label="Copy Stop Loss" />
            </div>
          </VCol>
          <VCol cols="4">
            <div class="mt-4">
              <VSwitch v-model="takeProfit" label="Copy Take Profit" />
            </div>
          </VCol>
          <VCol cols="4">
            <div class="mt-4">
              <VSwitch v-model="reverseTrade" label="Reverse Trade" />
            </div>
          </VCol>
        </VRow>
        <VRow class="ml-2 mt-2 mb-2">
          <VCol cols="6">
            <VSwitch v-model="status" :label="status ? 'Active' : 'Inactive'" />
          </VCol>
        </VRow>

        <VRow class="ml-2 mt-2 mb-2">
          <VCol cols="6">
            <VBtn class="me-2" color="primary" @click="isConfirmDialogVisible = true" :loading="isBtnLoading"
              :disabled="isSubmitBtnDisable">
              Update
            </VBtn>
          </VCol>
        </VRow>

      </VForm>


      <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
        confirmation-question="Are you sure you want to update the Master copier?" cancel-title="Cancelled"
        confirm-title="Cancelled!" />

      <VDialog v-model="isErrorDialogVisible" max-width="500">
        <VCard>
          <VCardText class="text-center px-10 py-6">
            <VBtn icon variant="outlined" color="error" class="my-4"
              style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
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

</template>
<style></style>
