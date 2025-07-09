<script setup>
import CustomStaffCardChip from "@/components/CustomStaffCardChip.vue";
import { computed, onMounted, ref, watch } from "vue";

// Reactive references to store data and errors
const headerData = ref({ total_staff: 0, managers: 0, rms: 0, total_clients: 0 });
const MtargetData = ref([]);
const currentDate = new Date();
const initialDate = `${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}`;
const date = ref(initialDate);
const formattedStaffList = ref([]);
const staff_list = ref([]);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('');
let errorMessage = ref('');
let successTitle = ref('');
let successMessage = ref('');

// Function to fetch data from the API getTotalStaff
const fetchHeaderData = async () => {
  try {
    const res = await $api('/getTotalStaff', {
      method: 'GET',
    });
    headerData.value.total_staff = res.all_staff_count;
    headerData.value.total_clients = res.total_clients;
    headerData.value.rms = res.relationship_manager_count;
    headerData.value.managers = res.managers_count;
  } catch (error) {
    console.error('Error fetching header data:', error);
  }
};

// Function to fetch data from the API getMonthlyTargetData for a specific date
const fetchSpecificMonthlyTarget = async () => {
  try {
    if (!date.value) {
      console.warn('No date selected.');
      return;
    }

    const selectedDate = new Date(date.value);
    const formattedDate = `${selectedDate.getFullYear()}-${('0' + (selectedDate.getMonth() + 1)).slice(-2)}`;

    const res = await $api(`/getMonthlyTargetData/${formattedDate}`, {
      method: 'GET',
    });
    if (res) {
      MtargetData.value = res.staff_data || [];
    } else {
      console.warn('Monthly target data not found:', res);
    }
  } catch (error) {
    console.error('Error fetching specific monthly target data:', error);
  }
};

// Watch the date value to fetch data when it changes
watch(date, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    fetchSpecificMonthlyTarget();
  }
}, { immediate: true }); // Trigger immediately on mount

// Calling function
onMounted(() => {
  fetchHeaderData();
});

// Computed property to format table data
const formattedMtargetData = computed(() => {
  return MtargetData.value ? MtargetData.value.map(item => ({
    id: item.id,
    staff_name: item.staff_name,
    email: item.email,
    role: item.role,
    team: item.team,
    year: item.year,
    target: item.target,
    month: item.month
  })) : [];
});

const widgetData = computed(() => [
  {
    title: 'Total Staff',
    value: headerData.value.total_staff.toString(),
    change: 29, desc: 'Active Registered Clients', icon: 'tabler-users', iconColor: 'primary'
  },
  {
    title: 'Managers',
    value: headerData.value.managers.toString(),
    change: 18, desc: 'Introducing Brokers', icon: 'tabler-chart-arrows-vertical', iconColor: 'warning'
  },
  {
    title: 'Relationship Managers',
    value: headerData.value.rms,
    desc: 'Approved Deposits', icon: 'tabler-brand-cashapp', iconColor: 'success'
  },
  {
    title: 'Total Clients',
    value: headerData.value.total_clients,
    desc: 'Approved Withdrawals', icon: 'tabler-database-minus', iconColor: 'danger'
  },
]);

// Function to update the monthly target data
const handleConfirm = async () => {
  try {
    if (!date.value) {
      console.warn('No date selected.');
      return;
    }

    const selectedDat = new Date(date.value); // assuming date.value is a valid date string
    const formattedDate = `${selectedDat.getFullYear()}-${('0' + (selectedDat.getMonth() + 1)).slice(-2)}`;

    const payload = {
      date: formattedDate,
      staff_list: MtargetData.value.map(item => ({
        id: item.id,
        staff_name: item.staff_name,
        profile_pic: item.profile_pic || "default_staff_image.png",
        email: item.email,
        role: item.role,
        team: item.team,
        target: item.target,
        month: item.month,
        year: item.year
      }))
    };

    const res = await $api('/updateMonthlyTarget', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res) {
      successTitle.value = 'Updated !';
      successMessage.value = 'Monthly target data updated successfully !';
      isSuccessDialogVisible.value = true;
    } else {
      errorTitle.value = 'Something Went Wrong !';
      isErrorDialogVisible.value = true;
    }
  } catch (error) {
    errorTitle.value = 'Something Went Wrong !';
    errorMessage.value = error.message || 'An error occurred.';
    isErrorDialogVisible.value = true;
    console.error('Error updating monthly target data:', error);
  }
};

