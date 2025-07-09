<script setup>
import ClientDetailsBioCard from "@/components/clientDetails/ClientDetailsBioCard.vue"
import ClientFundManagement from "@/components/clientDetails/ClientFundManagement.vue"
import ClientIBDashboard from "@/components/clientDetails/ClientIBDashboard.vue"
import MTCardListData from '@/components/clientDetails/MTCardListData.vue'
import UserTabBillingsPlans from "@/views/apps/user/view/UserTabBillingsPlans.vue"
import UserTabConnections from '@/views/apps/user/view/UserTabConnections.vue'
import { onMounted } from 'vue'

const route = useRoute('apps-user-view-id')
const userTab = ref(null)
const clientData = ref(null)
const managerHistory = ref(null)
const walletStatus = ref(null)
const clientDocs = ref(null)
const liveMT5Data = ref(null)
const mt5ListData = ref(null)
const tabs = ref([])
const isDataLoading = ref(false)
const client_id = ref(route.params.id)
const ability = useAbility()

const fetchMT5List = async () => {
  const res = await $api(`live-account/list/${client_id.value}`, {
    method: 'GET',
    onResponseError({ response }) {
      // Handle error
      console.log(response)
    },
  })
  mt5ListData.value = res.result.mt_list
}

const fetchClientDetails = async () => {
  const res = await $api(`client/data-dashboard/${client_id.value}`, {
    method: 'GET',
    onResponseError({ response }) {
      // Handle error
      console.log(response)
    },
  })
  clientData.value = res.result.client_details
  managerHistory.value = res.result.manager_histories
  walletStatus.value = res.result.wallet_created
  clientDocs.value = res.result.client_documents

  mapTabs()
}


const mapTabs = () => {
  const tabsArray = []

  if (hasAccess('view_mt5_accounts_card')) {
    tabsArray.push({
      icon: 'tabler-server-bolt',
      title: 'ACCOUNTS',
      label: 'acc',
    })
  }

  if (clientData.value && clientData.value.is_ib === 2 && hasAccess('view_ib_profile')) {
    tabsArray.push({
      icon: 'tabler-share',
      title: 'IB PROFILE',
      label: 'ib',
    })
  }

  if (hasAccess('create_deposit_ticket') || hasAccess('create_withdraw_ticket') || hasAccess('process_internal_transfer')) {
    tabsArray.push({
      icon: 'tabler-receipt',
      title: 'FUNDS',
      label: 'fund',
    })
  }

  if (hasAccess('view_deposit_list') || hasAccess('view_withdraw_list') || hasAccess('view_internal_transfer_list') || hasAccess('view_transaction_adjustments')) {
    tabsArray.push({
      icon: 'tabler-transaction-dollar',
      title: 'TRANSACTIONS',
      label: 'trans',
    })
  }

  tabsArray.push({
    icon: 'tabler-transaction-dollar',
    title: 'PROFILE SETTINGS',
    label: 'sett',
  })

  tabs.value = tabsArray
}

onMounted(async () => {
  await fetchClientDetails()
  await fetchMT5List()
})

</script>

<template>
  <VRow>

    <VCol v-if="clientData&&mt5ListData" cols="12" md="5" lg="4">
      <ClientDetailsBioCard :manager-history="managerHistory" :user-data="clientData" :client-docs="clientDocs"
                            :walletStatus="walletStatus" :mt5ListData="mt5ListData"
      />
    </VCol>
    <VSkeletonLoader v-else v-for="i in 3" :key="i" type="article"/>
    <VCol v-if="mt5ListData" cols="12" md="7" lg="8">
      <VTabs v-model="userTab" class="v-tabs-pill">
        <VTab v-for="tab in tabs" :key="tab.title" :value="tab.label">
          <VIcon :size="18" :icon="tab.icon" class="me-1"/>
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>
      <VWindow v-model="userTab" class="mt-6 disable-tab-transition" :touch="false">
        <VWindowItem value="acc">
          <MTCardListData v-if="mt5ListData" :mt5ListData="mt5ListData" :clientId="parseInt(client_id)"/>
        </VWindowItem>

        <VWindowItem value="ib">
          <ClientIBDashboard :client-id="parseInt(client_id)"/>
          <!--                  <UserTabBillingsPlans />
                            <UserTabConnections />-->
        </VWindowItem>

        <VWindowItem value="fund">
          <ClientFundManagement v-if="mt5ListData" :client-id="parseInt(client_id)" :mt5-list-data="mt5ListData"/>
        </VWindowItem>

        <VWindowItem value="trans">
          <ClientTransactionsData :clientId="parseInt(client_id)"/>
        </VWindowItem>

        <VWindowItem value="sett">
          <ClientProfileSettings :clientId="parseInt(client_id)"/>
        </VWindowItem>

      </VWindow>
    </VCol>
    <VSkeletonLoader class="ps-3 pt-3" v-else v-for="i in 3" :key="i" type="table-tbody"/>
  </VRow>
</template>
