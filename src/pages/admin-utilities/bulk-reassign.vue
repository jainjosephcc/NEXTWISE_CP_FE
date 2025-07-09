<script setup>

import { fetchStaffList, staffList } from '@/utils/apiUtils';
const client=ref(null);
const selectedRM=ref(null);
const selectedRMManager=ref(null);
const selectedAccountStatus=ref(null);
const selectedDepositStatus=ref(null);
const selectedIBStatus=ref(null);
const teamMember=ref(null);
const teamList=ref([]);
const toteamList=ref([]);
const team_list=ref('');
const allSelect=ref(false);
const selectedIds=ref([]);
const selectedManager=ref('')
const managerList=ref([]);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')

const ibStatusOptions=[
  {  text: 'Normal User', value: 0 },
  { text: 'Requested to be IB', value: 1 },
  {  text: 'Currently IB', value: 2 }
];

const depositStatus=[
  {  text: 'All', value: "" },
  { text: 'Not Deposited', value: 0 },
  {  text: 'Deposited', value: 1 }
];

const accountStatus=[
  {  text: 'All', value: "" },
  { text: 'Not Created Anything', value: 0 },
  {  text: 'Live Account Created', value: 1 },
  {  text: 'Only Demo Account Created', value: 2 }
];

onMounted(async () => {
  getmyTeamMembers();
  await fetchStaffList();
  managerList.value = staffList.value.map(staff => ({
    title: staff.staff_name,
    value: staff.id.toString() // Convert id to string to match your example
  }));
});

const getmyTeamMembers = async () => {
  try {
    const res = await $api('/getmyTeamMembers', {
      method: 'GET',
    });
    if (res) {
      teamMember.value=res;
      teamList.value = res.team_details;
      toteamList.value = res.team_details;
    }
    
  } catch (err) {
    console.error('Error fetching algo list:', err);
    error.value = err;
  }
}

const getSortedTeamClients = async () => {
    const res = await $api('/getmySortedTeamClients', {
        method: 'POST',
        body: {
            keyword: client.value,
            RM: selectedManager.value,
            deposit_status: selectedDepositStatus.value,
            mt_account_status:selectedAccountStatus.value,
            is_ib: selectedIBStatus.value
        },
        onResponseError({ response }) {
        },
    })
    team_list.value = res.client_details;
}

const rmOptions=[
  { text: 'Active', value: 1 },
  {  text: 'Inactive', value: 0 }
];


function onInput() {
  if (client.value.length >= 2) {
    getSortedTeamClients()
  }
}
function changeOptions(value){
  getSortedTeamClients()
}
function toggleSelectAll() {
  if (allSelect.value===true){
    selectedIds.value = team_list.value.map(team => team.id);
  }else{
  selectedIds.value = [];
  }
}
watch([selectedRM, selectedIBStatus, selectedDepositStatus, selectedAccountStatus], () => {
  getSortedTeamClients();
}, { deep: true, immediate: false });


function transferClient(){
  isConfirmDialogVisible.value = true;
}
const handleConfirm = async (confirmed) => {
    if (confirmed) {     
        try {
            const res = await $api('/updateClManager', {
                method: 'POST',
                body: {
                    old_manager_id:selectedManager.value ,
                    new_manager_id: selectedRMManager.value,
                    client_list:selectedIds.value
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Client Transfered Successfully !';
                isSuccessDialogVisible.value = true;
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isErrorDialogVisible.value = true;
        }
    }
}
const handlePageReload = async (confirmed) => {
  window.location.reload();
}

</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <VCol cols="12">
          <VCard>
            <VCardTitle>
              Client Reassign
            </VCardTitle>
          </VCard>
        </VCol>
        <VCol cols="6">
          <VCard>
            <h5 class="ms-5 pt-6">
              From
            </h5>
            <VRow class="mb-4">
              <VCol class="ms-3">
                <AppTextField v-model="client" label="CID/NAME/EMAIL/PHONE" :rules="[requiredValidator]" @input="onInput"/>
              </VCol>
              <!-- <VCol cols=12> -->
                <!-- 👉 Select ASSIGNED MANAGER -->
                  <CustomManagerSelectWidget v-model="selectedManager" />
          <!-- 👉 Select ASSIGNED MANAGER -->
              <!-- </VCol> -->
              <VCol cols="4" class="me-2" >
                <AppSelect v-model="selectedIBStatus" :items="ibStatusOptions" item-title="text" item-value="value" label="IB Status" single-line/>
              </VCol>
              <VCol cols="4" class="ms-3">
                <AppSelect v-model="selectedDepositStatus" :items="depositStatus" item-title="text" item-value="value" label="Deposit Status" single-line />
              </VCol>
              <VCol cols="4" class="me-3" >
                <AppSelect v-model="selectedAccountStatus" :items="accountStatus" item-title="text" item-value="value" label="MT Account Status" single-line />
              </VCol>
            </VRow>

            <VRow class="ms-3">
              <VTable v-if="team_list" height="800" class="text-no-wrap">
                <thead>
                    <tr>
                      <th>
                        <VCheckbox
                        v-model="allSelect"
                        @change="toggleSelectAll"
                      />

                      </th>
                      <th>
                        Name/Email
                      </th>
                      <th>
                          Phone
                      </th>
                      <th>
                          Joined On
                      </th>
                    </tr>
                     <!-- v-if="team_list" -->
                    <tr class="" v-for="team in team_list" :key="team.transaction_id">
                        <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
                            <VCheckbox v-model="selectedIds" :value=team.id />
                        </td>
                        <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
                            <CustomStaffCardChip :rm_id="team.id" :rm_name="team.client_name" :rm_email="team.email"/>
                        </td>
                        <td>
                          {{team.contact_no}}
                        </td>
                        <td>
                          {{ formatDateToMonthShort(team.joined_on) }}
                        </td>
                    </tr>
                    
                </thead>
              </VTable>
            </VRow> 
          </VCard>
        </VCol>
        <VCol cols="6">
          <VCard>
            <h5 class="ms-5 pt-6">
              To
            </h5>
            <VRow class="my-3 mx-3">
              <VCol cols="12">
                <AppSelect v-model="selectedRMManager" :items="managerList" item-title="title" item-value="value" label="To RM" single-line />
              </VCol>
            </VRow>
            <VBtn class="my-3 mx-4" :disabled="selectedIds ==[]|| selectedRMManager===null" @click="isConfirmDialogVisible = true">Update</VBtn>
          </VCard>
        </VCol>
      </VRow>
    </div>
    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Do you want to transfer client?" cancel-title="Cancelled"
                confirm-title="Cancelled!" />

    <VDialog v-model="isSuccessDialogVisible" max-width="500">
                <VCard>
                <VCardText class="text-center px-10 py-6">
                    <VBtn icon variant="outlined" color="success" class="my-4"
                        style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
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
            <VDialog v-model="isErrorDialogVisible" max-width="500">
                <VCard>
                <VCardText class="text-center px-10 py-6">
                    <VBtn icon variant="outlined" color="error" class="my-4"
                        style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
                    <span class="text-5xl font-weight-light">X</span>
                    </VBtn>
                    <h1 class="text-h4 mb-4">
                    {{ errorTitle }}
                    </h1>
                    <p>{{ errorMessage }}</p>
                    <VBtn color="success" @click="handlePageReload">
                    Ok
                    </VBtn>
                </VCardText>
                </VCard>
            </VDialog>
  </section>
</template>

<style scoped lang="scss">

</style>
