<script setup>
import { ref, watch } from 'vue';

// Define the reactive properties
const groupname = ref('');
const groupid = ref('');
const description = ref('');
const status = ref(null);
const isSubmitBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');
const groupNameError = ref(''); // Error message for group name
const statusOptions = [
    { text: 'Active', value: 1 },
    { text: 'Inactive', value: 0 },
];

// Predefined list of existing group names
const existingGroupNames = ['UG_SALES_EXECUTIVE', 'UG_KING', 'UG_OTHER'];

const props = defineProps({
    selectedGroup: {
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

// Watch for changes in selectedGroup prop
watch(() => props.selectedGroup, (newValue) => {
    if (newValue) {
        groupid.value = newValue.id !== undefined ? newValue.id : '';
        groupname.value = newValue.group_name !== undefined ? newValue.group_name : '';
        description.value = newValue.description !== undefined ? newValue.description : '';
        status.value = newValue.status !== undefined ? newValue.status : null;
    }
});

// Watch for changes in groupname to validate in real-time
watch(groupname, (newName) => {
    if (existingGroupNames.includes(newName) && newName.trim() !== '') {
        groupNameError.value = 'The group name has already been taken';
    } else {
        groupNameError.value = '';
    }
});

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        // Validate the group name before proceeding
        const isGroupNameValid = groupNameError.value === '';
        if (!isGroupNameValid) {
            isSubmitBtnLoading.value = false;
            return;
        }

        isSubmitBtnLoading.value = true;
        try {
            const res = await $api('/EditStaffGroups', {
                method: 'POST',
                body: {
                    groupId: groupid.value,
                    group_name: groupname.value,
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
                successMessage.value = 'Staff Group Updated Successfully!';
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
                    <div>
                        <div class="d-flex align-center app-logo">
                            <h6 class="app-logo-title">
                                Edit Group
                            </h6>
                        </div>
                    </div>
                </div>
                <VForm @submit.prevent="() => { }">
                    <VRow>
                        <VCol cols="12">
                            <AppTextField v-model="groupid" label="Group ID" disabled />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="groupname" label="Group Name" :error-messages="groupNameError"
                                :rules="[requiredValidator]" />
                        </VCol>
                        <VCol cols="12" md="12">
                            <AppTextarea v-model="description" label="Description" persistent-placeholder
                                :rules="[requiredValidator]" />
                        </VCol>
                        <VCol cols="6">
                            <AppSelect v-model="status" :items="statusOptions" item-title="text" item-value="value"
                                label="Status" single-line :rules="[requiredValidator]" />
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
                    confirmation-question="Are you sure you want to update the staff group?" cancel-title="Cancelled"
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
