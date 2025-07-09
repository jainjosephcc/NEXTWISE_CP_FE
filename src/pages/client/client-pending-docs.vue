<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import AddNewUserDrawer from "@/views/apps/user/list/AddNewUserDrawer.vue"

// Reactive state definitions
const searchQuery = ref('')
const selectedMTStatus = ref(null)
const selectedDepositStatus = ref(null)
const selectedDocStatus = ref(0)
const selectedManager = ref(null)
const selectedCountry = ref(null)
const selectedIBStatus = ref(null)
const country_list = ref(null)
const manager_list = ref(null)
const isClientDocViewDialogVisible = ref(false)
const selectedClientDocs = ref(null)
const docPendingVerifyStatus = ref(null)
const selectedClientId = ref(null)


const mt_status_list = [
  { title: 'All', value: null },
  { title: 'Account Not Created', value: '0' },
  { title: 'Live Account Created', value: '1' },
  { title: 'Demo Account Created', value: '2' },
]
const deposit_status_list = [
  { title: 'All', value: null },
  { title: 'Deposited', value: '1' },
  { title: 'Not Deposited', value: '1' },
]

const ib_status_list = [
  { title: 'All', value: null },
  { title: 'Normal User', value: '0' },
  { title: 'IB Requested', value: '1' },
  { title: 'Active IB', value: '2' },
]

const document_status_list = [
  { title: 'All', value: null },
  { title: 'Upload Pending', value: '0' },
  { title: 'Approved', value: '3' },
  { title: 'Rejected', value: '2' },
  { title: 'Verification Pending', value: '1' },
]

const countryList = ref(null)
const itemsPerPage = ref(25)
const page = ref(1)
const sortBy = ref(null)
const orderBy = ref(null)
const usersData = ref(null)
const headerData = ref({ total_clients: 0, ib_count: 0, total_deposit: 0, total_withdraw: 0 })
const selectedClient = ref(null)

const fetchUsers = async () => {
  usersData.value = null
  const res = await $api('/client/pending-doc-list', {
    method: 'POST',
    body: {
      keyword: searchQuery.value,
      page: page.value,
      RM: selectedManager.value,
      mt_account_status: selectedMTStatus.value,
      deposit_status: selectedDepositStatus.value,
      country: selectedCountry.value,
      is_ib: selectedIBStatus.value,
    },
    onResponseError({ response }) {
      console.log(response)
      // errors.value = response._data.message
    },
  })
  usersData.value = res

}
const fetchHeaderData = async () => {
  const res = await $api('/data/header-list', {
    method: 'GET',
    onResponseError({ response }) {
      console.log(response)
    },
  })

  headerData.value = await res.result
}


//console.log(usersData.value);
// Computed properties for users
const users = computed(() => usersData.value?.result.client_details.data || [])
const totalUsers = computed(() => usersData.value?.result.client_details.total || 0)


// Call API on mounted
const fetchCountry = async () => {
  const localCountryList = localStorage.getItem('country_list')
  if (localCountryList && localCountryList?.length > 50 && localCountryList !== 'undefined') {
    countryList.value = JSON.parse(localCountryList)
  } else {
    // Assuming useApi is set up correctly to handle the API request
    const c_response = await useApi('/data/country-list', { method: 'GET' })
    console.log(await c_response)
    if (c_response.data.value.result) {
      countryList.value = c_response.data.value.result.country_list
      localStorage.setItem('country_list', JSON.stringify(countryList.value))
    }

  }
  if (countryList) {
    country_list.value = countryList.value.map(country => ({
      title: country.name,
      value: country.id.toString(),  // Convert id to string to match your example
    }))
  }

}


onMounted(async () => {
  await fetchUsers()
  await fetchCountry()
  await fetchHeaderData()
})

// Watching sort options to refetch data
watch([page, itemsPerPage, selectedMTStatus, selectedDepositStatus, selectedDocStatus, selectedManager, selectedCountry, selectedIBStatus, searchQuery, sortBy, orderBy], () => {
  fetchUsers()
}, { deep: true, immediate: false })


watchEffect(() => {

})

const status = [
  {
    title: 'Pending',
    value: 'pending',
  },
  {
    title: 'Active',
    value: 'active',
  },
  {
    title: 'Inactive',
    value: 'inactive',
  },
]

const router = useRouter()
const handleViewProfileClick = (id) => {
  if (hasAccess('view_client_profile'))
    router.push(`/client/client-${id}-home-null-details`)
}

