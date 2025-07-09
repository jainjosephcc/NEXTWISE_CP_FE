<script setup>
import { defineEmits, defineProps, ref, watch } from 'vue'; // Import required Vue functionalities


// Define reactive state variables
const slaveId = ref(null)
const searchQuery = ref('')
const copiername = ref(null)
const toggleSwitch = ref(true)
const clientId = ref(null)
const identicalConfig = ref(false)

const riskApproachList = [
  { text: 'Fixed Lot', value: 'FIXL' },
  { text: 'Lot Multiplier', value: 'LMUL' },
  { text: 'Balance Multiplier', value: 'BMUL' },
  { text: 'Equity Multiplier', value: 'EMUL' },
  { text: 'Fixed Balance Multiplier', value: 'FBMUL' },
]
const riskApproach = ref(null)
const multiplier = ref(0.00)
const stopLoss = ref(false)
const takeProfit = ref(false)
const reverseTrade = ref(false)
const status = ref(false)
const FMBalance = ref(0.00)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const isBtnLoading = ref(false)
const lotsize = ref(null) // Fixed reference issue (was lotSize before)
const description = ref(null)
const commission = ref(null)
const mt5_error = ref(null);
const isBtnDisable = ref(false)


// Define props for the component
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  masterDetails: {
    type: Object,
    required: true,
  },
  slaveList: {
    type: Object,
    required: false,
  },
})

// Define emit events
const emit = defineEmits(['submit', 'update:isDialogVisible'])

// Function to close the dialog
const closeDialog = () => {
  emit('update:isDialogVisible', false)
}

// Function to update the dialog model value
const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val)
}

// Decimal validator function to ensure the value has up to 2 decimal places
const decimalValidator = (value) => {
  return /^(\d+|\d*\.\d{1,2})$/.test(value.toString()) || 'Must be a number with up to 2 decimal places'
}

// Watcher to update values when selectedSlave changes

watch(() => props.slaveList, (newVal) => {
  if (newVal) {
    slaveId.value = newVal.id || ''
    identicalConfig.value = newVal.is_config_unique === 1
    searchQuery.value = newVal.sl_mt5_id || ''
    riskApproach.value = newVal.risk_approach
    multiplier.value = newVal.multiplier
    lotsize.value = newVal.lot_size
    stopLoss.value = newVal.copy_sl === 1
    takeProfit.value = newVal.copy_tp === 1
    reverseTrade.value = newVal.is_reverse === 1
    FMBalance.value = newVal.fixed_balance
    commission.value = newVal.commission_percentage ?? ''
    status.value = newVal.status === 1
  }
}, { immediate: true })

// Function to handle the confirm dialog and make the API call
const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isBtnLoading.value = true

    try {
      const res = await $api('slaves/update', { // Assuming $api is globally available
        method: 'POST',
        body: {
          id: props.slaveList.id,
          master_id: props.masterDetails?.id,
          sl_mt5_id: searchQuery.value,
          server_id: props.masterDetails?.server_id,
          is_config_unique: identicalConfig.value,
          risk_approach: riskApproach.value,
          lot_size: lotsize.value,
          multiplier: multiplier.value,
          fixed_balance: FMBalance.value,
          copy_sl: stopLoss.value,
          copy_tp: takeProfit.value,
          is_reverse: reverseTrade.value,
          status: status.value,
          is_live: true,
          commission_percentage: commission.value
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong!'
          errorMessage.value = response._data.message
          isBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })
      if (res) {
        successTitle.value = 'Success!'
        successMessage.value = 'Slave Updated Successfully!'
        isBtnLoading.value = false
        isSuccessDialogVisible.value = true
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!'
      errorMessage.value = 'Something Went Wrong!'
      isBtnLoading.value = false
      isErrorDialogVisible.value = true
    }
  }
}

watch(searchQuery, () => {

  if (props.masterDetails.mc_mt5_id == searchQuery.value) {
    mt5_error.value = 'Master ID and Slave ID cannot be the same';
    isBtnDisable.value = true
  } else {
    mt5_error.value = null;
    isBtnDisable.value = false
  }
});


// Function to reload the page
const handlePageReload = () => {
  emit('reload', props.masterDetails.id); // Emit masterId
  isSuccessDialogVisible.value = false
  isErrorDialogVisible.value = false
  dialogModelValueUpdate(false)
};
</script>

