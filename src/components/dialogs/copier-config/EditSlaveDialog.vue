<script setup>
import { computed, ref, watch } from "vue"
import { VRow } from "vuetify/lib/components/index.mjs"

const searchQuery = ref('')
const mt5UserList = ref([])
const clientId = ref(null)
const mtAccountId = ref(null)
const identicalConfig = ref(false)
const riskApproachList = [
  { text: 'Fixed Lot', value: 'FIXL' },
  { text: 'Lot Multiplier', value: 'LMUL' },
  { text: 'Balance Multiplier', value: 'BMUL' },
  { text: 'Equity Multiplier', value: 'EMUL' },
  { text: 'Fixed Balance Multiplier', value: 'FBMUL' },
]
const riskApproach = ref(null)
const multiplier = ref(null)
const stopLoss = ref(false)
const takeProfit = ref(false)
const reverseTrade = ref(false)
const FMBalance = ref(null)
const lotSize = ref(null)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
const isBtnLoading = ref(false)
const masterId = ref(null)
const isSubmitBtnDisable = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  slaveDetails: {
    type: Object,
    required: true,
  },
  selectedSlave: {
    type: Object,
    required: true,
  },

})


const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

const closeDialog = () => {
  emit('update:isDialogVisible', false)
}

const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val)
}


const suffix = computed(() => {
  switch (riskApproach.value) {
  case 'FIXL':
    return ''
  case 'LMUL':
  case 'BMUL':
  case 'EMUL':
  case 'FBMUL':
    return '%'
  default:
    return '%'
  }
})

const decimalValidator = (value) => {
  return /^(\d+|\d*\.\d{1,2})$/.test(value.toString()) || 'Must be a number with up to 2 decimal places'
}

