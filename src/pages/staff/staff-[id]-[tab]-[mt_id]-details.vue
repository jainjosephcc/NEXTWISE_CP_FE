<script setup>
import ClientListing from "@/components/staffDetails/ClientListing.vue"

const route = useRoute('apps-user-view-id')
const staff_id = ref(route.params.id);
const staffDetails=ref(null);
const staff_details=ref(null);
const crm_details=ref({});
const userTab = ref(null);

onMounted(async () => {
    fetchStaffDetails();
    fetchCrmData();
});
const fetchStaffDetails = async () => {
  try {
        const res = await $api(`/getStaffDetails/${staff_id.value}`, {
          method: 'GET',
          onResponseError({ response }) {
            console.error('Error response:', response);
          },
        });

        if (res ) {
        //   staff_details.value=res;
          staffDetails.value=res.staff_details[0];
        } else {
          console.error('Failed to fetch group list or empty response');
        }
      } catch (err) {
        console.error('Error fetching group list:', err);
      }
    };

const fetchCrmData = async () => {
  try {
        const res = await $api(`/getTeamCrmClientStatusData/${staff_id.value}`, {
          method: 'GET',
          onResponseError({ response }) {
            console.error('Error response:', response);
          },
        });

        if (res ) {
          crm_details.value=res;
        } else {
          console.error('Failed to fetch group list or empty response');
        }
      } catch (err) {
        console.error('Error fetching group list:', err);
      }
    };
const tabs = [
    {
        icon: 'tabler-dashboard',
        title: 'Dashboard',
    },
  {
    icon: 'tabler-users',
    title: 'Clients',
  },
    {
    icon: 'tabler-transaction-dollar',
    title: 'Transactions',
    },


    // {
    //     icon: 'tabler-bell',
    //     title: 'Notifications',
    // },
    // {
    //     icon: 'tabler-link',
    //     title: 'Connections',
    // },
]


</script>
<template>
    <CustomStaffDetailsHeader :staff_id="staff_id"/>
    <VRow>
        <VCol v-if="staffDetails" cols="12" md="3" lg="4">
          <StaffDetailsBioCard :staffDetails="staffDetails" :crm_details="crm_details" />
        </VCol>
      <VSkeletonLoader v-else v-for="i in 3" :key="i" type="article"/>
    
    <VCol cols="12" md="7" lg="8">
            <VTabs v-model="userTab" class="v-tabs-pill">
                <VTab v-for="tab in tabs" :key="tab.icon">
                    <VIcon :size="18" :icon="tab.icon" class="me-1" />
                    <span>{{ tab.title }}</span>
                </VTab>
            </VTabs>
            <VWindow v-model="userTab" class="mt-6 disable-tab-transition" :touch="false">
                <VWindowItem>
                  <TabStaffDashboard :staff-id="parseInt(staff_id)"/>
                </VWindowItem>
                <VWindowItem>
                    <ClientListing :staff-id="parseInt(staff_id)"/>
                </VWindowItem>
                <VWindowItem>
                    <StaffTransactionsData :staff-id="parseInt(staff_id)"/>
                </VWindowItem>
            </VWindow>
    </VCol>
</VRow>
</template>