<template>
  <section>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 650" :model-value="props.isDialogVisible"
      @update:model-value="dialogModelValueUpdate">
      <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
      <VCard>
        <div class="sticky-card">
          <VCardTitle class="pt-3">Edit Slave Account</VCardTitle>
          <VDivider />
        </div>
        <!--        {{ slaveList }}-->
        <VForm @submit.prevent="() => { }">
          <VRow>
            <VTable fixed-header class="text-no-wrap mt-6 mb-6 ml-4">
              <tr>
                <td>
                  <VListItem>
                    <VListItemTitle class="font-weight-medium me-4 text-overline">
                      <VAvatar color="secondary" size="30" variant="tonal" rounded icon="tabler-server" class="mr-1" />
                      <span class="text-body">Master Name :</span>
                    </VListItemTitle>
                    <template #append>
                      <div class="d-flex align-center">
                        <div class="text-body-1">
                          {{ masterDetails.mc_name }}
                        </div>
                      </div>
                    </template>
                  </VListItem>
                </td>
                <td>
                  <VListItem>
                    <VListItemTitle class="font-weight-medium me-4 text-overline">
                      <VAvatar color="secondary" size="30" variant="tonal" rounded icon="tabler-cpu-2" class="mr-1" />
                      MT5 ACCOUNT :
                    </VListItemTitle>
                    <template #append>
                      <div class="d-flex align-center gap-x-2">
                        <div class="text-body-1">
                          <VChip size="medium" class="pr-3 pl-3 pt-1 pb-1">
                            <div class="pr-1">
                              <VImg src="/images/svg/mt5_lined.svg" style="padding: 5px; width: 25px;" />
                            </div>
                            {{ masterDetails.mc_mt5_id }}
                          </VChip>
                        </div>
                      </div>
                    </template>
                  </VListItem>
                </td>
              </tr>
              <tr>
                <td>
                  <VListItem>
                    <VListItemTitle class="font-weight-medium me-4 text-overline">
                      <VAvatar color="secondary" size="30" variant="tonal" rounded icon="tabler-brand-coinbase"
                        class="mr-1" />
                      Company Name :
                    </VListItemTitle>
                    <template #append>
                      <div class="d-flex align-center">
                        <div class="text-body-1">
                          {{ masterDetails?.server?.company_name }}
                        </div>
                      </div>
                    </template>
                  </VListItem>
                </td>
                <td>
                  <VListItem>
                    <VListItemTitle class="font-weight-medium me-4 text-overline">
                      <VAvatar color="secondary" size="30" variant="tonal" rounded icon="tabler-category-2"
                        class="mr-1" />
                      Server Name :
                    </VListItemTitle>
                    <template #append>
                      <div class="d-flex align-center gap-x-2">
                        <div class="text-body-1">
                          {{ masterDetails?.server?.server_name }}
                        </div>
                      </div>
                    </template>
                  </VListItem>
                </td>
              </tr>
            </VTable>

          </VRow>
          <VDivider class="mb-2" />
          <VRow class="mt-2 ml-1 mr-1">

            <VCol cols="6">
              <div>
                <AppTextField label="MT5 ID" v-model="searchQuery" disabled />
              </div>
              <div v-if="mt5_error" class="error-message">
                {{ mt5_error }}
              </div>
            </VCol>
            <VCol cols="6">

              <AppTextField label="Commission" v-model="commission" suffix="%" />

            </VCol>

            <!--            <VCol cols="5">
              <div class="mt-4 mr-1">

                <VSwitch v-model="identicalConfig" label="Set Identical Configuration for all slaves"/>
                <p>Current Identical Config Value: {{ identicalConfig }}</p>
              </div>
            </VCol>-->
            <VCol cols="6">
              <AppSelect v-model="riskApproach" :items="riskApproachList" item-title="text" item-value="value"
                label="Risk Approach" single-line :rules="[requiredValidator]" />
            </VCol>

            <VCol cols="6" v-if="riskApproach === 'FIXL'" class="">
              <AppTextField label="Lot Size" v-model="lotsize" type="number" min="0"
                :rules="[requiredValidator, decimalValidator]" />
            </VCol>

            <VCol cols="6"
              v-if="riskApproach === 'LMUL' || riskApproach === 'BMUL' || riskApproach === 'EMUL' || riskApproach === 'FBMUL'"
              class="">
              <AppTextField label="Multiplier" v-model="multiplier" type="number" min="0" suffix="%"
                :rules="[requiredValidator, decimalValidator]" />
            </VCol>

            <VCol cols="6" v-if="riskApproach === 'FBMUL'">
              <AppTextField label="Fixed Master Balance" v-model="FMBalance" type="number" min="0"
                :rules="[requiredValidator, decimalValidator]" />
            </VCol>

          </VRow>

          <VCardTitle v-if="identicalConfig" class="mt-2">Advanced Settings</VCardTitle>

          <VRow v-if="identicalConfig" class="ml-2">
            <VCol cols="4">
              <VSwitch v-model="stopLoss" label="Copy Stop Loss" />
            </VCol>
            <VCol cols="4">
              <VSwitch v-model="takeProfit" label="Copy Take Profit" />
            </VCol>
            <VCol cols="4">
              <VSwitch v-model="reverseTrade" label="Reverse Trade" />
            </VCol>
          </VRow>
          <VRow class="ml-2 mt-2 mb-2">
            <VCol cols="6">
              <VSwitch v-model="status" :label="status ? 'Active' : 'Inactive'" />
            </VCol>
          </VRow>
          <VRow class="ml-2 mt-2 mb-2">
            <VCol cols="6">
              <VBtn color="primary" @click="isConfirmDialogVisible = true" :loading="isBtnLoading"
                :disabled="isBtnDisable">
                Update Slave
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
      confirmation-question="Do you want to update this slave?" cancel-title="Cancel" confirm-title="Confirm" />

    <VDialog v-model="isSuccessDialogVisible" max-width="500">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VBtn icon variant="outlined" color="success" class="my-4"
            style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
            <VIcon icon="tabler-check" size="38" />
          </VBtn>
          <h1 class="text-h4 mb-4">{{ successTitle }}</h1>
          <p>{{ successMessage }}</p>
          <VBtn color="success" @click="handlePageReload">OK</VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <VDialog v-model="isErrorDialogVisible" max-width="500">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VBtn icon variant="outlined" color="error" class="my-4"
            style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
            <span class="text-5xl font-weight-light">X</span>
          </VBtn>
          <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
          <p>{{ errorMessage }}</p>
          <VBtn color="success" @click="handlePageReload">Ok</VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

<style scoped>
.sticky-card {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 1000;
  /* background-color: white; */
}

.small-textarea {
  height: 100px;
  width: 300px;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-size: 0.8rem;
}
</style>
