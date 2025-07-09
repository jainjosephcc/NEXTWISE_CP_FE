<script setup>
import AssignManagerDialog from "@/components/dialogs/client/profile/AssignManagerDialog.vue"
import SmallIconButton from "@/components/SmallIconButton.vue"
import { computed, ref, watch } from 'vue'
import { useRouter } from "vue-router"

const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
  clientDocs: {
    type: Object,
    required: true,
  },
  managerHistory: {
    type: Object,
    required: true,
  },
  walletStatus: {
    type: Boolean,
    required: true,
  },
  mt5ListData: {
    type: Object,

  },
})


const isUserInfoEditDialogVisible = ref(false)
const isUpgradePlanDialogVisible = ref(false)
const isClientDocViewDialogVisible = ref(false)
const isClientUploadDialogVisible = ref(false)
const isRMManagerDialogVisible = ref(false)
const isAssignManagerDialogVisible = ref(false)
const isReAssignManagerDialogVisible = ref(false)
const isIBRequstDialogVisible = ref(false)
const isMoveIBDialogVisible = ref(false)
const isDetachIBDialogVisible = ref(false)


const total_deposit = ref(null)
const total_withdraw = ref(null)

const isSnackbarVisible = ref(false)
const snackBarText = ref('')
const isUpdateCategoryLabelDialog = ref(false)
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const walletId = ref(null)
const wallletBalance = ref(null)
/* // Function to show the Upload Document modal
function showUploadDocumnetModal() {
  const isClientUploadDialogVisible = ref(true);
} */

const status = computed(() => {
  switch (props.userData.doc_verified) {
  case 0:
    return { text: 'Upload Pending', color: 'warning' }
  case 1:
    return { text: 'Verif. Pending', color: 'warning' }
  case 2:
    return { text: 'Rejected', color: 'error' }
  case 3:
    return { text: 'Approved', color: 'success' }
  default:
    return { text: 'Unknown Status', color: 'grey' }
  }
})


watch(() => props.userData, (newVal) => {
  if (newVal) {
    fetchStatistics()
  }
}, { immediate: true })

const copyEmail = (textToCopy) => {
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      snackBarText.value = 'Email Copied to Clipboard'
      isSnackbarVisible.value = true
    }).catch(err => {
      console.error('Failed to copy text: ', err)
    })
  } else {
    console.log('No text to copy')
  }
}


async function fetchStatistics() {
  try {
    const res = await $api(`client/data-header/${props.userData.id}`, {
      method: 'GET',
      onResponseError({ response }) {
      },
    })
    total_deposit.value = res.result.total_deposit
    total_withdraw.value = res.result.total_withdraw

  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    // Handle error, maybe set default or error text

  }
}

const getClientPicUrl = computed(() => {
  const clientPic = props.userData.profile_pic
  const clientId = props.userData.id
  const baseUrl = import.meta.env.VITE_S3_BASE_URL
  return clientPic ? `${baseUrl}/client/profileImage/${clientId}/${clientPic}` : null
})

function handleCategoryLabel() {
  isUpdateCategoryLabelDialog.value = true

}

