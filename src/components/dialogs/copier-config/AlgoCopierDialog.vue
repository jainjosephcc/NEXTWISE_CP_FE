<script setup>
import { ref, computed } from "vue"


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

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
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


watch([searchQuery], () => {
  fetchUsers()
  if (mt5UserList.value.length === 1) {
    clientId.value = mt5UserList.value[0].client_id
    mtAccountId.value = mt5UserList.value[0].mt5_id
  } else {
    clientId.value = null
  }
}, { deep: true, immediate: false })

// const suffix = computed(() => {
//   switch (riskApproach.value) {
//     case 'FIXL':
//       return '';
//     case 'LMUL':
//         return '%';
//     case 'BMUL':
//       return '%';
//     default:
//       return '%';
//   }
// });

const decimalValidator = (value) => {
  return /^(\d+|\d*\.\d{1,2})$/.test(value.toString()) || 'Must be a number with up to 2 decimal places'
}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isBtnLoading.value = true
    try {
      const res = await $api('/copier-masters', {
        method: 'POST',
        body: {
          mc_name: copiername.value,
          mc_mt5_id: mtAccountId.value,
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
          status: true,
          is_live: true,
          client_id: clientId.value,
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
        successMessage.value = 'Master Copier Created Successfully !'
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


</script>
<template>
  <section>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 650" :model-value="props.isDialogVisible"
             @update:model-value="dialogModelValueUpdate"
    >

      <!-- Dialog close btn -->
      <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>
      <VCard>
        <div class="sticky-card">
          <VCardTitle class="pt-3 ">Add Master Copier Account</VCardTitle>
          <VDivider/>
        </div>
        <VForm @submit.prevent="() => {}">
          <VRow class="mt-2 ml-2">
            <VCol cols="6">
              <div>
                <AppTextField label="Search by Name/Email/MT5 ID" v-model="searchQuery" placeholder="Search MT5 ID"/>
              </div>
            </VCol>
            <VCol cols="6" class="mt-2">
              <div v-if="mt5UserList.length===1">
                <VRow class="d-flex justify-space-between align-center flex-wrap">
                  <VCol class="d-flex align-center">
                    <CustomClientCardChip class="mx-3 my-2"
                                          :client_name="mt5UserList[0].client_name"
                                          :client_id="mt5UserList[0].client_id"
                                          :email="mt5UserList[0].email"
                                          :client_pic="mt5UserList[0].client_pic"
                    />
                  </VCol>
                  <VCol class="d-flex align-center flex-column" cols="auto">
                    <CustomMT5Chip class="mb-2" :client_id="mt5UserList[0].client_id"
                                   :mt_id="mt5UserList[0].mt5_id" :is_wallet="0"
                    />
                  </VCol>
                </VRow>
              </div>
            </VCol>
            <VCol cols="6">
              <div>
                <AppTextField label="Copier Name" v-model="copiername"/>
              </div>
            </VCol>
            <VCol cols="6">
              <div class="mt-4 mr-2">
                <VSwitch
                  v-model="identicalConfig"
                  label="Set Identical Configuration for all slaves"
                />
              </div>
            </VCol>
            <VCol cols="6" v-if="identicalConfig">
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

            <VCol cols="5" v-if="riskApproach === 'FIXL'" class="mr-1">
              <AppTextField
                label="Lot Size"
                v-model="lotsize"
                type="number"
                min="0"
                :rules="[requiredValidator, decimalValidator]"
              />
            </VCol>
            <VCol cols="5"
                  v-if="riskApproach === 'LMUL' || riskApproach === 'BMUL'|| riskApproach === 'EMUL' || riskApproach === 'FBMUL'"
                  class="mr-1"
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
            <VCol cols="6" v-if="riskApproach === 'FBMUL'">
              <AppTextField
                label="Fixed Master Balance"
                v-model="FMBalance"
                type="number"
                min="0"
                :rules="[requiredValidator, decimalValidator]"
              />
            </VCol>
          </VRow>
          <VRow v-if="identicalConfig" class="ml-2">
            <VCardTitle>Advanced Settings</VCardTitle>
          </VRow>
          <VRow v-if="identicalConfig" class="ml-2">
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


          <VRow class="ml-2 mt-2 mb-2">
            <VCol cols="6">
              <VBtn class="me-2" color="primary" :disabled="!copiername || clientId === null"
                    @click="isConfirmDialogVisible = true" :loading="isBtnLoading"
              >
                Submit
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                   confirmation-question="Are you want to add copier?" cancel-title="Cancelled"
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
