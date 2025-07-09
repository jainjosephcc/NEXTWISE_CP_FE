<script setup>
import { ref, computed } from "vue"

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
const multiplier = ref(0.00)
const stopLoss = ref(false)
const takeProfit = ref(false)
const reverseTrade = ref(false)
const FMBalance = ref(0.00)
const lotsize = ref(null)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const isBtnLoading = ref(false)
const masterId = ref(null)


const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  slaveDetails: {
    type: Object,
    required: true,
  },
})
const closeDialog = () => {
  emit('update:isDialogVisible', false)
}

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val)
}

watch([searchQuery], () => {
  fetchUsers()
  if (mt5UserList.value.length === 1) {
    clientId.value = mt5UserList.value[0].client_id
    mtAccountId.value = mt5UserList.value[0].mt5_id
  } else {
    clientId.value = null
  }
}, { deep: true, immediate: false })

const fetchUsers = async () => {
//   mt5UserList.value = null
  const res = await $api('/client/sorted-mt5-list', {
    method: 'POST',
    body: {
      keyword: searchQuery.value,
      page: '',
      RM: '',
      category_id: '',
      group_id: '',
      deposit_status: '',
      joined_from: '',
      joined_to: '',
    },
    onResponseError({ response }) {
      console.log(response)
      // errors.value = response._data.message
    },
  })
  mt5UserList.value = res.result.mt5List.data
  if (mt5UserList.value.length === 1) {
    clientId.value = mt5UserList.value[0].client_id
    mtAccountId.value = mt5UserList.value[0].mt5_id
  }
}

const suffix = computed(() => {
  switch (riskApproach.value) {
  case 'FIXL':
    return ''
  case 'LMUL':
    return '%'
  case 'BMUL':
    return '%'
  default:
    return '%'
  }
})

const decimalValidator = (value) => {
  return /^(\d+|\d*\.\d{1,2})$/.test(value.toString()) || 'Must be a number with up to 2 decimal places'
}