function handleWalletActivation() {
  isConfirmDialogVisible.value = true
}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    try {
      const res = await $api('/activate-client-wallet', {
        method: 'POST',
        body: {
          clientId: props.userData.id,
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isErrorDialogVisible.value = true
          isConfirmDialogVisible.value = false
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Wallet Activated Successfully !'
        isSuccessDialogVisible.value = true
        isConfirmDialogVisible.value = false
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.response ? Ex.response.data.message : Ex.message
      isErrorDialogVisible.value = true
      isConfirmDialogVisible.value = false
    }
  }
}
const handlePageReload = () => {
  window.location.reload()
}

const handleWalletBalance = async () => {
  const selectedItem = props.mt5ListData.find(item => item.is_wallet === 1)
  walletId.value = selectedItem.mt5_id
  const res = await $api(`/getClientMTAccountSummery/${walletId.value}`, {
    method: 'GET',
    onResponseError({ response }) {
      //console.log(response);
      // errors.value = response._data.message
    },
  })
  if (res) {
    wallletBalance.value = res.mt_accounts.balance

  }

}

const router = useRouter()
const handleViewProfileClick = (id) => {
  if (hasAccess('view_client_profile')) {
    // Force a full page reload by setting the window location
    window.location.href = `/client/client-${id}-home-null-details`
  }
}

</script>

<template>
  <VRow>
    <!-- SECTION User Details -->
    <VCol cols="12">


      <VCard v-if="props.userData">
        <VRow>
          <VCol cols="6 text-right pr-4">
            <VBadge
              dot
              bordered
              color="success"
              location="bottom end"
              :offset-x="5"
              :offset-y="1"
            >
              <VAvatar rounded :size="90" color="primary" variant="tonal" class="mt-8">
                <VImg v-if="props.userData.profile_pic" :src="getClientPicUrl"/>
                <VImg v-else src="/images/avatars/avatar-0.webp"/>
              </VAvatar>
            </VBadge>

            <h5 class="text-h5 mt-2 ms-3">
              {{ props.userData.full_name }}
            </h5>
            <!-- 👉 Role chip -->
            <VChip label size="small" class="text-capitalize mt-2">
              #{{ props.userData.id }}
            </VChip>
          </VCol>
          <VCol cols="6" class="mt-8 ps-4">
            <VRow>
              <!-- Deposit Column -->
              <VCol cols="12" md="12">
                <div class="d-flex align-center gap-2 mt-0 mb-0">
                  <VAvatar color="primary" variant="tonal" rounded size="30">
                    <VIcon icon="tabler-home-stats" size="20"/>
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 v-if="total_deposit !== null" class="text-h6 mb-0">
                      <span v-if="hasAccess('view_client_total_deposit')">
                        {{ formatCurrency(total_deposit) }}
                      </span>
                      <span v-else>*****</span>
                    </h6>
                    <div class="text-xs">
                      Deposit
                    </div>
                  </div>
                </div>
              </VCol>

              <!-- Withdraw Column -->
              <VCol cols="12" md="12">
                <div class="d-flex align-center gap-2 mt-0 mb-0">
                  <VAvatar color="info" variant="tonal" rounded size="30">
                    <VIcon icon="tabler-report-money" size="20"/>
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 v-if="total_withdraw !== null" class="text-h6 mb-0">
                      <span v-if="hasAccess('view_client_total_withdraw')">
                        {{ formatCurrency(total_withdraw) }}
                      </span>
                      <span v-else>*****</span>
                    </h6>
                    <div class="text-xs">
                      Withdraw
                    </div>
                  </div>
                </div>
              </VCol>

              <!-- Wallet Column -->
              <VCol cols="12" md="12">
                <div class="d-flex align-center gap-2 mt-0 mb-0">
                  <VAvatar color="secondary" variant="tonal" rounded size="30">
                    <VIcon icon="tabler-wallet" size="20"/>
                  </VAvatar>
                  <div v-if="props.walletStatus" class="text-xs d-flex align-center justify-space-between">
                    <div>
                      <div v-if="hasAccess('view_client_wallet_balance')" class="d-flex flex-column">
                        <h6 v-if="wallletBalance !== null" class="text-h6 mb-0">
                          {{ formatCurrency(wallletBalance) }}
                        </h6>
                      </div>
                      <div v-else class="d-flex flex-column">
                        <h6 class="text-h6 mb-0">
                          ****
                        </h6>
                      </div>

                      <div>
                        Wallet Active
                      </div>
                    </div>

                    <div class="ms-12" v-if="hasAccess('view_client_wallet_balance')">
                      <SmallIconButton icon="tabler-refresh" size="25" class="" color="primary" variant="tonal"
                                       @click="handleWalletBalance"
                      />
                      <VTooltip activator="parent" location="top">
                        Fetch Wallet Balance
                      </VTooltip>
                    </div>
                  </div>
                  <!-- </div> -->

                  <div v-else class="text-xs">
                    No Wallet
                    <VBtn
                      v-if="hasAccess('create_wallet_for_client')"
                      variant="outlined"
                      size="x-small"
                      rounded="md"
                      color="secondary"
                      @click="handleWalletActivation"
                    >
                      ACTIVATE
                    </VBtn>
                  </div>
                </div>

              </VCol>
            </VRow>


          </VCol>
        </VRow>

        <VCardText>

          <VDivider class="my-3"/>

          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-clock-hour-2" size="24" class="me-1"/>
                    <p class="font-weight-medium me-2 text-overline mt-1">LAST ACTIVE</p>
                  </div>
                  <div class="d-flex">
                    <VChip v-if="checkUserOnline(props.userData.last_active_at)" color="success" size="x-small"
                    >Online</VChip>
                    <p v-else class="font-weight-medium me-2 text-overline mt-1"
                    >{{ formatDateToFullFormat(props.userData.last_active_at) }}</p>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-map-pin" size="24" class="me-1"/>
                    <p class="font-weight-medium me-2 text-overline mt-1">ACCESSED FROM</p>
                  </div>
                  <div class="d-flex">
                    <p class="font-weight-medium me-2 text-overline mt-1"
                    >{{
                        (props.userData.access_location && props.userData.access_ip) ? props.userData.access_location.city + ' | ' + props.userData.access_location.region + ' | ' + props.userData.access_location.country : 'NOT AVAILABLE'
                      }}</p>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>


          <!-- CONTACT SECTION -->
          <span class="d-flex align-center justify-space-between">
            <p class="text-sm text-disabled mt-1">
              CONTACT
            </p>
            <div class="d-flex">

            </div>
          </span>


          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-mail" size="24" class="me-1"/>
                    <div v-if="hasAccess('view_client_email')">{{ props.userData.email }}</div>
                    <div v-else>*******************</div>
                  </div>
                  <div class="d-flex">
                    <SmallIconButton :disabled="!hasAccess('view_client_email')" icon="tabler-clipboard-copy"
                                     color="primary" variant="tonal" @click="copyEmail(props.userData.email)"
                                     class="me-2"
                    />
                    <VIcon v-if="props.userData.email_verified === 1" icon="tabler-discount-check-filled" size="30"
                           color="primary"
                    />
                    <VIcon v-if="props.userData.email_verified === 0" icon="tabler-alert-triangle-filled" size="30"
                           color="warning"
                    />
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>


          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-device-landline-phone" size="24" class="me-1"/>
                    <div v-if="hasAccess('view_client_phone')">{{ props.userData.phone }}</div>
                    <div v-else>**********</div>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>


          <VDivider class="my-5"/>


          <!-- ABOUT SECTION -->
          <p class="text-sm text-disabled">
            ABOUT
          </p>

          <!-- 👉 User ID -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center">
                  <VIcon icon="tabler-face-id" size="24" class="me-2"/>
                  <div class="d-flex gap-x-2 align-center">
                    <div class="text-md text-disabled text-overline">Client ID : </div>
                    <h6 class="text-h6">#{{ props.userData.id }} </h6>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 NAME -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-user-square-rounded" size="24" class="me-2"/>
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled text-overline">Client Name : </div>
                      <h6 class="text-h6">{{ props.userData.full_name }} </h6>
                    </div>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Country -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-map-pin" size="24" class="me-2"/>
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled text-overline">Country : </div>
                      <h6 class="text-h6">{{ props.userData.country_name }} </h6>
                    </div>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>


          <!-- 👉 Document View -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-clipboard-data" size="24" class="me-2"/>
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled text-overline">Doc. Status : </div>
                      <VChip :size="'x-small'" :color="status.color">{{ status.text }}</VChip>
                    </div>
                  </div>
                  <div class="d-flex">
                    <SmallIconButton v-if="props.userData.doc_verified !== 0 && hasAccess('view_client_docs')"
                                     icon="tabler-eye" color="primary" variant="tonal"
                                     @click="isClientDocViewDialogVisible = !isClientDocViewDialogVisible" class="me-2"
                    />
                    <SmallIconButton v-if="props.userData.doc_verified === 0 && hasAccess('update_client_document')"
                                     icon="tabler-cloud-upload" color="warning" variant="tonal"
                                     @click="isClientUploadDialogVisible = true"
                    />
                  </div>

                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <VDivider class="my-5"/>

          <p class="text-sm text-disabled mt-5">
            PLATFORM
          </p>


          <!-- 👉 Mapped CATEGORY LABEL -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                     <VIcon icon="tabler-medical-cross" size="24" class="me-2"/>
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled text-overline">CATEGORY LABEL : </div>
                      <h6 v-if="hasAccess('view_client_category_label')" class="text-h6"
                      >{{ props.userData.cat_label === 0 ? 'Regular' : 'Premium' }} </h6>
                      <h6 v-else class="text-h6">********</h6>
                    </div>
                  </div>
                  <div class="d-flex">
                    <SmallIconButton v-if="hasAccess('update_client_category_label')"
                                     icon="tabler-mood-edit" color="secondary" variant="tonal"
                                     class="me-2" @click="handleCategoryLabel"
                    />
                  </div>

                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Mapped Entity -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center">
                  <VIcon icon="tabler-tag" size="24" class="me-2"/>
                  <div class="d-flex gap-x-2 align-center">
                    <div class="text-md text-disabled text-overline">Entity : </div>
                    <h6 class="text-h6">{{ props.userData.entity_name }} </h6>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>


          <!-- 👉 Joined On -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center">
                  <VIcon icon="tabler-calendar-due" size="24" class="me-2"/>
                  <div class="d-flex gap-x-2 align-center">
                    <div class="text-md text-disabled text-overline">Joined On : </div>
                    <h6 class="text-h6">{{ formatDateToMonthShort(props.userData.joined_on) }} </h6>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>


          <!-- 👉 Entity Name -->


          <VDivider class="my-5"/>
          <div class="d-flex align-center justify-space-between mb-5">
            <div class="text-sm text-disabled"> RELATIONSHIP MANAGER</div>


            <VBtn v-if="props.managerHistory.length > 0" color="primary" size="small" variant="tonal"
                  class="px-2 rounded" @click="isRMManagerDialogVisible = true"
            >
              RM HISTORY
            </VBtn>


          </div>


          <!-- 👉 IF MANAGER NOT ASSIGNED -->
          <VList v-if="!props.userData.rm_id" class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <span class="d-flex">
                    <VIcon icon="tabler-user-question" size="24" class="me-2"/>
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled">Manager Not Assigned</div>
                    </div>
                  </span>
                  <div class="d-flex">
                    <SmallIconButton icon="tabler-user-edit" color="secondary" variant="tonal"
                                     @click="isAssignManagerDialogVisible = true"
                    />
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>
          <!-- 👉 IF MANAGER ASSIGNED -->
          <VList v-else class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <span v-if="props.userData.rm_name!=null&&props.userData.rm_id!=null" class="d-flex">
                    <CustomStaffCardChip v-if="hasAccess('view_rm')" :rm_id="props.userData.rm_id"
                                         :rm_name="props.userData.rm_name"
                    />
                    <span v-else>************</span>
                  </span>
                  <div class="d-flex">
                    <SmallIconButton v-if="hasAccess('update_rm')" icon="tabler-user-share" color="secondary"
                                     variant="tonal" @click="isReAssignManagerDialogVisible = true"
                    />
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>


          <VDivider class="my-5"/>

          <div class="d-flex align-center justify-space-between mb-5">
            <div class="text-sm text-disabled"> INTRODUCING BROKER</div>

            <VBtn v-if="props.userData.is_ib === 0 && hasAccess('request_ib')" color="primary" size="small"
                  variant="tonal" class="px-2 rounded" @click="isIBRequstDialogVisible = true"
            >
              PLACE IB REQUEST
            </VBtn>

          </div>

          <!-- 👉 IB INFO -->
          <VList class="card-list text-medium-emphasis mb-3 mt-5">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center">
                  <VIcon icon="tabler-stack-push" size="24" class="me-1"/>
                  <div class="text-body-1 font-weight-medium me-1"></div>
                  <div>IB STATUS :
                    <VChip class="ms-2" v-if="props.userData.is_ib === 0" variant="outlined" size="x-small">
                      NOT REQUESTED
                    </VChip>
                    <VChip color="success" class="ms-2" v-if="props.userData.is_ib === 2" variant="outlined"
                           size="x-small"
                    >
                      ACTIVE IB
                    </VChip>
                    <VChip color="warning" class="ms-2" v-if="props.userData.is_ib === 1" variant="outlined"
                           size="x-small"
                    >
                      REQUESTED
                    </VChip>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>


          <VDivider class="my-5"/>

          <div class="d-flex align-center justify-space-between mb-5">
            <div class="text-sm text-disabled"> PARENT IB</div>

            <VBtn v-if="props.userData.parent_ib_id > 0 && hasAccess('detach_parent_ib')" color="error" size="small"
                  variant="tonal" class="px-2 rounded" @click="isDetachIBDialogVisible = true"
            >
              DETACH IB
            </VBtn>
            <div v-else>
              <VBtn v-if="hasAccess('update_parent_ib')" color="primary" size="small" variant="tonal"
                    class="px-2 rounded" @click="isMoveIBDialogVisible = true"
              >
                MOVE CLIENT UNDER IB
              </VBtn>
            </div>


          </div>

          <VList v-if="props.userData.parent_ib_id > 0 && hasAccess('view_parent_ib')"
                 class="card-list text-medium-emphasis mb-3"
          >
            <VListItem>
              <a @click="handleViewProfileClick(props.userData.parent_ib_id)">
                <CustomClientCardChip :client_id="props.userData.parent_ib_id"
                                      :client_name="props.userData.parent_ib_name"
                                      :client_pic="props.userData.parent_ib_pic"
                                      :email="'#CID:' + props.userData.parent_ib_id"
                />
              </a>

            </VListItem>
          </VList>


          <!-- 👉 User Details list -->
          <VList class="card-list mt-2">

          </VList>
        </VCardText>

        <!-- 👉 Edit and Suspend button -->

      </VCard>
    </VCol>
    <!-- !SECTION -->

  </VRow>

  <!-- 👉 Edit user info dialog -->
  <UserInfoEditDialog v-model:isDialogVisible="isUserInfoEditDialogVisible" :user-data="props.userData"/>

  <!-- 👉 Upgrade plan dialog -->
  <UserUpgradePlanDialog v-model:isDialogVisible="isUpgradePlanDialogVisible"/>

  <!-- 👉 Client Document View Dialog -->
  <ClientDocumentViewDialog v-model:isDialogVisible="isClientDocViewDialogVisible" :client-docs="clientDocs"
                            :doc-verification-status="props.userData.doc_verified" :client-id="props.userData.id"
  />
  <!-- 👉 Client Upload Document  Dialog -->
  <UploadDocumentDialog v-model:isDialogVisible="isClientUploadDialogVisible" :client-id="props.userData.id"/>

  <!-- 👉 Assign Manager dialog -->
  <AssignManagerDialog v-model:isDialogVisible="isAssignManagerDialogVisible" :client-id="props.userData.id"
                       :is-assign="true"
  />

  <!-- 👉 RM Manager history dialog -->

  <RMManagerDialog v-if="props.userData?.rm_id!=null" v-model:isDrawerOpen="isRMManagerDialogVisible"
                   :client-id="props.userData.id"
                   :manager-history="managerHistory" :manager-id="props.userData?.rm_id"
                   :manager-name="props.userData?.rm_name"
  />


  <!-- 👉 Re Assign Manager dialog -->
  <AssignManagerDialog v-model:isDialogVisible="isReAssignManagerDialogVisible" :client-id="props.userData.id"
                       :is-assign="false"
  />
  <!-- 👉 IB request dialog -->
  <AddIBRequestDialog v-model:isDialogVisible="isIBRequstDialogVisible" :client-id="props.userData.id"/>
  <!-- 👉 Move Under IB dialog -->
  <AddClientUnderIBDialog v-model:isDialogVisible="isMoveIBDialogVisible" :client-id="props.userData.id"/>
  <!-- 👉 Move Under IB dialog -->
  <EditDetachClientIbDialog v-model:isDialogVisible="isDetachIBDialogVisible" :client-id="props.userData.id"/>

  <!-- 👉 Update Category Label -->
  <EditCategoryLabelDialog v-model:isDialogVisible="isUpdateCategoryLabelDialog" :client-id="props.userData.id"
                           :cat_label="props.userData.cat_label"
  />

  <!-- 👉 Activate Wallet -->
  <!--  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                   confirmation-question="Are you sure you want to activate the wallet on behalf of the client?"
                   cancel-title="Cancelled"
                   confirm-title="Cancelled!"
    />-->
  <ActivateWalletConfirmDialogue v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                                 confirmation-question="Are you sure you want to activate the wallet on behalf of the client?"
                                 cancel-title="Cancelled"
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
        <VBtn color="success" @click="handlePageReload">
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
        <VBtn color="success" @click="isErrorDialogVisible = false">
          OK
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VSnackbar v-model="isSnackbarVisible" :timeout="2000">
    {{ snackBarText }}
  </VSnackbar>


</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.5rem;
}


.text-capitalize {
  text-transform: capitalize !important;
}
</style>