const handleProcessClientDoc = (id, docs, status) => {
  if (hasAccess('view_client_docs')) {
    selectedClientId.value = id
    selectedClientDocs.value = docs
    isClientDocViewDialogVisible.value = true
    docPendingVerifyStatus.value = status
  }
}

const handleViewIBProfileClick = (id) => {
  if (hasAccess('view_ib_profile'))
    router.push(`/client/client-${id}-home-null-details`)
}


// CRUD Operations


// Widget data for the dashboard
const widgetData = computed(() => [
  {
    title: 'Total Clients',
    value: headerData.value.total_clients.toString(),
    change: 29, desc: 'Active Registered Clients', icon: 'tabler-users', iconColor: 'primary',
  },
  {
    title: 'IB Count',
    value: headerData.value.ib_count.toString(),
    change: 18, desc: 'Introducing Brokers', icon: 'tabler-chart-arrows-vertical', iconColor: 'warning',
  },
  {
    title: 'Total Deposit',
    value: formatCurrency(headerData.value.total_deposit),
    desc: 'Approved Deposits', icon: 'tabler-brand-cashapp', iconColor: 'success',
  },
  {
    title: 'Total Withdraw',
    value: formatCurrency(headerData.value.total_withdraw),
    desc: 'Approved Withdrawals', icon: 'tabler-database-minus', iconColor: 'danger',
  },
])
</script>


