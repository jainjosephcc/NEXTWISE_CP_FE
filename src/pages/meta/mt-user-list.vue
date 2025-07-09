<script setup>
import AddNewClientDialog from "@/components/dialogs/client/AddNewClientDialog.vue"
import { country_list, fetchCountryList, fetchDataWithLocalStorage, fetchStaffList } from '@/utils/apiUtils'
import { computed, onMounted, ref, watch, watchEffect } from 'vue'

// Reactive state definitions
const searchQuery = ref('')
const selectedCategory = ref(null)
const selectedDepositStatus = ref(null)
const selectedGroup = ref(null)
const selectedManager = ref(null)
const selectedFromDate = ref(null)
const selectedToDate = ref(null)

const itemsPerPage = ref(25)
const page = ref(1)
const sortBy = ref(null)
const orderBy = ref(null)
const mt5UserList = ref(null)

const deposit_status_list = [
  { title: 'All', value: null },
  { title: 'Deposited', value: '1' },
  { title: 'Not Deposited', value: '1' },
]

const mtGroupCategories = ref(null)
const mtGroupCategoriesList = ref(null)
const fetchMTGroupCategories = () => fetchDataWithLocalStorage('mtGroupCategories', 'admin/group-categories', mtGroupCategories)
watch(mtGroupCategories, (newVal) => {
  if (newVal) {
    mtGroupCategoriesList.value = newVal.group_category.map(item => ({
      title: item.category_name,
      value: item.id,
    }))
  }
})

const mtGroups = ref(null)
const mtGroupsList = ref(null)
const fetchMTGroups = () => fetchDataWithLocalStorage('mtGroups', 'admin/group-list', mtGroups)
watch(mtGroups, (newVal) => {
  if (newVal) {
    mtGroupsList.value = newVal.groups.map(item => ({
      title: item.mt_group_name,
      value: item.id,
    }))
  }
})
/*if(mtGroups){
  mtGroupsList.value=mtGroups.groups.map(item=>(
    {
      title:item.category_name,
      value:item.id
    }
  ));
}*/



//FETCH CLIENT LIST
const fetchUsers = async () => {
  mt5UserList.value = null
  const res = await $api('/client/sorted-mt5-list', {
    method: 'POST',
    body: {
      keyword: searchQuery.value,
      page: page.value,
      RM: selectedManager.value,
      category_id: selectedCategory.value,
      group_id: selectedGroup.value,
      deposit_status: selectedDepositStatus.value,
      joined_from: selectedFromDate.value,
      joined_to: selectedToDate.value,
    },
    onResponseError({ response }) {
      console.log(response)
      // errors.value = response._data.message
    },
  })
  mt5UserList.value = res

}


const mt5List = computed(() => mt5UserList.value?.result.mt5List.data || [])
const totalAccounts = computed(() => mt5UserList.value?.result.mt5List.total || 0)


onMounted(async () => {
  searchQuery.value = ''
  fetchStaffList()
  fetchCountryList()
  fetchMTGroupCategories()
  fetchMTGroups()
  fetchUsers()
})

// Watching sort options to refetch data
watch([page, itemsPerPage, selectedDepositStatus, selectedManager, selectedGroup, selectedCategory, searchQuery, sortBy, orderBy, selectedFromDate, selectedToDate], () => {
  fetchUsers()
}, { deep: true, immediate: false })


watchEffect(() => {

})


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

const router = useRouter()
const handleViewProfileClick = (id) => {
  if (hasAccess('view_client_profile'))
    router.push(`/client/client-${id}-home-null-details`)
}

// CRUD Operations

</script>


