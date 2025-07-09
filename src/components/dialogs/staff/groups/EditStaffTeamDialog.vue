<script setup>
import { computed, ref, watch } from 'vue';

// Define the reactive properties
const teamname = ref('');
const teamid = ref('');
const description = ref('');

const selectedmanager = ref(null);

const status = ref(null);
const isSubmitBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');
const statusOptions = [
    { text: 'Active', value: 1 },
    { text: 'Inactive', value: 0 },
];

// Example list of existing team names
const existingTeamNames = ref(['Team _kamal', 'Team_Sapna', 'Team_ kapil', 'Team _kamal']);

const props = defineProps({
    selectedTeam: {
        type: Object,
        required: false,
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

const dialogModelValueUpdate = (val) => {
    emit('update:isDialogVisible', val);
};

// Watch for changes in the selected team and update form fields
watch(() => props.selectedTeam, (newValue) => {
    if (newValue) {
        teamid.value = newValue.id;
        teamname.value = newValue.team_name;

        description.value = newValue.description;
        status.value = newValue.status;
    }
});





// Check if the team name already exists
const isTeamNameTaken = computed(() => {
    return existingTeamNames.value.includes(teamname.value);
});

// Handle confirmation dialog and submit form
const handleConfirm = async (confirmed) => {
    if (confirmed) {
        if (isTeamNameTaken.value) {
            errorTitle.value = 'Validation Error';
            errorMessage.value = 'The Team name has already been taken.';
            isErrorDialogVisible.value = true;
            return;
        }
        isSubmitBtnLoading.value = true;
        try {
            const res = await $api('/EditStaffTeams', {
                method: 'POST',
                body: {
                    teamId: teamid.value,
                    team_name: teamname.value,
                    manager_id: selectedmanager.value, // Use the selected manager ID
                    description: description.value,
                    status: status.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong!';
                    errorMessage.value = response._data.message;
                    isSubmitBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            });
            if (res) {
                successTitle.value = 'Updated!';
                successMessage.value = 'Staff Team Updated Successfully!';
                isSubmitBtnLoading.value = false;
                isSuccessDialogVisible.value = true;
            }
        } catch (Ex) {
            errorTitle.value = 'Something Went Wrong!';
            errorMessage.value = Ex.data.message;
            isSubmitBtnLoading.value = false;
            isErrorDialogVisible.value = true;
        }
    }
};

// Reload the page or update data as needed
const updateData = () => {
    window.location.reload();
};
</script>


<template>
    <section>
        <!-- Edit Modal -->
        <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
            @update:model-value="dialogModelValueUpdate">
            <!-- Dialog close btn -->
            <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
            <VCard class="pa-6 pa-sm-10">
                <div
                    class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
                    <!-- 👉 Left Content -->
                    <div>
                        <div class="d-flex align-center app-logo ">
                            <h6 class="app-logo-title">
                                Edit Team
                            </h6>
                        </div>
                    </div>
                </div>
                <VForm @submit.prevent="() => { }">
                    <VRow>
                        <VCol cols="12">
                            <AppTextField v-model="teamid" label="Team Id" disabled />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="teamname" label="Team Name" :rules="[requiredValidator]"
                                :error-messages="isTeamNameTaken ? ['The group name has already been taken.'] : []" />
                        </VCol>
                        <VCol cols="12" md="12">
                            <AppTextarea v-model="description" label="Description" persistent-placeholder
                                :rules="[requiredValidator]" />
                        </VCol>
                        <VCol cols="12">
                            <CustomManagerSelectWidget v-model="selectedmanager" />
                        </VCol>
                        <VCol cols="6">
                            <AppSelect v-model="status" :items="statusOptions" item-title="text" item-value="value"
                                label="Status" single-line />
                        </VCol>
                    </VRow>
                    <VRow>
                        <VCol cols="6">
                            <VBtn class="me-2" :loading="isSubmitBtnLoading" color="primary"
                                @click="isConfirmDialogVisible = true">
                                Update
                            </VBtn>
                        </VCol>
                    </VRow>
                </VForm>
                <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                    confirmation-question="Are you sure you want to update the staff Team?" cancel-title="Cancelled"
                    confirm-title="Confirmed!" />
            </VCard>
        </VDialog>
        <VDialog v-model="isSuccessDialogVisible" max-width="500">
            <VCard>
                <VCardText class="text-center px-10 py-6">
                    <VBtn icon variant="outlined" color="success" class="my-4"
                        style="block-size: 88px; inline-size: 88px; pointer-events: none;">
                        <VIcon icon="tabler-check" size="38" />
                    </VBtn>
                    <h1 class="text-h4 mb-4">
                        {{ successTitle }}
                    </h1>
                    <p>{{ successMessage }}</p>
                    <VBtn color="success" @click="updateData">
                        OK
                    </VBtn>
                </VCardText>
            </VCard>
        </VDialog>
        <VDialog v-model="isErrorDialogVisible" max-width="500">
            <VCard>
                <VCardText class="text-center px-10 py-6">
                    <VBtn icon variant="outlined" color="error" class="my-4"
                        style="block-size: 88px; inline-size: 88px; pointer-events: none;">
                        <span class="text-5xl font-weight-light">X</span>
                    </VBtn>
                    <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
                    <p>{{ errorMessage }}</p>
                    <VBtn color="success" @click="updateData">
                        Ok
                    </VBtn>
                </VCardText>
            </VCard>
        </VDialog>
    </section>
</template>
