<script setup>
import UpdateMT5PasswordDialog from "@/components/dialogs/client/client-mt5/UpdateMT5PasswordDialog.vue"
import SmallIconButton from "@/components/SmallIconButton.vue"
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()
const currentTab = ref(null)
const refVueApexChart = ref()
const isCreateAccountDialogVisible = ref(false)
const isUpdateMT5GroupDialogVisible = ref(false)
const isUpdateLeverageDialogVisible = ref(false)
const isUpdateInvestorDialogVisible = ref(false)
const isUpdateMasterDialogVisible = ref(false)
const isInvestorPasswordVisible = ref(false)
const isMasterPasswordVisible = ref(false)
const isMTdealsdialogVisible = ref(false)
const isDataLoading = ref(false)
const live_mt_list = ref(null)
const account_data = ref(null)
const selectedMT5Id = ref(null)
const isSnackbarVisible = ref(false)
const isConfirmDialogVisible = ref(false)
const snackBarText = ref('')
const typeInvestor = ref('investor')
const typeMaster = ref('master')
const isSuccessDialogVisible = ref(false)
const isConfirmLoading = ref(false)
let successTitle = ref('')
let successMessage = ref('')
const isCreditInDialogVisible = ref(false)
const isCreditOutDialogVisible = ref(false)
const isCreditRequestDialogVisible = ref(false)

const props = defineProps({
  mt5ListData: {
    type: Object,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },

})


watch(() => props.mt5ListData, (newVal) => {
  if (newVal) {
    live_mt_list.value = props.mt5ListData.filter(item => item.is_wallet !== 1)
  }
}, { immediate: true })

const fetchMT5Details = async (mt5_id) => {
  if (account_data) {
    account_data.value = null
  }
  isDataLoading.value = true
  const res = await $api(`live-account/mt-info/${mt5_id}`, {
    method: 'GET',
    onResponseError({ response }) {
      isDataLoading.value = false
    },
  })
  if (res) {
    account_data.value = res.result.mt_data
    isDataLoading.value = false
  }
}

watch(currentTab, () => {
  if (live_mt_list.value[currentTab.value]?.mt5_id) {
    selectedMT5Id.value = live_mt_list.value[currentTab.value]?.mt5_id
    fetchMT5Details(live_mt_list.value[currentTab.value]?.mt5_id)
  }
}, { immediate: true })

function handleOpenAccountClick() {
  isCreateAccountDialogVisible.value = true
}

function handleOpenGroupUpdate() {
  isUpdateMT5GroupDialogVisible.value = true
}

function handleOpenLeverageUpdate() {
  isUpdateLeverageDialogVisible.value = true
}

function handleOpenInvestorUpdate() {
  isUpdateInvestorDialogVisible.value = true
}

function handleOpenMasterUpdate() {
  isUpdateMasterDialogVisible.value = true
}

function handleviewDeals() {
  isMTdealsdialogVisible.value = true
}

const copyToClipBoard = (textToCopy) => {
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      snackBarText.value = 'Password Copied to Clipboard'
      isSnackbarVisible.value = true
    }).catch(err => {
      console.error('Failed to copy text: ', err)
    })
  } else {
    console.log('No text to copy')
  }
}

const series = [{
  data: [
    40,
    65,
    50,
    45,
    90,
    55,
    70,
  ],
}]

const moreList = [
  {
    title: 'View More',
    value: 'View More',
  },
  {
    title: 'Delete',
    value: 'Delete',
  },
]
const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isConfirmLoading.value = true
    try {
      const res = await $api('/live-account/resend-account-info', {
        method: 'POST',
        body: {
          mt5_id: selectedMT5Id.value,
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isConfirmDialogVisible.value = false
          isApproveBtnLoading.value = false
          isErrorDialogVisible.value = true
          isConfirmLoading.value = false
        },
      })
      if (res) {
        successTitle.value = 'Email Sent !'
        successMessage.value = 'Email has been sent to the client. They will receive it shortly !'
        isSuccessDialogVisible.value = true
        isConfirmDialogVisible.value = false
        isConfirmLoading.value = false
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.data.message
      isConfirmDialogVisible.value = false
      isApproveBtnLoading.value = false
      isErrorDialogVisible.value = true
      isConfirmLoading.value = false
    }

  }
}

