<script setup>
import {ref} from "vue";
import AppSelect from "@core/components/app-form-elements/AppSelect.vue";
import AppTextarea from "@core/components/app-form-elements/AppTextarea.vue";

const isDialogVisible = ref(false)
const slaveList = ref([]) // Replace with actual data if needed
const searchQuery = ref('')
const mt5UserList = ref([])
const selectedSlave = ref(null)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const successTitle = ref('')
const successMessage = ref('')
const isBtnLoading = ref(false)
const riskApproachList = [
  {text: 'Fixed Lot', value: 'FIXL'},
  {text: 'Lot Multiplier', value: 'LMUL'},
  {text: 'Balance Multiplier', value: 'BMUL'},
  {text: 'Equity Multiplier', value: 'EMUL'},
  {text: 'Fixed Balance Multiplier', value: 'FBMUL'},
]
const riskApproach = ref(null)
const multiplier = ref(100)
const FMBalance = ref(0.00)
const copySL = ref(false)
const copyTP = ref(false)
const reverseTrade = ref(false)
const lotsize = ref(0)
const commission = ref(30)

const identicalConfig = ref(false)
const stopLoss = ref(false)
const takeProfit = ref(false)
const status = ref(false)
const mt5_error = ref(null);
const isBtnDisable = ref(true)
const isActive = ref(false) // Initialize the active state

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  masterDropDown: {
    type: Object,
    required: true,
  },
  selectedSlaves: {
    type: Array,
    required: true,
  },
})
const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
]);
const isMultiple = ref(true);
const masterId = ref(null);
const masterDetails = ref({});
const mDropDown = ref([]);

const decimalValidator = (value) => {
  return /^(\d+|\d*\.\d{1,2})$/.test(value.toString()) || 'Must be a number with up to 2 decimal places'
}
watch([riskApproach, masterId], () => {
  if (riskApproach.value&&masterId.value) {
    isBulkAddBtnDisabled.value = false;
  }
}, {deep: true, immediate: false})
watch(() => props.masterDropDown, (newVal) => {
  if (newVal) {
    mDropDown.value = props.masterDropDown;
  }
});
const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val)
}
const handleMasterChanged = (newMasterId) => {
  masterId.value = newMasterId
  masterDetails.value = props.masterList.value.find(master => master.id === masterId.value)
}
const handlePageReload = () => {
  emit('reload'); // Emit masterId
  isSuccessDialogVisible.value = false
  isErrorDialogVisible.value = false
  emit('update:isDialogVisible', false);
};




const addSlave = async () => {
  isBtnLoading.value = true
  // Log payload to debug
  const payload = {
    master_id: masterId.value,
    sl_mt5_id: selectedSlave.value,
    server_id: 1,
    mapped_by: 1,
    is_config_unique: 1,
    risk_approach: riskApproach.value,
    lot_size: lotsize.value, // Ensure selectedSlave is defined
    multiplier: multiplier.value,
    fixed_balance: FMBalance.value,
    copy_sl: stopLoss.value,
    copy_tp: takeProfit.value,
    is_reverse: reverseTrade.value,
    status: true,
    is_live: true,
    commission_percentage: commission.value,

  }

  try {
    const res = await $api('slaves/store', {
      method: 'POST',
      body: payload,
      onResponseError({response}) {
        if (response && response._data && response._data.message) {
          errorTitle.value = 'Error!';
          errorMessage.value = response._data.message;
        } else if (response && response._data && response._data.errors) {
          const errorMessages = Object.values(response._data.errors).flat().join(', ')
          errorTitle.value = 'Validation Error!'
          errorMessage.value = errorMessages || 'There was a validation error.'
        } else {
          errorTitle.value = 'Error!';
          errorMessage.value = 'Something went wrong.';
        }
        isBtnLoading.value = false
        isErrorDialogVisible.value = true
      },
    })

    if (res) {
      successTitle.value = 'Success!'
      successMessage.value = 'Slave account added successfully!'
      isBtnLoading.value = false
      isSuccessDialogVisible.value = true
      selectedSlave.value = null;
      riskApproach.value = null;
      masterId.value = null;
      lotsize.value = 100;
      multiplier.value = null;
      stopLoss.value = false;
      takeProfit.value = false;
      reverseTrade.value = false;
      commission.value = 30;
      emit('submit', res)
    }
  } catch (error) {
    console.error('Unexpected Error:', error)
    console.log('Unexpected Error:', error)
  }

}

const isBulkValidated = ref(false);
const isBulkAddBtnDisabled = ref(true);
const isBulkUpdateBtnLoading = ref(false);
const bulkSlavesCount = ref(0);

