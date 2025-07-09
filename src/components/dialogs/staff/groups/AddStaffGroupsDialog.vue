<script setup>
import { defineEmits, defineProps, ref } from 'vue';


const groupname = ref('');
const selecteddescription = ref('');
const status = ref(null);

const isConfirmDialogVisible = ref(false);
const isMandotoryFilled = ref(null);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const isAddButtonLoading = ref(false);

let errorTitle = ref('');
let errorMessage = ref('');
let successTitle = ref('');
let successMessage = ref('');
const statusOptions = [
    { text: 'Active', value: 1 },
    { text: 'Inactive', value: 0 },
];

const props = defineProps({
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

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isAddButtonLoading.value = true;
        try {
            const res = await $api('/addStaffGroups', {
                method: 'POST',
                body: {
                    group_name: groupname.value,
                    description: selecteddescription.value,
                    status: status.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isAddButtonLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Group Created Successfully !';
                isAddButtonLoading.value = false;
                isSuccessDialogVisible.value = true;
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isAddButtonLoading.value = false;
            isErrorDialogVisible.value = true;
        }
    }
}

const handlePageReload = async (confirmed) => {
    window.location.reload();
}

function handleAddTeamSubmit() {
    if (groupname.value === null || selecteddescription.value === null || status.value === null) {
        isMandotoryFilled.value = false;
    }
    else {
        isMandotoryFilled.value = true;
        isConfirmDialogVisible.value = true;
    }
}


</script>
<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
        @update:model-value="dialogModelValueUpdate">
        <!-- Dialog close button -->
        <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
        <VCard class="pa-6 pa-sm-10">
            <div
                class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
                <div>
                    <div class="d-flex align-center app-logo">
                        <h6 class="app-logo-title">Add Groups</h6>
                    </div>
                </div>
            </div>
            <VForm @submit.prevent="() => { }">
                <VRow>
                    <VCol cols="12">
                        <AppTextField v-model="groupname" label="Group Name" :rules="[requiredValidator]" />
                    </VCol>
                    <VCol cols="12" md="12">
                        <AppTextarea v-model="selecteddescription" label="Description" persistent-placeholder
                            :rules="[requiredValidator]" />
                    </VCol>
                    <VCol cols="6">
                        <AppSelect v-model="status" :items="statusOptions" item-title="text" item-value="value"
                            label="Status" single-line :rules="[requiredValidator]" />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="6">
                        <VBtn class="me-2" color="primary" @click="handleAddTeamSubmit()" :loading="isAddButtonLoading">
                            Add
                        </VBtn>
                    </VCol>
                </VRow>
            </VForm>
            <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you sure you want to add this Group?" cancel-title="Cancelled"
                confirm-title="Confirmed!" />
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

        </VCard>
    </VDialog>
</template>

<style scoped>
/* Add custom styles here if needed */
</style>
