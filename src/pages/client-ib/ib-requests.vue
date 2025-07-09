<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import AddNewUserDrawer from "@/views/apps/user/list/AddNewUserDrawer.vue"
import { fetchCountryList, fetchStaffList } from "@/utils/apiUtils.js"

// Reactive state definitions
const searchQuery = ref('')
const selectedMTStatus = ref(null)
const selectedDepositStatus = ref(null)
const selectedDocStatus = ref(null)
const selectedManager = ref(null)
const selectedCountry = ref(null)
const selectedIBStatus = ref(null)
const country_list = ref(null)
const manager_list = ref(null)
const isApproveModalVisible = ref(false)
const ibdetails = ref(null)


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
const document_status_list = [
  { title: 'All', value: null },
  { title: 'Upload Pending', value: '0' },
  { title: 'Approved', value: '3' },
  { title: 'Rejected', value: '2' },
  { title: 'Verification Pending', value: '1' },
]

const countryList = ref(null)
const staffList = ref(null)


const itemsPerPage = ref(25)
const page = ref(1)
const sortBy = ref(null)
const orderBy = ref(null)
const usersData = ref(null)


const fetchUsers = async () => {
  usersData.value = null
  const res = await $api('/client/sorted-list', {
    method: 'POST',
    body: {
      keyword: searchQuery.value,
      page: page.value,
      RM: selectedManager.value,
      mt_account_status: selectedMTStatus.value,
      deposit_status: selectedDepositStatus.value,
      document_status: selectedDocStatus.value,
      country: selectedCountry.value,
      is_ib: 1,
    },
    onResponseError({ response }) {
      console.log(response)
      // errors.value = response._data.message
    },
  })
  usersData.value = res

}

//console.log(usersData.value);
// Computed properties for users
const users = computed(() => usersData.value?.result.client_details.data || [])
const totalUsers = computed(() => usersData.value?.result.client_details.total || 0)


// Call API on mounted


onMounted(async () => {
  fetchStaffList()
  fetchCountryList()
  fetchUsers()
})

// Watching sort options to refetch data
watch([page, itemsPerPage, selectedMTStatus, selectedDepositStatus, selectedDocStatus, selectedManager, selectedCountry, selectedIBStatus, searchQuery, sortBy, orderBy], () => {
  fetchUsers()
}, { deep: true, immediate: false })


watchEffect(() => {

})

function formatCurrency(value) {
  if (value === null || value === undefined) {
    // Handling null or undefined by returning $ 0.00 or any other placeholder you prefer
    return '$ -'  // or return '$ 0.00'; if you want to treat null/undefined as 0
  }

  const number = parseFloat(value)
  // Ensuring NaN (not a number) falls back to 0.00 if the input is non-numeric
  if (isNaN(number)) {
    return '$ 0.00'
  }

  return `$ ${number.toFixed(2)}`
}

// Resolving UI variants
const resolveUserRoleVariant = (role) => {
  const variants = {
    subscriber: { color: 'success', icon: 'tabler-user' },
    author: { color: 'error', icon: 'tabler-device-desktop' },
    maintainer: { color: 'info', icon: 'tabler-chart-pie' },
    editor: { color: 'warning', icon: 'tabler-edit' },
    admin: { color: 'primary', icon: 'tabler-crown' },
  }
  return variants[role.toLowerCase()] || { color: 'primary', icon: 'tabler-user' }
}

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

// Drawer visibility
const isAddNewUserDrawerVisible = ref(false)

// CRUD Operations
function approveRequest(trans) {
  ibdetails.value = trans
  isApproveModalVisible.value = true
}

const router = useRouter()
const handleViewProfileClick = (id) => {
  if (hasAccess('view_client_profile'))
    router.push(`/client/client-${id}-home-null-details`)
}

</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <VCard class="mb-6">
      <VCardTitle class="py-4">
        IB Requests
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

          <!-- 👉 Select DOCUMENT STATUS -->
          <VCol cols="12" sm="2">
            <AppSelect v-model="selectedDocStatus" label="Document Status" placeholder="Document Status"
                       :items="document_status_list" clearable clear-icon="tabler-x"
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
              color="primary"
              size="x-small"
              variant="elevated"
              class="px-2 me-2 rounded"
              icon="tabler-rubber-stamp"
              @click="approveRequest(user)"
            >
            </VBtn>

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
    <ApproveIbRequestDialog v-model:isDialogVisible="isApproveModalVisible" :ibdetails="ibdetails"/>
  </section>
</template>

<style scoped lang="scss">

</style>