watch(() => props.selectedSlave, (newVal) => {
  if (newVal) {
    // Log each property of the new value for debugging

    // Set the values

    identicalConfig.value = newVal.is_config_identical === 1
    riskApproach.value = newVal.risk_approach
    multiplier.value = newVal.multiplier
    lotSize.value = newVal.lot_size
    stopLoss.value = newVal.copy_sl === 1
    takeProfit.value = newVal.copy_tp === 1
    reverseTrade.value = newVal.is_reverse === 1
    FMBalance.value = newVal.fixed_balance
  }
}, { immediate: true })

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isBtnLoading.value = true
    try {
      console.log("Client ID:", props.selectedSlave.client_id)

      const res = await $api('/copier-slaves/update', {
        method: 'POST',
        body: {
          id: props.selectedSlave.id,

          is_config_identical: identicalConfig.value,
          risk_approach: riskApproach.value,
          lot_size: lotSize.value,
          multiplier: multiplier.value,
          fixed_balance: FMBalance.value,
          copy_sl: stopLoss.value,
          copy_tp: takeProfit.value,
          is_reverse: reverseTrade.value,
          status: true,
          is_live: true,
        },
      })
      successTitle.value = 'Success!'
      successMessage.value = 'Slave Updated Successfully!'
      isSuccessDialogVisible.value = true
    } catch (error) {
      console.error("API Call Error:", error)
      errorTitle.value = 'Something Went Wrong!'
      errorMessage.value = error.data?.message || 'An error occurred'
      isErrorDialogVisible.value = true
    } finally {
      isBtnLoading.value = false
    }
  }
}
watch(() => riskApproach.value, (newVal) => {
  if (newVal !== 'FIXL') {
    // Set lotsize to '0' when the risk approach is not 'FIXL'
    lotSize.value = '0'
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
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 650" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate"
  >
    <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>
    <VCard>
      <VCardTitle class="pt-3">Edit Slave Account</VCardTitle>

      <VDivider/>
      <VForm class="ml-3" @submit.prevent="() => { }">
        <VRow>


          <VCol cols="12" class="ml-2">
            <h4 class="ml-4 my-1"> Master : {{ props.slaveDetails.mc_name }}</h4>
            <VRow class="d-flex justify-space-between align-center flex-wrap">
              <VCol class="d-flex align-center">
                <CustomClientCardChip class="mx-3 my-2"
                                      :client_name="props.slaveDetails.client.client_name"
                                      :client_id="props.slaveDetails.client.id" :email="props.slaveDetails.client.email"
                                      :client_pic="props.slaveDetails.client_pic"
                />
              </VCol>
              <VCol class="d-flex align-center flex-column pb-6 mr-6" cols="auto">
                <CustomMT5Chip class="mb-2 mr-2" :client_id="props.slaveDetails.client.id"
                               :mt_id="props.slaveDetails.mc_mt5_id?.toString()" :is_wallet="0"
                />
                <div>Master Account</div>
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="12" class="ml-2">
            <h4 class="ml-4 my-1"> Slave : </h4>
            <VRow class="d-flex justify-space-between align-center flex-wrap">
              <VCol class="d-flex align-center">
                <!-- Update to use slave details instead of master's client details -->
                <CustomClientCardChip class="mx-3 my-2"
                                      :client_name="props.slaveDetails.slaves[0].client.client_name"
                                      :client_id="props.slaveDetails.slaves[0].client.id"
                                      :email="props.slaveDetails.slaves[0].client.email"
                                      :client_pic="props.slaveDetails.slaves[0].client.profile_pic"
                />
              </VCol>
              <VCol class="d-flex align-center flex-column pb-6 mr-6" cols="auto">
                <CustomMT5Chip class="mb-2 mr-2" :client_id="props.slaveDetails.slaves[0].client.id"
                               :mt_id="props.slaveDetails.slaves[0].sl_mt5_id?.toString()" :is_wallet="0"
                />
                <div>Mapped Slave</div>
              </VCol>
            </VRow>
          </VCol>

        </VRow>
        <VDivider class="mb-2"/>
        <VRow>

          <VCol cols="12">

            <!--  <VSwitch :model-value="identicalConfig" v-model="identicalConfig"
                label="Set Identical Configuration for all slaves" />  -->
          </VCol>

          <VCol cols="6">
            <AppSelect v-model="riskApproach" :items="riskApproachList" item-title="text" item-value="value"
                       label="Risk Approach"
            />
          </VCol>
          <VCol cols="5" v-if="riskApproach === 'FIXL'" class="mr-1">
            <AppTextField label="Lot Size" v-model="lotSize" type="number" min="0"
                          :rules="[requiredValidator, decimalValidator]"
            />
          </VCol>

          <VCol cols="5"
                v-if="riskApproach === 'LMUL' || riskApproach === 'BMUL'|| riskApproach === 'EMUL' || riskApproach === 'FBMUL'"
                class="mr-1"
          >
            <AppTextField label="Multiplier" v-model="multiplier" type="number" min="0" suffix="%"
                          :rules="[requiredValidator, decimalValidator]"
            />
          </VCol>

          <VCol cols="6" v-if="riskApproach === 'FBMUL'">
            <AppTextField label="Fixed Master Balance" v-model="FMBalance" type="number" min="0"
                          :rules="[requiredValidator, decimalValidator]"
            />
          </VCol>
        </VRow>

        <VRow class="ml-2">
          <VCardTitle>Advanced Settings</VCardTitle>
        </VRow>
        <VRow class="ml-2">
          <VCol cols="4">
            <div class="mt-4">
              <VSwitch v-model="stopLoss" label="Copy Stop Loss"/>
            </div>
          </VCol>
          <VCol cols="4">
            <div class="mt-4">
              <VSwitch v-model="takeProfit" label="Copy Take Profit"/>
            </div>
          </VCol>
          <VCol cols="4">
            <div class="mt-4">
              <VSwitch v-model="reverseTrade" label="Reverse Trade"/>
            </div>
          </VCol>
        </VRow>

        <VRow class="ml-2 mt-2 mb-2">
          <VCol cols="6">
            <VBtn class="me-2" color="primary" @click="isConfirmDialogVisible = true"
                  :loading="isBtnLoading" :disabled="isSubmitBtnDisable"
            >
              Update
            </VBtn>
          </VCol>
        </VRow>

      </VForm>
    </VCard>
  </VDialog>

  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Are you sure you want to update the Slave Account?" cancel-title="Cancelled"
                 confirm-title="Confirm"
  />

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
        <VBtn color="success" @click="handlePageReload">Ok</VBtn>
      </VCardText>
    </VCard>
  </VDialog>

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
        <VBtn color="success" @click="handlePageReload()">OK</VBtn>
      </VCardText>
    </VCard>
  </VDialog>

</template>
