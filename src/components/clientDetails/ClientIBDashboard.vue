<script setup>
import SmallIconButton from "@/components/SmallIconButton.vue"
import EditActiveIBDefaultGroupDialog from "@/components/dialogs/client-ib/EditActiveIBDefaultGroupDialog.vue"
import ViewIBMTAccountLIst from "@/components/dialogs/client-ib/ViewIBMTAccountLIst.vue"
import { fetchDataWithoutLocalStorage } from "@/utils/apiUtils.js"
import { onMounted } from "vue"
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'
const isSnackbarVisible = ref(false)
const snackBarText = ref('')


const props = defineProps({
  clientId: {
    type: Number,
    required: true,
  },
})
const vuetifyTheme = useTheme()
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
const ibInfo = ref(null)
const isViewMTList = ref(false)
const isEditDefultGroupVisible = ref(false)
const isEditIBPlanVisible = ref(false)
const currentTab = ref(null)
const selectedLevelClients = ref(null)
const tabs = computed(() => {
  return ibInfo.value.levels.filter(level => Object.keys(level).length > 1).map(level => level.key)
})
const fetchIBInformation = () => fetchDataWithoutLocalStorage('getIbInformation/' + props.clientId, ibInfo)
// Watch ibInfo for changes
watch(ibInfo, (newValue) => {
  if (newValue) {
    selectedLevelClients.value = newValue.level1clientsData
    currentTab.value = 0
  }
})

// Watch Tab Change
watch(currentTab, async (newValue) => {
  selectedLevelClients.value = null
  const res = await $api('/getIbLevelInfo', {
    method: 'POST',
    body: {
      parent_id: ibInfo.value.levels[newValue],
      ib_id: props.clientId,
    },
    onResponseError({ response }) {
      // console.log(response)
    },
  })
  selectedLevelClients.value = res.levelclientsData
})

onMounted(async () => {
  await fetchIBInformation()
})


const router = useRouter()
const handleViewProfileClick = (id) => {
  if (hasAccess('view_client_profile')) {
    // Force a full page reload by setting the window location
    window.location.href = `/client/client-${id}-home-null-details`
  }
}

const copyToClipBoard = (textToCopy) => {
  if (textToCopy) {
    navigator.clipboard.writeText(`https://client.bitragemarkets.com/register?promo=${textToCopy}`).then(() => {
      snackBarText.value = 'Referal Code Copied to Clipboard'
      isSnackbarVisible.value = true
    }).catch(err => {
      console.error('Failed to copy text: ', err)
    })
  } else {
    console.log('No text to copy')
  }
}