function handleCreditIn() {
  isCreditInDialogVisible.value = true
}

function handleCreditOut() {
  isCreditOutDialogVisible.value = true

}

function handleRequestCredit() {
  isCreditRequestDialogVisible.value = true
}
</script>
<template>
  <VCard>
    <VCardTitle class="mb-0">
      <VCardText>
        LIVE MT5 ACCOUNTS
      </VCardText>
    </VCardTitle>


    <VCardText class="mt-0">
      <VSlideGroup v-model="currentTab" show-arrows mandatory class="mb-10 mt-0">
        <VSlideGroupItem v-for="(data, index) in live_mt_list" :key="data.mt5_id" v-slot="{ isSelected, toggle }"
                         :value="index"
        >
          <div style="block-size: 90px; inline-size: 90px;"
               :style="isSelected ? 'border-color:rgb(var(--v-theme-primary)) !important' : ''"
               :class="isSelected ? 'border' : 'border border-dashed'"
               class="d-flex flex-column justify-center align-center cursor-pointer rounded py-4 px-5 me-4"
               @click="toggle"
          >
            <VAvatar rounded size="45" :color="isSelected ? 'primary' : ''" variant="tonal" class="mb-1 ps-1 pe-1">
              <VImg src="/images/svg/mt5_lined.svg" size="22"/>
            </VAvatar>
            <h6 class="text-base font-weight-medium mb-0">
              {{ data.mt5_id }}
            </h6>
          </div>
        </VSlideGroupItem>

        <!-- 👉 slider more -->
        <a v-if="hasAccess('create_mt5_account')" @click="handleOpenAccountClick">
          <VSlideGroupItem>
            <div style="block-size: 90px; inline-size: 90px;"
                 class="d-flex flex-column justify-center align-center rounded border border-dashed py-4 px-5"
            >
              <VAvatar rounded size="70" variant="tonal">
                <VIcon size="22" icon="tabler-plus"/>
              </VAvatar>
            </div>
          </VSlideGroupItem>
        </a>

      </VSlideGroup>

      <VCard v-if="account_data" :key="currentTab">

        <VCardItem class="pb-sm-0">
          <VCardTitle>MT {{ live_mt_list[currentTab]?.mt5_id }}</VCardTitle>
          <VCardSubtitle>Account Details Overview</VCardSubtitle>

          <template #append>
            <div class="mt-n4 me-n2">
              <MoreBtn :menu-list="moreList"/>
            </div>
          </template>
        </VCardItem>

        <VCardText>
          <VRow>
            <VCol cols="12" sm="5" lg="5" class="d-flex flex-column align-self-center">
              <div class="d-flex align-center gap-2 mb-3 flex-wrap">
                <h4 class="text-h2">
                  {{ hasAccess('view_mt5_balance') ? formatCurrency(account_data?.balance) : '****' }}
                </h4>
                <VChip label size="small" color="success">
                  Balance
                </VChip>
              </div>
              <span class="text-sm text-medium-emphasis">Current balance in MT5 Account</span>
              <div v-if="hasAccess('view_deals')" class="d-flex justify-start flex-wrap mt-4">
                <VBtn
                  variant="outlined"
                  size="x-small"
                  rounded="md"
                  color="secondary"
                  @click="handleviewDeals"
                >
                  VIEW DEALS
                </VBtn>
              </div>
              <div v-if="hasAccess('process_credit_in')" class="d-flex justify-start flex-wrap mt-4">
                <VBtn
                  variant="outlined"
                  size="x-small"
                  rounded="md"
                  color="secondary"
                  @click="handleCreditIn"
                >
                  CREDIT IN
                </VBtn>
              </div>
              <div v-if="hasAccess('process_credit_out')&&account_data.credit"
                   class="d-flex justify-start flex-wrap mt-4"
              >
                <VBtn
                  variant="outlined"
                  size="x-small"
                  rounded="md"
                  color="secondary"
                  @click="handleCreditOut"
                >
                  CREDIT OUT
                </VBtn>
              </div>
              <div v-if="hasAccess('request_credit')" class="d-flex justify-start flex-wrap mt-4">
                <VBtn
                  variant="outlined"
                  size="x-small"
                  rounded="md"
                  color="secondary"
                  @click="handleRequestCredit"
                >
                  REQUEST CREDIT
                </VBtn>
              </div>

            </VCol>

            <VCol cols="12" sm="7" lg="7">

              <VList class="card-list">


                <VListItem>
                  <template #prepend>
                    <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                      <VIcon icon="tabler-bulb" size="22"/>
                    </VAvatar>
                  </template>
                  <VListItemTitle class="font-weight-medium me-4 text-overline">
                    MT GROUP NAME
                  </VListItemTitle>
                  <VListItemSubtitle class="me-4 text-caption">
                    Group in MT5 Server
                  </VListItemSubtitle>
                  <template #append>
                    <div class="d-flex align-center gap-x-2 mb-5">
                      <div class="text-body-1">
                        <VChip variant="outlined">
                          {{ hasAccess('view_mt5_group') ? live_mt_list[currentTab]?.mt_group_name : '*****' }}
                        </VChip>
                      </div>
                      <SmallIconButton v-if="hasAccess('update_mt5_group')" icon="tabler-edit" color="warning"
                                       variant="tonal" @click="handleOpenGroupUpdate"
                      />
                    </div>
                  </template>
                </VListItem>


                <VListItem>
                  <template #prepend>
                    <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                      <VIcon icon="tabler-cards" size="22"/>
                    </VAvatar>
                  </template>
                  <VListItemTitle class="font-weight-medium me-4 text-overline">
                    MT CATEGORY
                  </VListItemTitle>
                  <VListItemSubtitle class="me-4 text-caption">
                    Label Displayed to Client
                  </VListItemSubtitle>
                  <template #append>
                    <div class="d-flex align-center gap-x-2">
                      <div class="text-body-1">
                        <VChip variant="outlined">
                          {{ live_mt_list[currentTab]?.category_name }}
                        </VChip>
                      </div>
                      <button></button>
                    </div>
                  </template>
                </VListItem>


                <VListItem>
                  <template #prepend>
                    <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                      <VIcon icon="tabler-server" size="22"/>
                    </VAvatar>
                  </template>
                  <VListItemTitle class="font-weight-medium me-4 text-overline">
                    SERVER
                  </VListItemTitle>
                  <template #append>
                    <div class="d-flex align-center gap-x-2">
                      <div class="text-body-1">
                        <VChip variant="outlined">
                          {{ account_data?.server }}
                        </VChip>
                      </div>
                      <button></button>
                    </div>
                  </template>
                </VListItem>


                <VListItem>
                  <template #prepend>
                    <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                      <VIcon icon="tabler-droplet-dollar" size="22"/>
                    </VAvatar>
                  </template>
                  <VListItemTitle class="font-weight-medium me-4 text-overline">
                    LEVERAGE
                  </VListItemTitle>
                  <template #append>
                    <div class="d-flex align-center gap-x-2">
                      <div class="text-body-1">
                        <VChip v-if="hasAccess('view_mt5_leverage')" variant="outlined">
                          1 : {{ live_mt_list[currentTab]?.leverage }}
                        </VChip>
                        <VChip v-else variant="outlined">
                          * : ***
                        </VChip>
                      </div>
                      <SmallIconButton v-if="hasAccess('update_mt5_leverage')" icon="tabler-edit" color="warning"
                                       variant="tonal" @click="handleOpenLeverageUpdate"
                      />
                    </div>
                  </template>
                </VListItem>

                <VListItem
                  v-if="hasAccess('view_mt5_investor_pass') && live_mt_list[currentTab]?.investor_password !== 'no access'"
                >
                  <template #prepend>
                    <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                      <VIcon icon="tabler-password-user" size="22"/>
                    </VAvatar>
                  </template>
                  <VListItemTitle class="font-weight-medium me-4 text-overline">
                    INV. PASSWORD
                  </VListItemTitle>
                  <template #append>
                    <div class="d-flex align-center gap-x-2">
                      <div class="text-body-1">
                        <VChip variant="outlined">
                          {{ isInvestorPasswordVisible ? live_mt_list[currentTab]?.investor_password : '*********' }}
                        </VChip>
                      </div>
                      <SmallIconButton :icon="isInvestorPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                                       color="primary" variant="tonal"
                                       @click="isInvestorPasswordVisible = !isInvestorPasswordVisible"
                      />
                      <SmallIconButton v-if="isInvestorPasswordVisible" icon="tabler-copy" color="secondary"
                                       variant="tonal"
                                       @click="copyToClipBoard(live_mt_list[currentTab]?.investor_password)"
                      />
                      <SmallIconButton v-if="hasAccess('update_investor_password')" icon="tabler-edit" color="warning"
                                       variant="tonal" @click="handleOpenInvestorUpdate"
                      />
                    </div>
                  </template>
                </VListItem>


                <VListItem
                  v-if="hasAccess('view_mt5_master_pass') && live_mt_list[currentTab]?.master_password !== 'no access'"
                >
                  <template #prepend>
                    <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                      <VIcon icon="tabler-password-fingerprint" size="22"/>
                    </VAvatar>
                  </template>
                  <VListItemTitle class="font-weight-medium me-4 text-overline">
                    MASTER PASSWORD
                  </VListItemTitle>
                  <template #append>
                    <div class="d-flex align-center gap-x-2">
                      <div class="text-body-1">
                        <VChip variant="outlined">
                          {{ isMasterPasswordVisible ? live_mt_list[currentTab]?.master_password : '*********' }}
                        </VChip>
                      </div>
                      <SmallIconButton :icon="isMasterPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'" color="primary"
                                       variant="tonal" @click="isMasterPasswordVisible = !isMasterPasswordVisible"
                      />
                      <SmallIconButton v-if="isMasterPasswordVisible" icon="tabler-copy" color="secondary"
                                       variant="tonal"
                                       @click="copyToClipBoard(live_mt_list[currentTab]?.master_password)"
                      />
                      <SmallIconButton v-if="hasAccess('update_master_passsword')" icon="tabler-edit" color="warning"
                                       variant="tonal" @click="handleOpenMasterUpdate"
                      />
                    </div>
                  </template>
                </VListItem>

                <VListItem v-if="hasAccess('resend_mt5_credential_email')">
                  <template #prepend>
                    <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                      <VIcon icon="tabler-mail-fast" size="22"/>
                    </VAvatar>
                  </template>
                  <VListItemTitle class="font-weight-medium me-4 text-overline">
                    Resend MT5 INFO.
                  </VListItemTitle>
                  <VListItemSubtitle class="me-4 text-caption">
                    Label Displayed to Client
                  </VListItemSubtitle>
                  <template #append>
                    <div class="d-flex align-center gap-x-2">
                      <SmallIconButton icon="tabler-mail-star" color="secondary" variant="tonal"
                                       @click="isConfirmDialogVisible = true"
                      />
                    </div>
                  </template>
                </VListItem>

              </VList>
            </VCol>
          </VRow>

          <div class="border rounded mt-5 pa-5">
            <VRow>
              <!-- 👉 CREDIT -->
              <VCol cols="12" sm="4">
                <div class="d-flex align-center">
                  <VAvatar rounded size="26" color="primary" variant="tonal" class="me-2">
                    <VIcon size="18" icon="tabler-credit-card-pay"/>
                  </VAvatar>

                  <h6 class="text-base font-weight-regular">
                    Credit
                  </h6>
                </div>
                <h6 class="text-h4 my-2">
                  {{ hasAccess('view_mt5_credit') ? formatCurrency(account_data?.credit) : '***' }}
                </h6>

              </VCol>
              <!-- 👉 MARGIN _FREE -->
              <VCol cols="12" sm="4">
                <div class="d-flex align-center">
                  <VAvatar rounded size="26" color="secondary" variant="tonal" class="me-2">
                    <VIcon size="18" icon="tabler-free-rights"/>
                  </VAvatar>

                  <h6 class="text-base font-weight-regular">
                    Margin Free
                  </h6>
                </div>
                <h6 class="text-h4 my-2">
                  {{ hasAccess('view_mt5_fl_ml_and_others') ? formatCurrency(account_data?.margin_free) : '***' }}
                </h6>

              </VCol>
              <!-- 👉 MARGIN -->
              <VCol cols="12" sm="4">
                <div class="d-flex align-center">
                  <VAvatar rounded size="26" color="info" variant="tonal" class="me-2">
                    <VIcon size="18" icon="tabler-chart-arrows"/>
                  </VAvatar>

                  <h6 class="text-base font-weight-regular">
                    Margin
                  </h6>
                </div>
                <h6 class="text-h4 my-2">
                  {{ hasAccess('view_mt5_fl_ml_and_others') ? formatCurrency(account_data?.margin) : '***' }}
                </h6>

              </VCol>
              <!-- 👉 MARGIN_LEVEL -->
              <VCol cols="12" sm="4">
                <div class="d-flex align-center">
                  <VAvatar rounded size="26" color="success" variant="tonal" class="me-2">
                    <VIcon size="18" icon="tabler-activity"/>
                  </VAvatar>

                  <h6 class="text-base font-weight-regular">
                    Margin Level
                  </h6>
                </div>
                <h6 class="text-h4 my-2">
                  {{ hasAccess('view_mt5_fl_ml_and_others') ? account_data?.margin : '***' }}%
                </h6>

              </VCol>
              <!-- 👉 FLOATING -->
              <VCol cols="12" sm="4">
                <div class="d-flex align-center">
                  <VAvatar rounded size="26" color="error" variant="tonal" class="me-2">
                    <VIcon size="18" icon="tabler-arrows-shuffle-2"/>
                  </VAvatar>

                  <h6 class="text-base font-weight-regular">
                    Floating
                  </h6>
                </div>
                <h6 class="text-h4 my-2">
                  {{ formatCurrency(account_data?.floating) }}
                </h6>

              </VCol>
              <!-- 👉 EQUITY -->
              <VCol cols="12" sm="4">
                <div class="d-flex align-center">
                  <VAvatar rounded size="26" color="primary" variant="tonal" class="me-2">
                    <VIcon size="18" icon="tabler-background"/>
                  </VAvatar>

                  <h6 class="text-base font-weight-regular">
                    Equity
                  </h6>
                </div>
                <h6 class="text-h4 my-2">
                  {{ hasAccess('view_mt5_equity') ? formatCurrency(account_data?.equity) : '***' }}
                </h6>

              </VCol>

            </VRow>
          </div>
        </VCardText>

      </VCard>
      <VSkeletonLoader v-if="isDataLoading" v-for="i in 3" :key="i" type="article"/>
    </VCardText>
  </VCard>


  <ViewMTCardLDealsDialog v-model:isDrawerOpen="isMTdealsdialogVisible" :mt_id="selectedMT5Id" :clientId="clientId"/>
  <OpenMT5AccountDialog v-model:isDialogVisible="isCreateAccountDialogVisible" :clientId="clientId"/>

  <UpdateMT5GroupDialog v-if="account_data" v-model:isDialogVisible="isUpdateMT5GroupDialogVisible"
                        :mt_id="selectedMT5Id" :clientId="clientId"
  />

  <UpdateLeverageDialog v-if="account_data" v-model:isDialogVisible="isUpdateLeverageDialogVisible"
                        :mt_id="selectedMT5Id" :clientId="clientId"
  />

  <UpdateMT5PasswordDialog v-if="account_data" v-model:isDialogVisible="isUpdateInvestorDialogVisible"
                           :mt_id="selectedMT5Id" :clientId="clientId" :pass_type="typeInvestor"
  />

  <UpdateMT5PasswordDialog v-if="account_data" v-model:isDialogVisible="isUpdateMasterDialogVisible"
                           :mt_id="selectedMT5Id" :clientId="clientId" :pass_type="typeMaster"
  />

  <CreditInDialog v-if="account_data" v-model:isDialogVisible="isCreditInDialogVisible" :mt_id="selectedMT5Id"
                  :clientId="clientId"
  />

  <CreditOutDialog v-if="account_data" v-model:isDialogVisible="isCreditOutDialogVisible" :mt_id="selectedMT5Id"
                   :clientId="clientId" :account_data="account_data"

  />

  <CreditRequestDialog v-if="account_data" v-model:isDialogVisible="isCreditRequestDialogVisible" :mt_id="selectedMT5Id"
                       :clientId="clientId"
  />

  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 :is-confirm-loading="isConfirmLoading"
                 confirmation-question="Are you sure you want to resend MT5 details?"
                 cancel-title="Cancelled" confirm-title="Cancelled!"
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
        <VBtn color="success" @click="isSuccessDialogVisible = false">
          OK
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>


  <VSnackbar v-model="isSnackbarVisible" :timeout="2000">
    {{ snackBarText }}
  </VSnackbar>

</template>