watch(() => props.slaveDetails, (newVal) => {
  if (newVal) {
    masterId.value = props.slaveDetails.id
    identicalConfig.value = props.slaveDetails.is_config_identical === 1
    riskApproach.value = props.slaveDetails.risk_approach
    multiplier.value = props.slaveDetails.multiplier ?? '0.00'
    lotsize.value = props.slaveDetails.lot_size
    stopLoss.value = props.slaveDetails.copy_sl === 1
    takeProfit.value = props.slaveDetails.copy_tp === 1
    reverseTrade.value = props.slaveDetails.is_reverse === 1
    FMBalance.value = props.slaveDetails?.fixed_balance ?? '0.00'

    //fetchStatistics();
  }
}, { immediate: true })

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isBtnLoading.value = true
    try {
      const res = await $api('/copier-slaves', {
        method: 'POST',
        body: {

          master_id: masterId.value,
          sl_mt5_id: mtAccountId.value,
          client_id: clientId.value,
          is_config_identical: identicalConfig.value,
          risk_approach: riskApproach.value,
          lot_size: lotsize.value,
          multiplier: multiplier.value,
          fixed_balance: FMBalance.value,
          copy_sl: stopLoss.value,
          copy_tp: takeProfit.value,
          is_reverse: reverseTrade.value,
          status: true,
          is_live: true,

        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Slave Mapped Successfully !'
        isBtnLoading.value = false
        isSuccessDialogVisible.value = true
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.data.message
      isBtnLoading.value = false
      isErrorDialogVisible.value = true
    }

  }
}
const handlePageReload = async (confirmed) => {
  window.location.reload()
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

</script>
<template>
  <section>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 650" :model-value="props.isDialogVisible"
             @update:model-value="dialogModelValueUpdate"
    >

      <!-- Dialog close btn -->
      <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>
      <VCard class="">
        <div class="sticky-card">
          <VCardTitle class="pt-3">Add Slave Copier Account</VCardTitle>
          <VDivider/>
        </div>
        <VForm class="ml-3" @submit.prevent="() => {}">
          <VRow>
            <VCol cols="12">
              <VCardTitle>Master Details</VCardTitle>
            </VCol>
            <VCol cols="12" class="ml-2">
              <!-- <VCard class="mb-2"> -->
              <h4 class="ml-4 my-1">
                {{ slaveDetails.mc_name }}
              </h4>
              <VRow class="d-flex justify-space-between align-center flex-wrap">
                <VCol class="d-flex align-center">
                  <CustomClientCardChip
                    class="mx-3 my-2"
                    :client_name="slaveDetails.client.client_name"
                    :client_id="slaveDetails.client.id"
                    :email="slaveDetails.client.email"
                    :client_pic="slaveDetails.client_pic"
                  />
                </VCol>

                <VCol class="d-flex align-center flex-column pb-6 mr-6" cols="auto">
                  <CustomMT5Chip
                    class="mb-2 mr-2"
                    :client_id="slaveDetails.client.id"
                    :mt_id="slaveDetails.mc_mt5_id?.toString()"
                    :is_wallet="0"

                  />

                  <div class="">
                    Master Copier

                  </div>
                </VCol>
              </VRow>
              <!-- </VCard> -->
            </VCol>
          </VRow>
          <VDivider class="mb-2"/>
          <VRow class="ml-2">
            <VCol cols="6">
              <div>
                <AppTextField label="Search by Slave Name/Email/MT5 ID" v-model="searchQuery"
                              placeholder="Search MT5 ID"
                />
              </div>
            </VCol>
            <VCol cols="6">
              <div v-if="mt5UserList.length===1" class="mt-3">
                <VRow class="d-flex justify-space-between align-center flex-wrap">
                  <VCol class="d-flex align-center">
                    <CustomClientCardChip class="mx-3 my-2"
                                          :client_name="mt5UserList[0].client_name"
                                          :client_id="mt5UserList[0].client_id"
                                          :email="mt5UserList[0].email"
                                          :client_pic="mt5UserList[0].client_pic"
                    />
                  </VCol>
                  <VCol class="d-flex align-center flex-column mr-4" cols="auto">
                    <CustomMT5Chip class="mb-2" :client_id="mt5UserList[0].client_id"
                                   :mt_id="mt5UserList[0].mt5_id" :is_wallet="0"
                    />
                  </VCol>
                </VRow>
              </div>
            </VCol>
          </VRow>

          <VRow>
            <VCol cols="6" class="ml-3">
              <AppSelect
                v-model="riskApproach"
                :items="riskApproachList"
                item-title="text"
                item-value="value"
                label="Risk Approach"
                single-line
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="4" v-if="riskApproach === 'FIXL'" class="">
              <AppTextField
                label="Lot Size"
                v-model="lotsize"
                type="number"
                min="0"
                :rules="[requiredValidator, decimalValidator]"
              />
            </VCol>
            <VCol cols="4"
                  v-if="riskApproach === 'LMUL' || riskApproach === 'BMUL'|| riskApproach === 'EMUL' || riskApproach === 'FBMUL'"
                  class=""
            >
              <AppTextField
                label="Multiplier"
                v-model="multiplier"
                type="number"
                min="0"
                suffix="%"
                :rules="[requiredValidator, decimalValidator]"
              />
            </VCol>
            <VCol cols="6" v-if="riskApproach === 'FBMUL'" class="ml-3">
              <AppTextField
                label="Fixed Master Balance"
                v-model="FMBalance"
                type="number"
                min="0"
                :rules="[requiredValidator, decimalValidator]"
              />
            </VCol>
          </VRow>
          <VRow class="ml-3">
            <VCardTitle>Advanced Settings</VCardTitle>
          </VRow>
          <VRow class="ml-2">
            <VCol cols="4">
              <div class="mt-4">
                <VSwitch
                  v-model="stopLoss"
                  label="Copy Stop Loss"
                />
              </div>
            </VCol>
            <VCol cols="4">
              <div class="mt-4">
                <VSwitch
                  v-model="takeProfit"
                  label="Copy Take Profit"
                />
              </div>
            </VCol>
            <VCol cols="4">
              <div class="mt-4">
                <VSwitch
                  v-model="reverseTrade"
                  label="Reverse Trade"
                />
              </div>
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <VBtn class="me-2" color="primary" :disabled="clientId===null" @click="isConfirmDialogVisible = true">
                Submit
              </VBtn>
            </VCol>
          </VRow>

        </VForm>

      </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                   confirmation-question="Are you want to map slave account?" cancel-title="Cancelled"
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
  </section>
</template>
<style scoped>
.sticky-card {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
}
</style>