<template>
  <section>
    <!-- 👉 Widgets -->
    <!-- 👉 HEADER WIDGET START-->
    <CustomPageHeaderWidget/>
    <!-- 👉 HEADER WIDGET END-->

    <VCard class="mb-6">
      <VCardText>
        <VRow>

          <!-- 👉 Select MT GROUP CATEGORIES -->
          <VCol cols="12" sm="2" v-if="mtGroupCategories">
            <AppSelect v-model="selectedCategory" label="Group Categories" placeholder="MT5 Group Category"
                       :items="mtGroupCategoriesList" clearable clear-icon="tabler-x"
            />
          </VCol>


          <!-- 👉 Select MT GROUP GROUPS -->
          <VCol cols="12" sm="2" v-if="mtGroups">
            <AppSelect label="MT Group" v-model="selectedGroup" placeholder="MT5 Group"
                       :items="mtGroupsList" clearable clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select ASSIGNED MANAGER -->
          <CustomManagerSelectWidget v-if="hasAccess('view_all_clients')||hasAccess('view_my_team_clients')"
                                     v-model="selectedManager"
          />

          <!-- 👉 Select DEPOSIT STATUS -->
          <VCol cols="12" sm="2">
            <AppSelect v-model="selectedDepositStatus" label="Deposit Status" placeholder="Deposit Status"
                       :items="deposit_status_list" clearable clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select DOCUMENT STATUS -->

          <VCol cols="12" sm="2">
            <AppDateTimePicker v-model="selectedFromDate" label="From Date" placeholder="Select date" clearable
                               clear-icon="tabler-x"
            />
          </VCol>
          <VCol cols="12" sm="2">
            <AppDateTimePicker v-model="selectedToDate" label="To Date" placeholder="Select date" clearable
                               clear-icon="tabler-x"
            />
          </VCol>

        </VRow>
      </VCardText>

      <VDivider/>

      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField label="Search by Name/Email/MT5 ID" v-model="searchQuery" placeholder="Search User"/>
          </div>

        </div>
        <VSpacer/>

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">

          <p class="card-subtitle pt-3">TOTAL LISTED COUNT : {{ totalAccounts ? totalAccounts : 0 }}</p>

        </div>
      </VCardText>


      <VDivider/>
      <VTable v-if="mt5UserList" height="800" fixed-header class="text-no-wrap">
        <thead>
        <tr>
          <th>
            ID/DOJ
          </th>
          <th>
            MT5 ID
          </th>
          <th>
            <VIcon icon="tabler-badge-filled" size="16"/>
            LEVERAGE
          </th>
          <th>
            <VIcon icon="tabler-bookmark-filled" size="16"/>
            MT5 GROUP
          </th>
          <th>
            <VIcon icon="tabler-bookmarks-filled me-1" size="16"/>
            CATEGORY
          </th>
          <th>
            NAME | EMAIL
          </th>
          <th>
            ASSIGNED RM
          </th>
          <th>
            VIEW
          </th>
        </tr>
        </thead>

        <tbody>
        <tr class="" v-for="user in mt5List" :key="user.id">

          <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
            <VChip size="x-small">
              #{{ user.id }}
            </VChip>
            <br/>
            {{ formatDateToMonthShort(user.created_at) }}
          </td>
          <td>
            <CustomMT5Chip :client_id="user.client_id" :mt_id="user.mt5_id" :is_wallet="user.is_wallet"/>
          </td>
          <td>
            1:{{ user.leverage }}
          </td>
          <td>
            {{ user.mt_group_name }}
          </td>
          <td>
            {{ user.category_name }}
          </td>

          <td>
            <VList class="card-list">
              <CustomClientCardChip :client_name="user.client_name" :client_id="user.client_id" :email="user.email"
                                    :client_pic="user.client_pic"
              ></CustomClientCardChip>
            </VList>
          </td>

          <td>
            <CustomStaffCardChip v-if="user.rm_name" :rm_name="user.rm_name" :rm_id="user.manager_id"/>
          </td>

          <td v-if="hasAccess('view_client_profile')">
            <VBtn
              color="secondary"
              size="x-small"
              variant="elevated"
              class="px-2 me-2 rounded"
              icon="tabler-address-book"
              @click="handleViewProfileClick(user.client_id)"
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
                       :length="Math.ceil(totalAccounts / itemsPerPage)"
          />
        </div>
      </VCardText>
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New User -->
    <AddNewClientDialog v-model:isDrawerOpen="isAddNewUserDrawerVisible"/>
  </section>
</template>
