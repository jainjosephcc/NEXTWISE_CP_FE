<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import AddNewUserDrawer from "@/views/apps/user/list/AddNewUserDrawer.vue"
import { getWithExpiry } from "@/utils/storageUtils.js"
import { fetchCountryList, fetchHeaderData, headerData,country_list,countryList } from '@/utils/apiUtils'
import {fetchStaffList,staffList,manager_list} from "@/utils/apiUtils"
import AddNewClientDialog from "@/components/dialogs/client/AddNewClientDialog.vue"

// Reactive state definitions
const searchQuery = ref('');
const selectedMTStatus = ref(null);
const selectedDepositStatus = ref(null);
const selectedDocStatus = ref(null);
const selectedManager = ref(null);
const selectedCountry = ref(null);
const selectedIBStatus = ref(null);


const props = defineProps({
  staffId: {
    type: Number,
    required: true,
  },
})



const mt_status_list = [
  { title: 'All', value: null },
  { title: 'Account Not Created', value: '0' },
  { title: 'Live Account Created', value: '1' },
  { title: 'Demo Account Created', value: '2' },
];
const deposit_status_list = [
  { title: 'All', value: null },
  { title: 'Deposited', value: '1' },
  { title: 'Not Deposited', value: '1' },
];
const document_status_list = [
  { title: 'All', value: null },
  { title: 'Upload Pending', value: '0' },
  { title: 'Approved', value: '3' },
  { title: 'Rejected', value: '2' },
  { title: 'Verification Pending', value: '1' },
];
const ib_status_list = [
  { title: 'All', value: null },
  { title: 'Normal User', value: '0' },
  { title: 'IB Requested', value: '1' },
  { title: 'Active IB', value: '2' },
];




const itemsPerPage = ref(25);
const page = ref(1);
const sortBy = ref(null);
const orderBy = ref(null);
const usersData = ref(null);

//FETCH CLIENT LIST
const fetchUsers = async () => {
  usersData.value = null;
  const res = await $api('/client/sorted-list', {
    method: 'POST',
    body: {
      keyword: searchQuery.value,
      page: page.value,
      RM: props.staffId,
      mt_account_status: selectedMTStatus.value,
      deposit_status: selectedDepositStatus.value,
      document_status: selectedDocStatus.value,
      country: selectedCountry.value,
      is_ib: selectedIBStatus.value
    },
    onResponseError({ response }) {
      console.log(response);
      // errors.value = response._data.message
    },
  })
  usersData.value = res;

}


const users = computed(() => usersData.value?.result.client_details.data || []);
const totalUsers = computed(() => usersData.value?.result.client_details.total || 0);


// Call API on mounted



onMounted(async () => {
  fetchStaffList();
  fetchCountryList();
  fetchUsers();
});

// Watching sort options to refetch data
watch([page, itemsPerPage, selectedMTStatus, selectedDepositStatus, selectedDocStatus, selectedManager, selectedCountry, selectedIBStatus, searchQuery, sortBy, orderBy], () => {
  fetchUsers();
}, { deep: true, immediate: false });


watchEffect(() => {

});


// Resolving UI variants
const resolveUserRoleVariant = (role) => {
  const variants = {
    subscriber: { color: 'success', icon: 'tabler-user' },
    author: { color: 'error', icon: 'tabler-device-desktop' },
    maintainer: { color: 'info', icon: 'tabler-chart-pie' },
    editor: { color: 'warning', icon: 'tabler-edit' },
    admin: { color: 'primary', icon: 'tabler-crown' },
  };
  return variants[role.toLowerCase()] || { color: 'primary', icon: 'tabler-user' };
};

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
const isAddNewUserDrawerVisible = ref(false);

// CRUD Operations

</script>