const addBulkSlaves = async () => {
  isBulkUpdateBtnLoading.value = true
  // Log payload to debug
  try {
    const res = await $api('slaves/bulk-update', { // Assuming $api is globally available
      method: 'POST',
      body: {
        ids: props.selectedSlaves,
        master_id: masterId.value,
        server_id: props.masterDetails?.server_id,
        is_config_unique: 1,
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
        isBulkUpdateBtnLoading.value = false
        isErrorDialogVisible.value = true
      },
    })

    if (res) {
      successTitle.value = 'Success!'
      successMessage.value = res.message
      isBulkUpdateBtnLoading.value = false
      isSuccessDialogVisible.value = true
      selectedSlave.value = null;
      riskApproach.value = null;
      masterId.value = null;
      lotsize.value = 100;
      multiplier.value = null;
      stopLoss.value = false;
      takeProfit.value = false;
      reverseTrade.value = false;
      commission.value = 30;
      emit('submit', res)
    }
  } catch (error) {
    console.error('Unexpected Error:', error)
    console.log('Unexpected Error:', error)
  }
}

</script>

<template>
  <section>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 650" :model-value="props.isDialogVisible"
             @update:model-value="dialogModelValueUpdate">

      <!-- Dialog close btn -->
      <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>
      <VCard>
        <div class="sticky-card">
          <VCardTitle class="pt-3 ">Update Slave Accounts</VCardTitle>
          <VDivider/>
        </div>
        <VForm @submit.prevent="() => { }">
          <VDivider class="mb-2"/>

          <VRow class="ml-3 mr-3 mt-3">
            <!-- 👉 First Name -->
            <VCol
              cols="12"
              md="6"
              class="d-flex align-items-center"
            >
              <label
                class="v-label text-body-2 text-high-emphasis"
                for="firstName"
              >Select Master Account</label>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="masterId"
                :items="mDropDown"
                placeholder="Select Master"
                item-title="text"
                item-value="value"
                outlined
                dense
                clearable
                clear-icon="tabler-x"
                class="invoice-list-filter"
                @change="handleMasterChanged"
              />
            </VCol>
          </VRow>

          <VRow class="ml-3 mr-3 mt-2">

            <VCol cols="6">

              <AppTextField label="Commission" v-model="commission" type="number" min="0" suffix="%"/>

            </VCol>


            <VCol cols="6">
              <AppSelect v-model="riskApproach" :items="riskApproachList" item-title="text" item-value="value"
                         label="Risk Approach" single-line :rules="[requiredValidator]"/>
            </VCol>

            <VCol cols="6" v-if="riskApproach === 'FIXL'" class="">
              <AppTextField label="Lot Size" v-model="lotsize" type="number" min="0"
                            :rules="[requiredValidator, decimalValidator]"/>
            </VCol>
            <VCol cols="6"
                  v-if="riskApproach === 'LMUL' || riskApproach === 'BMUL' || riskApproach === 'EMUL' || riskApproach === 'FBMUL'"
                  class="">
              <AppTextField label="Multiplier" v-model="multiplier" type="number" min="0" suffix="%"
                            :rules="[requiredValidator, decimalValidator]"/>
            </VCol>
            <VCol cols="6" v-if="riskApproach === 'FBMUL'">
              <AppTextField label="Fixed Master Balance" v-model="FMBalance" type="number" min="0"
                            :rules="[requiredValidator, decimalValidator]"/>
            </VCol>
          </VRow>


          <VRow class="ml-3 mr-3 mt-2">
            <VCardTitle class="mt-2">Advanced Settings</VCardTitle>
            <VRow class="ml-2">
              <VCol cols="4">
                <div class="mt-1">
                  <VSwitch v-model="stopLoss" label="Copy Stop Loss"/>
                </div>
              </VCol>
              <VCol cols="4">
                <div class="mt-1">
                  <VSwitch v-model="takeProfit" label="Copy Take Profit"/>
                </div>
              </VCol>
              <VCol cols="4">
                <div class="mt-1">
                  <VSwitch v-model="reverseTrade" label="Reverse Trade"/>
                </div>
              </VCol>
            </VRow>
            <VRow class="ml-2 mt-2 mb-2">
              <VCol cols="6">
                <VSwitch v-model="status" :label="status ? 'Active' : 'Inactive'" />
              </VCol>
            </VRow>
          </VRow>
          <VRow class="ml-3 mt-2 mb-2">
            <VCol cols="6">
              <VBtn v-if="isMultiple" class="me-2" color="primary" @click="addBulkSlaves" :loading="isBulkUpdateBtnLoading"
                    :disabled="isBulkAddBtnDisabled">
                {{isBulkValidated?'Update Slaves':'Update Slaves'}}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCard>
    </VDialog>

    <VDialog v-model="isSuccessDialogVisible" max-width="500">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VBtn icon variant="outlined" color="success" class="my-4"
                style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
            <VIcon icon="tabler-check" size="38"/>
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
