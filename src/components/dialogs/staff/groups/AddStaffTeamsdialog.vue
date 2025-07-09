<script setup>
import CustomManagerSelectWidget from '@/components/CustomManagerSelectWidget.vue';
import { defineEmits, defineProps, onMounted, ref } from 'vue';

// Define reactive variables



const teamname = ref('');
const selectedmanager = ref(null);
const description = ref('');
const status = ref(null);
const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isMandotoryFilled = ref(null);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('');
let errorMessage = ref('');
let successTitle = ref('');
let successMessage = ref('');
// Define status options
const statusOptions = [
    { text: 'Active', value: 1 },
    { text: 'Inactive', value: 0 },
];

// Define props
const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
});

// Define emits
const emit = defineEmits([
    'submit',
    'update:isDialogVisible',
]);

// Function to update the dialog visibility
const dialogModelValueUpdate = (val) => {
    emit('update:isDialogVisible', val);
};




const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isApproveBtnLoading.value = true;

        try {
            const res = await $api('/addStaffTeams', {
                method: 'POST',
                body: {
                    team_name: teamname.value,
                    manager_id: selectedmanager.value,
                    description: description.value,
                    status: status.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isApproveBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Team Created Successfully !';
                isApproveBtnLoading.value = false;
                isSuccessDialogVisible.value = true;
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isApproveBtnLoading.value = false;
            isErrorDialogVisible.value = true;
        }
    }
}
const handlePageReload = async (confirmed) => {
    window.location.reload();
}

function handleAddTeamSubmit() {
    if (teamname.value === null || description.value === null || status.value === null) {
        isMandotoryFilled.value = false;
    }
    else {
        isMandotoryFilled.value = true;
        isConfirmDialogVisible.value = true;
    }
}


// Fetch data when component is mounted
onMounted(async () => {

});
</script>

<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
        @update:model-value="dialogModelValueUpdate">
        <!-- Dialog close button -->
        <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
        <VCard class="pa-6 pa-sm-10">
            <div
                class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
                <!-- Left Content -->
                <div>
                    <div class="d-flex align-center app-logo">
                        <h6 class="app-logo-title">
                            Add Teams
                        </h6>
                    </div>
                </div>
            </div>

            <VForm @submit.prevent="() => { }">
                <VRow>
                    <VCol cols="12">
                        <AppTextField v-model="teamname" label="Team Name" :rules="[requiredValidator]" />
                    </VCol>

                    <CustomManagerSelectWidget v-model="selectedmanager" />

                    <VCol cols="12" md="12">
                        <AppTextarea v-model="description" label="Description" persistent-placeholder
                            :rules="[requiredValidator]" />
                    </VCol>
                    <VCol cols="6">
                        <AppSelect v-model="status" :items="statusOptions" item-title="text" item-value="value"
                            label="Status" single-line :rules="[requiredValidator]" />
                    </VCol>
                </VRow>
                <p v-if="isMandotoryFilled === false" class="text-body-2 pt-3 pb-0 mb-3 text-error">All fields are
                    mandatory</p>
                <VRow>
                    <VCol cols="6">
                        <VBtn class="me-2" color="primary" @click="handleAddTeamSubmit()"
                            :loading="isApproveBtnLoading">
                            Add
                        </VBtn>
                    </VCol>
                </VRow>
            </VForm>
            <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you sure you want to add this team?" cancel-title="Cancelled"
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