<template>
  <section>
    <!-- 👉 Widgets -->
    <!-- 👉 HEADER WIDGET START-->
    <CustomPageHeaderWidget/>
    <!-- 👉 HEADER WIDGET END-->

    <VCard class="mb-6">
      <VCardTitle class="py-4">
        Documents Pending Approval
      </VCardTitle>
      <VDivider/>
      <VCardText>
        <VRow>

          <!-- 👉 Select MT ACCOOUNT -->
          <VCol cols="12" sm="2">
            <AppSelect label="MT Account Status" v-model="selectedMTStatus" placeholder="MT Account Status"
                       :items="mt_status_list" clearable clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select DEPOSIT STATUS -->
          <VCol cols="12" sm="2">
            <AppSelect v-model="selectedDepositStatus" label="Deposit Status" placeholder="Deposit Status"
                       :items="deposit_status_list" clearable clear-icon="tabler-x"
            />
          </VCol>


          <!-- 👉 Select ASSIGNED MANAGER -->
          <CustomManagerSelectWidget v-if="hasAccess('view_all_clients')||hasAccess('view_my_team_clients')"
                                     v-model="selectedManager"
          />

          <!-- 👉 Select Country -->
          <VCol v-if="country_list && country_list.length > 2" cols="12" sm="2">
            <AppSelect v-model="selectedCountry" label="Country" placeholder="Country" :items="country_list" clearable
                       clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select IB STATUS -->
          <VCol cols="12" sm="2">
            <AppSelect v-model="selectedIBStatus" label="IB Status" placeholder="IB Status" :items="ib_status_list"
                       clearable clear-icon="tabler-x"
            />
          </VCol>

        </VRow>
      </VCardText>

      <VDivider/>
      <VCardText class="d-flex flex-wrap">
        <div class="me-3 d-flex gap-2">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField v-model="searchQuery" placeholder="Search User" label="Search User"/>
          </div>

        </div>
        <VSpacer/>

      </VCardText>


      <VDivider/>
      <VTable v-if="usersData" height="800" fixed-header class="text-no-wrap">
        <thead>
        <tr>
          <th>
            ID/DOJ
          </th>
          <th>
            NAME/EMAIL
          </th>
          <th>

          </th>
          <th v-if="hasAccess('view_rm')">
            ASSIGNED RM
          </th>
          <th v-if="hasAccess('view_client_total_deposit')">
            <VIcon icon="tabler-sum me-1" size="16"/>
            DEP.
          </th>
          <th v-if="hasAccess('view_client_total_withdraw')">
            <VIcon icon="tabler-sum me-1" size="16"/>
            WITH.
          </th>
          <th v-if="hasAccess('view_parent_ib')">
            PARENT IB
          </th>
          <th v-if="hasAccess('view_client_profile')">
            VIEW
          </th>
        </tr>
        </thead>

        <tbody>
        <tr class="" v-for="user in users" :key="user.id">

          <td class="text-caption me-0 ms-0 px-0 py-0" style="padding-left: 2px;">
            <VChip size="x-small">
              {{ user.cat_label === 0 ? 'R' : 'P' }}{{ user.id }}
            </VChip>
            <br/>
            {{ formatDateToMonthShort(user.joined_on) }}
          </td>

          <td>
            <CustomClientCardChip :client_name="user.client_name" :client_id="user.id" :email="user.email"
                                  :client_pic="user.client_pic"
            ></CustomClientCardChip>
          </td>

          <td>
            <VAvatar
              rounded
              :color="user.email_verified===1?'success':'secondary'"
              :icon="user.email_verified===1?'tabler-mail-check':'tabler-mail-cancel'"
              :variant="user.email_verified===1?'outlined':'tonal'"
              class="me-1"
              size="30"
            />
            <VAvatar
              rounded
              :color="user.doc_verified===3?'success':'secondary'"
              :icon="user.doc_verified===3?'tabler-file-check':'tabler-file-alert'"
              :variant="user.doc_verified===3?'outlined':'tonal'"
              class="me-1"
              size="30"
            />
            <VAvatar
              rounded
              :color="user.mt_created===1?'success':'secondary'"
              :icon="user.mt_created===1?'tabler-chart-candle':'tabler-candle'"
              :variant="user.mt_created===1?'outlined':'tonal'"
              class="me-1"
              size="30"
            />
            <VAvatar v-if="user.is_ib === 1"
                     rounded
                     color="warning"
                     variant="tonal"
                     class="me-1"
                     size="30"
            > R
            </VAvatar>
            <VAvatar v-if="user.is_ib === 2"
                     rounded
                     color="success"
                     variant="tonal"
                     class="me-1"
                     size="30"
            > IB
            </VAvatar>
            <VAvatar v-if="user.is_ib === 0"
                     rounded
                     color="secondary"
                     variant="outlined"
                     class="me-1"
                     size="30"
            > N
            </VAvatar>
          </td>

          <td v-if="hasAccess('view_rm')">
            <CustomStaffCardChip v-if="user.rm_name" :rm_name="user.rm_name" :rm_id="user.manager_id"/>
            <VChip v-else size="x-small" variant="outlined">
              <span class="text-caption text-xs">RM NOT MAPPED</span>
            </VChip>
          </td>

          <td v-if="hasAccess('view_client_total_deposit')">
            {{ formatCurrency(user.deposit) }}
          </td>
          <td v-if="hasAccess('view_client_total_withdraw')">
            {{ formatCurrency(user.withdraw) }}
          </td>
          <td v-if="hasAccess('view_parent_ib')">
            <CustomClientCardChip v-if="user.ib_name" :client_id="user.ib_id" :client_name="user.ib_name"
                                  :client_pic="user.ib_pic" :email="'PARENT IB #'+user.ib_id"
            />
            <VChip v-else size="x-small" variant="outlined">
              <span class="text-caption text-xs">NO PARENT IB</span>
            </VChip>
          </td>

          <!-- <td>
            {{ user.contact_no }}
          </td> -->
          <td v-if="hasAccess('view_client_profile')">
            <VBtn
              color="secondary"
              size="x-small"
              variant="elevated"
              class="px-2 me-2 rounded"
              icon="tabler-address-book"
              @click="handleViewProfileClick(user.id)"
            >
            </VBtn>
            <VBtn
              v-if="hasAccess('view_client_docs')"
              color="secondary"
              size="x-small"
              variant="elevated"
              class="px-2 me-2 rounded"
              @click="handleProcessClientDoc(user.id,user.client_docs,user.doc_verified)"
            >
              DOCS
            </VBtn>
            <!--              <VIcon icon="tabler-edit" />-->
            <!-- {{ user.manager_id }} -->
          </td>

        </tr>
        </tbody>
      </VTable>
      <VSkeletonLoader v-else v-for="i in 3" :key="i" type="table-tbody"/>
      <VCardText class="pt-2">
        <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">


          <VPagination v-model="page" :total-visible="$vuetify.display.smAndDown ? 3 : 5"
                       :length="Math.ceil(totalUsers / itemsPerPage)"
          />
        </div>
      </VCardText>
      <!-- SECTION -->
    </VCard>
  </section>

  <!-- 👉 Client Document View Dialog -->
  <ClientDocumentViewDialog v-if="selectedClientId" v-model:isDialogVisible="isClientDocViewDialogVisible"
                            :client-docs="selectedClientDocs"
                            :doc-verification-status="docPendingVerifyStatus" :client-id="selectedClientId"
  />


</template>