</script>
total_mt_details
<template>
  <VCard v-if="hasAccess('view_ib_profile')">
    <VCardItem class="pb-sm-0">
      <VCardTitle>IB Dashboard</VCardTitle>
      <VCardSubtitle>An Overview of the Client's IB Program</VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VRow v-if="ibInfo">
        <VCol cols="12" sm="4" lg="6" class="d-flex flex-column align-self-center">
          <div class="d-flex align-center gap-2 mb-3 flex-wrap">
            <h1 v-if="ibInfo&&hasAccess('view_ib_earned_commission')" class="text-h1">
              {{ formatCurrency(ibInfo.commision) }}
            </h1>
            <h1 v-else class="text-h1">
              *****
            </h1>
            <VChip label variant="outlined" size="x-small" color="success">
              Withdrawn + Pending
            </VChip>
          </div>

          <span class="text-sm text-medium-emphasis">
            Total Commission Earned by IB from all the Levels.
          </span>
        </VCol>

        <VCol cols="12" sm="8" lg="6">
          <VCardText>
            <VList class="card-list">

              <!-- 👉 IB PLAN -->
              <VListItem>
                <template #prepend>
                  <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                    <VIcon icon="tabler-share" size="22"/>
                  </VAvatar>
                </template>

                <VListItemTitle class="font-weight-medium me-4 text-overline">
                  IB PLAN
                </VListItemTitle>
                <VListItemSubtitle class="me-4 text-caption">
                  Commission plan
                </VListItemSubtitle>

                <template #append>
                  <div class="d-flex align-center gap-x-2">
                    <VChip v-if="hasAccess('view_ib_plan')" size="small" variant="outlined" color="secondary"
                           class="text-h6"
                    >
                      {{ ibInfo?.ib_details?.plan_name?.toUpperCase() }}
                    </VChip>
                    <VChip v-else size="small" variant="outlined" color="secondary" class="text-h6">
                      **********
                    </VChip>

                    <SmallIconButton v-if="hasAccess('update_ib_plan')" icon="tabler-tool" color="secondary"
                                     variant="tonal"
                                     @click="isEditIBPlanVisible = true"
                    />
                  </div>
                </template>
              </VListItem>

              <!-- 👉 TOTAL CLIENTS -->
              <VListItem>
                <template #prepend>
                  <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                    <VIcon icon="tabler-users" size="22"/>
                  </VAvatar>
                </template>

                <VListItemTitle class="font-weight-medium me-4 text-overline">
                  TOTAL CLIENTS
                </VListItemTitle>
                <VListItemSubtitle class="me-4 text-caption">
                  Clients in all levels
                </VListItemSubtitle>

                <template #append>
                  <div class="d-flex align-center gap-x-4">
                    <VChip v-if="hasAccess('view_ib_client_count')" variant="outlined" color="secondary"
                           class="text-h6"
                    >
                      {{ ibInfo?.clients }}
                    </VChip>
                    <VChip v-else variant="outlined" color="secondary" class="text-h6">
                      ***
                    </VChip>
                  </div>
                </template>
              </VListItem>

              <!-- 👉 TOTAL MT ACCOUNTS -->
              <VListItem>
                <template #prepend>
                  <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                    <VIcon icon="tabler-layout-2" size="22"/>
                  </VAvatar>
                </template>

                <VListItemTitle class="font-weight-medium me-4 text-overline">
                  TOTAL MT ACCOUNTS
                </VListItemTitle>
                <VListItemSubtitle class="me-4 text-caption">
                  Total MT5 Accounts
                </VListItemSubtitle>

                <template #append>
                  <div class="d-flex align-center gap-x-2">
                    <VChip v-if="hasAccess('view_ib_mt5_count')" variant="outlined" color="secondary"
                           class="text-h6"
                    >
                      {{ ibInfo?.total_mt_details.length }}
                    </VChip>
                    <VChip v-else variant="outlined" color="secondary"
                           class="text-h6"
                    >
                      **
                    </VChip>
                    <SmallIconButton v-if="hasAccess('view_ib_mt5_details')" icon="tabler-eye" color="success"
                                     variant="tonal" @click="isViewMTList = true"
                    />
                  </div>
                </template>
              </VListItem>

              <!-- 👉 DEFAULT GROUPS -->

              <VListItem>
                <template #prepend>
                  <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                    <VIcon icon="tabler-bomb" size="22"/>
                  </VAvatar>
                </template>

                <VListItemTitle class="font-weight-medium me-4 text-overline">
                  DEFAULT GROUPS
                </VListItemTitle>
                <VListItemSubtitle class="me-4 text-caption">
                  Mapped Default Groups
                </VListItemSubtitle>

                <template #append>
                  <div class="d-flex align-center gap-x-4">
                    <div class="v-timeline-item__body text-end">
                      <div v-if="hasAccess('edit_ib_default_group')" class="mb-1">
                        <SmallIconButton icon="tabler-tool" color="secondary" variant="tonal"
                                         @click="isEditDefultGroupVisible = true"
                        />
                      </div>

                      <div v-if="hasAccess('view_ib_default_group')" v-for="group in ibInfo.groups" :key="group.id"
                           class="mb-1"
                      >
                        <VChip size="small" variant="outlined" color="secondary" class="text-sm">{{
                            group.mt_group_name
                          }}
                        </VChip>
                      </div>
                      <div v-else class="mb-1">
                        <VChip size="small" variant="outlined" color="secondary" class="text-sm">****
                        </VChip>
                      </div>
                    </div>
                    <!--                    <div class="text-body-1">
                      TEST
                    </div>
                    <VChip
                      label
                      size="small"
                      variant="outlined"
                      color="secondary"
                    >
                      {{ ibInfo?.clients }}
                    </VChip>-->
                  </div>
                </template>
              </VListItem>

              <!-- 👉 WITHDRWABLE BALANCE -->
              <VListItem>
                <template #prepend>
                  <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                    <VIcon icon="tabler-pig-money" size="22"/>
                  </VAvatar>
                </template>

                <VListItemTitle class="font-weight-medium me-4 text-overline">
                  AVAILABLE BALANCE
                </VListItemTitle>
                <VListItemSubtitle class="me-4 text-caption">
                  Transferable Balance
                </VListItemSubtitle>

                <template #append>
                  <div class="d-flex align-center gap-x-4">
                    <!--                    <div class="text-body-1">
                      TEST
                    </div>-->
                    <VChip v-if="hasAccess('view_ib_balance_commission')" size="small" variant="outlined"
                           color="secondary" class="text-h6"
                    >
                      {{ formatCurrency(ibInfo?.balanceCommision) }}
                    </VChip>
                    <VChip v-else size="small" variant="outlined" color="secondary" class="text-h6">
                      ***
                    </VChip>
                  </div>
                </template>
              </VListItem>

              <!-- 👉 REFERAL LINK -->
              <VListItem>
                <template #prepend>
                  <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                    <VIcon icon="tabler-user-share" size="22"/>
                  </VAvatar>
                </template>

                <VListItemTitle class="font-weight-medium me-4 text-overline">
                  REFERAL CODE
                </VListItemTitle>
                <VListItemSubtitle class="me-4 text-caption">
                  IB Referal Code
                </VListItemSubtitle>

                <template #append>
                  <div class="d-flex align-center gap-x-4">
                    <VChip size="small" variant="outlined"
                           color="secondary" class="text-h8"
                    >
                      /signup?promo={{ ibInfo?.ib_details?.ib_key }}
                    </VChip>
                    
                    <!-- <VChip v-else size="small" variant="outlined" color="secondary" class="text-h6">
                      ***
                    </VChip> -->
                    <SmallIconButton icon="tabler-copy" color="secondary"
                                       variant="tonal"
                                       @click="copyToClipBoard(ibInfo?.ib_details?.ib_key)"
                      />
                  </div>
                </template>
              </VListItem>


            </VList>
          </VCardText>
        </VCol>
      </VRow>
      
      <VSkeletonLoader v-else type="article"/>

      <div v-if="ibInfo" class="border rounded mt-5 pa-5">
        <VRow>
          <!-- 👉 TOTAL DEPOSIT -->
          <VCol cols="12" sm="4">
            <div class="d-flex align-center">
              <VAvatar rounded size="26" color="error" variant="tonal" class="me-2">
                <VIcon size="18" icon="tabler-moneybag"/>
              </VAvatar>

              <h6 class="text-base font-weight-regular text-overline">
                TOTAL DEPOSIT
              </h6>
            </div>
            <h6 v-if="hasAccess('view_ib_client_deposit')" class="text-h4 my-2">
              {{ formatCurrency(ibInfo?.total_investment[0].total_deposit) }}
            </h6>
            <h6 v-else class="text-h4 my-2">
              ***
            </h6>
            <VProgressLinear model-value="100" color="primary" height="4" rounded rounded-bar/>
          </VCol>
          <!-- 👉 TOTAL WITHDRAW -->
          <VCol cols="12" sm="4">
            <div class="d-flex align-center">
              <VAvatar rounded size="26" color="success" variant="tonal" class="me-2">
                <VIcon size="18" icon="tabler-building-bank"/>
              </VAvatar>

              <h6 class="text-base font-weight-regular text-overline">
                TOTAL WITHDRAW
              </h6>
            </div>
            <h6 v-if="hasAccess('view_ib_client_withdraw')" class="text-h4 my-2">
              {{ formatCurrency(ibInfo?.total_withdrawl[0].total_withdraw) }}
            </h6>
            <h6 v-else class="text-h4 my-2">
              ***
            </h6>
            <VProgressLinear model-value="100" color="primary" height="4" rounded rounded-bar/>
          </VCol>
          <!-- 👉 TRANSFERRED COMMISSION -->
          <VCol cols="12" sm="4">
            <div class="d-flex align-center">
              <VAvatar rounded size="26" color="warning" variant="tonal" class="me-2">
                <VIcon size="18" icon="tabler-flame"/>
              </VAvatar>

              <h6 class="font-weight-regular head text-overline">
                TRANSFERRED COMMISSION
              </h6>
            </div>
            <h6 v-if="hasAccess('view_ib_withdrawn_commission')" class="text-h4 my-2">
              {{ formatCurrency(ibInfo?.commisionwithdraw) }}
            </h6>
            <VProgressLinear model-value="100" color="primary" height="4" rounded rounded-bar/>
          </VCol>
        </VRow>
      </div>
      <VSkeletonLoader v-else type="list-item-avatar"/>
    </VCardText>

    <VCardItem v-if="hasAccess('view_ib_levels_clients')" class="pb-sm-0">
      <VCardTitle>IB LEVELS</VCardTitle>
      <VCardSubtitle>List of Levels and Clients mapped under each level</VCardSubtitle>
    </VCardItem>
    <VCardItem v-else class="pb-sm-0">
      <VCardTitle>IB LEVELS</VCardTitle>
      <VCardSubtitle>You dont have enough permission to view this data.</VCardSubtitle>
    </VCardItem>

    <VCardText v-if="ibInfo">
      <VRow v-if="hasAccess('view_ib_levels_clients')">
        <VCol cols="12" class="d-flex flex-column align-self-center">
          <VTabs v-model="currentTab" class="v-tabs-pill mt-3">
            <VTab v-for="(tab, index) in tabs" :key="index">TIER {{ index + 1 }}</VTab>
          </VTabs>

          <VCard class="mt-5">
            <VCardText>
              <VWindow v-model="currentTab">
                <VWindowItem v-for="(tab, index) in tabs" :key="index" :value="index">
                  <div v-if="selectedLevelClients">
                    <VTable class="text-no-wrap">
                      <thead>
                      <tr>
                        <th>
                          #CID
                        </th>
                        <th>
                          CLIENT
                        </th>
                        <th>
                          TOTAL LOTS
                        </th>
                        <th>
                          COMMISSION
                        </th>
                        <th>
                          DEPOSIT
                        </th>
                        <th>
                          IS IB
                        </th>
                        <th>
                        </th>
                      </tr>
                      </thead>

                      <tbody>
                      <tr v-for="client in selectedLevelClients" :key="client.id">
                        <td>
                          {{ client.id }}
                        </td>
                        <td>
                          <a @click="handleViewProfileClick(client.id)">
                            <CustomClientCardChip :client_id="client.id" :email="client.email"
                                                  :client_name="client.client_name" :client_pic="client.profile_pic"
                            />
                          </a>
                        </td>
                        <td>
                          {{ client.total_lots }}
                        </td>
                        <td>
                          {{ formatCurrency(client.total_commission) }}
                        </td>
                        <td>
                          {{ formatCurrency(client.deposit) }}
                        </td>
                        <td>
                          <VChip v-if="client.is_ib === 2" size="x-small" variant="outlined" color="success">
                            ACTIVE IB
                          </VChip>
                          <VChip v-else size="x-small" variant="outlined" color="secondary">
                            NON IB
                          </VChip>
                        </td>
                        <td>
                          <VBtn color="secondary" size="x-small" variant="elevated" class="px-2 me-2 rounded"
                                @click="handleViewProfileClick(client.id)"
                          >
                            PROFILE
                          </VBtn>
                        </td>
                      </tr>
                      </tbody>
                    </VTable>
                  </div>
                  <VSkeletonLoader v-else type="table-tbody"/>
                </VWindowItem>
              </VWindow>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VCardText>

  </VCard>
  <VCard v-else>
    <VCardItem class="pb-sm-0">
      <VCardTitle>IB Dashboard</VCardTitle>
      <VCardSubtitle>You do not have enough permissions to view this Tab</VCardSubtitle>
    </VCardItem>
  </VCard>

  <!-- 👉 VIEW MT5 LIST OF ALL CLIENTS -->
  <ViewIBMTAccountLIst v-if="ibInfo" v-model:isDrawerOpen="isViewMTList" :mt-list="ibInfo?.total_mt_details"/>

  <!-- 👉 Move Under IB dialog -->
  <EditActiveIBDefaultGroupDialog v-if="ibInfo" v-model:isDialogVisible="isEditDefultGroupVisible"
                                  :client-id="props.clientId"
                                  :groups="ibInfo?.groups || []"
  />
  <!-- 👉 Edit IB plan-->
  <EditActiveIBPlanDialog v-if="ibInfo" v-model:isDialogVisible="isEditIBPlanVisible" :client-id="props.clientId"
                          :plan-name="ibInfo?.ib_details?.plan_name?.toUpperCase()"
  />

  <VSnackbar v-model="isSnackbarVisible" :timeout="2000">
    {{ snackBarText }}
  </VSnackbar>

</template>
<style scoped>
.small-chip {
  font-size: 12px; /* Adjust the font size */
  padding: 2px 6px; /* Adjust the padding */
  height: 24px; /* Adjust the height */
}
</style>
