<script setup>
const staffName=ref(null);
const staffEmail=ref(null);
const staffContact=ref(null);
const selectedGroup=ref(null);
const selectedTeam=ref(null);
const selectedRole=ref(null);
const teamList=ref(null);
const groupList=ref(null);
const roleList=ref(null);
const staffid=ref(null);
const isApproveBtnLoading=ref(false);
const isMandotoryFilled=ref(null);
const isConfirmDialogVisible = ref(false);
let successTitle = ref('')
let successMessage = ref('')
let errorTitle = ref('')
let errorMessage = ref('')
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const isLoading=ref(false)

onMounted(async () => {
  await getTeamList();
  await getGroupList();
  await getRoleList();
});


const props = defineProps({
staffDetails: {
    type: Object,
    required: true,
    
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
]);

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}
watch(
      () => props.staffDetails,
      (staff) => {
        if (staff) {
          staffid.value = staff.id || '';
          staffName.value = staff.staff_name || '';
          staffEmail.value = staff.email || '';
          staffContact.value = staff.contact_no || '';
          selectedTeam.value = staff.team_id || null;
          selectedGroup.value = staff.group_id || null;
          selectedRole.value = staff.role_id || null;
        }
      },
      { immediate: true }
    );


const getTeamList = async () => {
  try {
    const res = await $api('/getStaffTeams', {
      method: 'GET',
    });
    if (res) {
      teamList.value=res.teams;
    }

  } catch (err) {
    console.error('Error fetching group category:', err);
    error.value = err;
  }
}
const getGroupList = async () => {
  try {
    const res = await $api('/getStaffGroups', {
      method: 'GET',
    });
    if (res) {
      groupList.value=res.groups;
    }

  } catch (err) {
    console.error('Error fetching group category:', err);
    error.value = err;
  }
}
const getRoleList = async () => {
  try {
    const res = await $api('/getStaffRoles', {
      method: 'GET',
    });
    if (res) {
      roleList.value=res.roles;
    }

  } catch (err) {
    console.error('Error fetching group category:', err);
    error.value = err;
  }
}
function handleEditSubmit(){
     if (staffName.value===null || staffEmail.value===null || staffContact.value===null ||selectedGroup.value===null ||selectedRole.value ===null ){
     isMandotoryFilled.value=false;
    }
    else{
        isMandotoryFilled.value=true;
        isConfirmDialogVisible.value=true;
    }
}

const handleConfirm = async (confirmed) => {
    if (confirmed) {   
      isApproveBtnLoading.value=true    
        try {
            const res = await $api('/EditStaffUser', {
                method: 'POST',
                body: {
                    userId:staffid.value,
                    role_id:selectedRole.value,
                    group_id:selectedGroup.value,
                    team_id:selectedTeam.value,
                    contact_no: staffContact.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isErrorDialogVisible.value = true;
                    isApproveBtnLoading.value=false
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Details Updated Successfully !';
                isSuccessDialogVisible.value = true;
                isApproveBtnLoading.value=false
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isErrorDialogVisible.value = true;
            isApproveBtnLoading.value=false
        }

    }
}
const handlePageReload = async (confirmed) => {
  window.location.reload();
}


</script>
<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
    <VCard class="pa-6 pa-sm-10">
      <div class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
        <!-- 👉 Left Content -->
        <div>
          <div class="d-flex align-center app-logo ">
            <h6 class="app-logo-title">
              Edit Staff Details
            </h6>
          </div>
        </div>
      </div>
      <VForm @submit.prevent="() => {}">
        <VRow>
          <VCol cols="6">
            <AppTextField v-model="staffName" label="Name" readonly/>
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="staffEmail" label="Email" readonly/>
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="staffContact" label="Contact No" />
          </VCol>
          <VCol cols="6">
            <AppSelect v-model="selectedTeam" :items="teamList" item-title="team_name" item-value="id" label="Team" single-line/>
          </VCol>
          <VCol cols="6">
            <AppSelect v-model="selectedGroup" :items="groupList" item-title="group_name" item-value="id" label="Group" single-line/>
          </VCol>
          <VCol cols="6">
            <AppSelect v-model="selectedRole" :items="roleList" item-title="role_name" item-value="id" label="Role" single-line/>
          </VCol>
          <p v-if="isMandotoryFilled===false" class="text-body-2 pt-3 pb-0 mb-3 text-error" >All fields are mandatory</p>
        </VRow>
        <VRow>
          <VCol cols="6" class="mt-5">
            <VBtn class="me-2" :loading="isApproveBtnLoading" :disabled="isApproveBtnLoading" color="primary" @click="handleEditSubmit">
                        Submit
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
    </VDialog>
    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you want to update staff details?" cancel-title="Cancelled"
                confirm-title="Cancelled!" />

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
</template>