const handlePageReload = async (confirmed) => {
  window.location.reload();
};
</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <template v-for="(data, id) in widgetData" :key="id">
          <VCol cols="12" md="3" sm="6">
            <VCard>
              <VCardText>
                <div class="d-flex justify-space-between">
                  <div class="d-flex flex-column gap-y-1">
                    <div class="text-body-1 text-high-emphasis">
                      {{ data.title }}
                    </div>
                    <div class="d-flex gap-x-2 align-center">
                      <h5 class="text-h5">
                        {{ data.value }}
                      </h5>
                      <div v-if="data.change" class="text-base"
                        :class="data.change > 0 ? 'text-success' : 'text-error'">
                        ({{ prefixWithPlus(data.change) }}%)
                      </div>
                    </div>
                    <div class="text-sm">
                      {{ data.desc }}
                    </div>
                  </div>
                  <VAvatar :color="data.iconColor" variant="tonal" rounded size="42">
                    <VIcon :icon="data.icon" size="26" />
                  </VAvatar>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </template>
      </VRow>
    </div>

    <VCard>
      <!-- 👉 Select Month & Year -->
      <div class="d-flex align-center justify-space-between">
        <div class="mb-2">
          <VCardTitle>
            Staff Target Configurations
          </VCardTitle>
          <VCardSubtitle class="pb-3">Month & Year</VCardSubtitle>
          <AppDateTimePicker class="ms-2" v-model="date" label="" placeholder="Select date"
            :config="{ dateFormat: 'F, Y', view: 'month-year' }" clearable clear-icon="tabler-x" />
        </div>
        <div>
          <VBtn class="me-2" @click="isConfirmDialogVisible = true">UPDATE</VBtn>
        </div>
      </div>

      <VDivider />
      <VTable v-if="MtargetData.length > 0" height="800" class="text-no-wrap">
        <thead>
          <tr>
            <th>#ID</th>
            <th>Name/Email</th>
            <th>Team</th>
            <th>Role</th>
            <th>Month & Year</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in MtargetData" :key="index">
            <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
              <VChip size="x-small">
                {{ item.id }}
              </VChip>
            </td>
            <td>
              <CustomStaffCardChip :rm_name="item.staff_name" :rm_id="item.id" :rm_email="item.email" />
            </td>
            <td>{{ item.team }}</td>
            <td>{{ item.role }}</td>
            <td>{{ item.month }} {{ item.year }}</td>
            <td>
              <AppTextField v-model="item.target" suffix="USD" placeholder="target" />
            </td>
          </tr>
        </tbody>
      </VTable>

      <VSkeletonLoader v-else-if="MtargetData.length === 0" v-for="i in 3" :key="i" type="table-tbody" />
      <p v-else>No data available</p>
    </VCard>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
      confirmation-question="Do you want to update staff target?" cancel-title="Cancelled" confirm-title="Cancelled!" />

    <VDialog v-model="isErrorDialogVisible" max-width="500">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VBtn icon variant="outlined" color="error" class="my-4"
            style="block-size: 88px;inline-size: 88px; pointer-events: none;">
            <span class="text-5xl font-weight-light">X</span>
          </VBtn>
          <h1 class="text-h4 mb-4">
            {{ errorTitle }}
          </h1>
          <p>{{ errorMessage }}</p>
          <VBtn color="success" @click="handlePageReload">
            OK
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <VDialog v-model="isSuccessDialogVisible" max-width="500">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VBtn icon variant="outlined" color="success" class="my-4"
            style="block-size: 88px;inline-size: 88px; pointer-events: none;">
            <VIcon icon="tabler-check" size="38" />
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
  </section>
</template>

<style scoped>
/* Add any custom styles here */
</style>
