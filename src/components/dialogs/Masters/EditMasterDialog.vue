<script setup>
import { ref } from "vue";


const searchQuery = ref('')
const mt5UserList = ref('')
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
const FMBalance = ref(0.00)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const isBtnLoading = ref(false)
const mtAccountId = ref(null)
const lotsize = ref(null)
const description = ref(null)
const masterid = ref(null)
const commission = ref(null)
const status = ref(false)
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  masterDetails: {
    type: Object,
    required: false,
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

watch(
  () => props.masterDetails,
  (newValue) => {
    if (newValue) {
      masterid.value = newValue.id || ''
      copiername.value = newValue.mc_name || ''
      searchQuery.value = newValue.mc_mt5_id || ''
      identicalConfig.value = newValue.is_config_identical === 1
      riskApproach.value = newValue.risk_approach || ''
      multiplier.value = newValue.multiplier || null
      lotsize.value = newValue.lot_size
      FMBalance.value = newValue.fixed_balance || null
      stopLoss.value = newValue.copy_sl === 1
      takeProfit.value = newValue.copy_tp === 1
      reverseTrade.value = newValue.is_reverse === 1
      description.value = newValue.description || ''
      commission.value = newValue.commission_percentage || null
      status.value = newValue.status === 1
    }
  },
  { immediate: true },
)

const decimalValidator = (value) => {
  return /^(\d+|\d*\.\d{1,2})$/.test(value.toString()) || 'Must be a number with up to 2 decimal places'
}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isBtnLoading.value = true

    try {
      const res = await $api('masters/update', {
        method: 'POST',
        body: {
          id: masterid.value,
          mc_mt5_id: searchQuery.value,
          performance_matrix: 0.00,
          risk_factor: 0.00,
          is_config_identical: identicalConfig.value,
          risk_approach: riskApproach.value,
          lot_size: lotsize.value,
          multiplier: multiplier.value,
          fixed_balance: FMBalance.value,
          copy_sl: stopLoss.value,
          copy_tp: takeProfit.value,
          is_reverse: reverseTrade.value,
          description: description.value,
          commission_percentage: commission.value,
          status: status.value,
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
        successMessage.value = 'Master Updated Successfully !'
        isBtnLoading.value = false
        isSuccessDialogVisible.value = true
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = 'Something Went Wrong !'
      isBtnLoading.value = false
      isErrorDialogVisible.value = true
    }

  }
}
const handlePageReload = async (confirmed) => {
  window.location.reload()
}


</script>
<template>
  <section>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 650" :model-value="props.isDialogVisible"
      @update:model-value="dialogModelValueUpdate">

      <!-- Dialog close btn -->
      <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
      <VCard>
        <div class="sticky-card">
          <VCardTitle class="pt-3 ">Edit Master Accounts</VCardTitle>
          <VDivider />
        </div>
        <VForm @submit.prevent="() => { }">
          <VRow>
            <VTable fixed-header class="text-no-wrap mt-6 mb-6 ml-4">
              <tr>
                <td>
                  <VListItem>
                    <VListItemTitle class="font-weight-medium me-4 text-overline">
                      <VAvatar color="secondary" size="30" variant="tonal" rounded icon="tabler-server" class="mr-1" />
                      <span class="text-body">Server Name :</span>
                    </VListItemTitle>
                    <template #append>
                      <div class="d-flex align-center">
                        <div class="text-body-1">
                          {{ masterDetails.server.server_name }}
                        </div>
                      </div>
                    </template>
                  </VListItem>
                </td>
                <td>
                  <VListItem>
                    <VListItemTitle class="font-weight-medium me-4 text-overline">
                      <VAvatar color="secondary" size="30" variant="tonal" rounded icon="tabler-cpu-2" class="mr-1" />
                      Server IP :
                    </VListItemTitle>
                    <template #append>
                      <div class="d-flex align-center gap-x-2">
                        <div class="text-body-1">
                          {{ masterDetails.server.server_ip }}
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
                          {{ masterDetails.server.company_name }}
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
                      Server Type :
                    </VListItemTitle>
                    <template #append>
                      <div class="d-flex align-center gap-x-2">
                        <div class="text-body-1">
                          {{ masterDetails.server.server_type }}
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
                <AppTextField label="MT5 ID" v-model="searchQuery" placeholder="Search MT5 ID" disabled />
              </div>
            </VCol>

            <VCol cols="6">
              <div class="">
                <AppTextField label="Copier Name" v-model="copiername" />
              </div>
            </VCol>
            <VCol cols="6">
              <AppTextField label="Commission" v-model="commission" suffix="%" />
            </VCol>
            <VCol cols="6">
              <div class="mt-4">
                <VSwitch v-model="identicalConfig" label="Set Identical Configuration for all slaves" />
              </div>
            </VCol>
            <!-- <VCol cols="6">
                <div class="mr-2">
                    <AppTextarea label="Description" v-model="description"/>
                </div>
            </VCol> -->
            <VCol cols="6" v-if="identicalConfig">
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
          <!-- <VRow  class="ml-2"> -->
          <VCardTitle v-if="identicalConfig" class="mt-1">Advanced Settings</VCardTitle>
          <!-- </VRow> -->
          <VRow v-if="identicalConfig" class="ml-2">
            <VCol cols="4">
              <div class="mt-1">
                <VSwitch v-model="stopLoss" label="Copy Stop Loss" />
              </div>
            </VCol>
            <VCol cols="4">
              <div class="mt-1">
                <VSwitch v-model="takeProfit" label="Copy Take Profit" />
              </div>
            </VCol>
            <VCol cols="4">
              <div class="mt-1">
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
              <VBtn class="me-2" color="primary" :disabled="!copiername" @click="isConfirmDialogVisible = true"
                :loading="isBtnLoading">
                Submit
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
      confirmation-question="Are you want to update master?" cancel-title="Cancelled" confirm-title="Confirm" />

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
</style>