<template>
  <section>
    <!-- 👉 Widgets -->

    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <!-- 👉 Select MT ACCOOUNT -->
          <VCol cols="12" sm="3">
            <AppSelect label="MT Account Status" v-model="selectedMTStatus" placeholder="MT Account Status"
                       :items="mt_status_list" clearable clear-icon="tabler-x" />
          </VCol>
          <!-- 👉 Select DEPOSIT STATUS -->
          <VCol cols="12" sm="3">
            <AppSelect v-model="selectedDepositStatus" label="Deposit Status" placeholder="Deposit Status"
                       :items="deposit_status_list" clearable clear-icon="tabler-x" />
          </VCol>
          <!-- 👉 Select DOCUMENT STATUS -->
          <VCol cols="12" sm="3">
            <AppSelect v-model="selectedDocStatus" label="Document Status" placeholder="Document Status"
                       :items="document_status_list" clearable clear-icon="tabler-x" />
          </VCol>

          <!-- 👉 Select Country -->
          <VCol v-if="country_list && country_list.length > 2" cols="12" sm="3">
            <AppSelect v-model="selectedCountry" label="Country" placeholder="Country" :items="country_list" clearable
                       clear-icon="tabler-x" />
          </VCol>
          <!-- 👉 Select Country -->
          <VCol cols="12" sm="3">
            <AppTextField v-model="searchQuery" label="Search User by Name/Email" placeholder="Search User" />
          </VCol>
          <VCol cols="12" sm="3">
            <AppSelect v-model="selectedIBStatus" label="IB Status" placeholder="IB Status" :items="ib_status_list"
                       clearable clear-icon="tabler-x" />
          </VCol>
        </VRow>
      </VCardText>


      <VDivider />
      <VTable v-if="usersData" height="800" class="text-no-wrap">
        <thead>
        <tr>
          <th>
            ID/DOJ
          </th>
          <th>
            NAME/EMAIL
          </th>
          <th>
            <VIcon icon="tabler-sum me-1" size="16" />DEPOSIT
          </th>
          <th>
            <VIcon icon="tabler-sum me-1" size="16" />WITHDRAW
          </th>
          <th>
            IS IB ?
          </th>
          <th>
            VIEW
          </th>
        </tr>
        </thead>

        <tbody>
        <tr class="" v-for="user in users" :key="user.id">

          <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
            <VChip size="x-small">
              #{{ user.id }}
            </VChip><br />
            {{ formatDateToMonthShort(user.joined_on) }}
          </td>

          <td>
            <VList class="card-list">
              <RouterLink :to="`/client/client-${user.id}-home-null-details`">
                <VListItem>
                  <VListItemTitle class="font-weight-medium">
                    <CustomClientCardChip :client_name="user.client_name" :client_id="user.id" :email="user.email" :client_pic="user.client_pic"></CustomClientCardChip>
                  </VListItemTitle>
                  <template v-if="user.email_verified === 1" #append>
                    <VIcon color="success" size="16" icon="tabler-mail-check" />
                  </template>
                </VListItem>
              </RouterLink>
            </VList>
          </td>
          <td>
            {{ formatCurrency(user.deposit) }}
          </td>
          <td>
            {{ formatCurrency(user.withdraw) }}
          </td>
          <td>
            <VList class="card-list">
              <VListItem>
                <VListItemTitle v-if="user.is_ib == 2" class="font-weight-medium">
                  <span style="font-size: 12px;">IB PROFILE</span>
                </VListItemTitle>
                <VListItemTitle v-if="user.is_ib == 1" class="font-weight-medium">
                  <span style="font-size: 12px;">IB REQUESTED</span>
                </VListItemTitle>
                <template v-if="user.ib_id || user.is_ib != 0" #prepend>
                  <VAvatar color="secondary"
                           :class="{ 'bg-light-success': user.is_ib === 2, 'bg-light-warning': user.is_ib === 1 }"
                           variant="outlined" rounded size="30">
                    <small>IB</small>
                  </VAvatar>
                </template>
                <RouterLink :to="`/client/client-${user.ib_id}-home-null-details`">
                  <VListItemSubtitle>
                    <div v-if="user.ib_name" class="text-base" style="font-size: 12px;">Parent : {{ user.ib_name }}
                    </div>
                  </VListItemSubtitle>
                </RouterLink>


              </VListItem>
            </VList>
          </td>

          <!-- <td>
            {{ user.contact_no }}
          </td> -->
          <td>
            <RouterLink :to="`/client/client-${user.id}-home-null-details`">
              <VIcon icon="tabler-eye me-2" />
            </RouterLink>

          </td>

        </tr>
        </tbody>
      </VTable>
      <VSkeletonLoader v-else
                       v-for="i in 3"
                       :key="i"
                       type="table-tbody"
      />
      <VCardText class="pt-2">
        <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">


          <VPagination v-model="page" :total-visible="$vuetify.display.smAndDown ? 3 : 5"
                       :length="Math.ceil(totalUsers / itemsPerPage)" />
        </div>
      </VCardText>
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New User -->
    <AddNewClientDialog
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      @user-data="addNewUser"
    />
  </section>
</template>
