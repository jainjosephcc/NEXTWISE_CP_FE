<script setup>
import { ref, watch } from 'vue';

const title = ref(null);
const company = ref(null);
const selectedStatus = ref(null);
const apiUrl = ref('');
const serverType = ref("MT5");
const sslEnabled = ref(false);
const managerId = ref(null);
const description = ref('');
const serverIp = ref('');
const serverPort = ref('');

const isMandatoryFilled = ref(null);
const isSubmitBtnDisable = ref(false);
const isSubmitBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');

const SERVER_NAME = import.meta.env.VITE_SERVER_NAME

const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    selectedServer: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits([
    'submit',
    'update:isDialogVisible',
]);

// Function to load existing server data if in edit mode
const loadExistingData = () => {
    if (props.selectedServer) {
        title.value = props.selectedServer.server_name;
        company.value = props.selectedServer.company_name;
        selectedStatus.value = props.selectedServer.status;
        apiUrl.value = props.selectedServer.api_url;
        serverType.value = props.selectedServer.server_type;
        serverIp.value = props.selectedServer.server_ip;
        serverPort.value = props.selectedServer.server_port;
        sslEnabled.value = props.selectedServer.ssl_enabled;
        managerId.value = props.selectedServer.manager_id;
        description.value = props.selectedServer.description;
    }
};

// Watch for dialog visibility changes to load data
watch(() => props.isDialogVisible, (newVal) => {
    if (newVal) {

        loadExistingData(); // Load data when dialog opens
    }
});

const closeDialog = () => {
    emit('update:isDialogVisible', false);
};

function handleAddDetailsSubmit() {
    if (title.value === null || selectedStatus.value === null || apiUrl.value === null ||
        serverType.value === null || managerId.value === null || description.value === '' ||
        serverIp.value === '' || serverPort.value === null) {
        isMandatoryFilled.value = false;
    } else {
        isMandatoryFilled.value = true;
        isConfirmDialogVisible.value = true;
    }
}

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isSubmitBtnLoading.value = true;
        isSubmitBtnDisable.value = true;
        try {
            const endpoint = props.selectedServer ? '/meta-servers/update' : '/meta-servers/store'; // Determine endpoint based on edit or add
            const res = await $api(endpoint, {
                method: 'POST',
                body: {
                    id: props.selectedServer ? props.selectedServer.id : null, // Pass ID if editing
                    company_name: company.value,
                    server_name: title.value,
                    server_ip: serverIp.value,
                    server_port: serverPort.value,
                    api_url: apiUrl.value,
                    server_type: serverType.value,
                    ssl_enabled: sslEnabled.value,
                    manager_id: managerId.value,
                    status: selectedStatus.value,
                    description: description.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong!';
                    errorMessage.value = response._data.message;
                    isSubmitBtnLoading.value = false;
                    isSubmitBtnDisable.value = false;
                    isErrorDialogVisible.value = true;
                },
            });
            if (res) {
                successTitle.value = 'Success!';
                successMessage.value = props.selectedServer ? 'Server details updated successfully!' : 'Server added successfully!';
                isSubmitBtnLoading.value = false;
                isSubmitBtnDisable.value = false;
                isSuccessDialogVisible.value = true;
            }
        } catch (Ex) {
            errorTitle.value = 'Something Went Wrong!';
            errorMessage.value = Ex.data.message;
            isSubmitBtnLoading.value = false;
            isSubmitBtnDisable.value = false;
            isErrorDialogVisible.value = true;
        }
    }
};

const handlePageReload = () => {
    window.location.reload();
}

const levelOption = [
    { text: 'Active', value: true },
    { text: 'Inactive', value: false },
];

watch([title], () => {
    if (title.value && title.value.length >= 30) {
        title.value = title.value.slice(0, 30);
    }
}, { deep: true, immediate: false });
</script>

<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" v-model="props.isDialogVisible">
        <DialogCloseBtn @click="closeDialog" />
        <VCard class="pa-6 pa-sm-10">
            <div
                class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
                <div>
                    <div class="d-flex align-center app-logo">
                        <h6 class="app-logo-title">Edit Server Details</h6> <!-- Change title here -->
                    </div>
                </div>
            </div>
            <VForm @submit.prevent="() => { }">
                <VRow>
                    <VCol cols="6">
                        <!-- <AppTextField v-model="company" label="Company Name" maxlength="30" /> -->
                        <AppTextField v-if="!props.selectedServer" v-model="title" label="Company Name"
                            maxlength="30" />
                        <AppTextField v-else :model-value="SERVER_NAME" label="Company Name" maxlength="30" disabled />
                    </VCol>
                    <VCol cols="6">
                        <AppTextField v-if="!props.selectedServer" v-model="title" label="Server Name" maxlength="30" />
                        <AppTextField v-else :model-value="SERVER_NAME" label="Server Name" maxlength="30" disabled />
                    </VCol>
                    <VCol cols="6">
                        <AppSelect v-model="selectedStatus" :items="levelOption" item-title="text" item-value="value"
                            label="Status" single-line />
                    </VCol>
                    <VCol cols="6">
                        <AppTextField v-model="apiUrl" label="API URL" />
                    </VCol>
                    <VCol cols="6">
                        <AppTextField v-model="serverType" label="Server Type" disabled />
                    </VCol>
                    <VCol cols="6">
                        <AppTextField v-model="serverIp" label="Server IP" />
                    </VCol>
                    <VCol cols="6">
                        <AppTextField v-model="serverPort" label="Server Port" type="number" />
                    </VCol>
                    <VCol cols="6">
                        <AppTextField v-if="!props.selectedServer" v-model="managerId" label="Manager Id"
                            type="number" />
                        <AppTextField v-else :model-value="'--'" label="Manager Id" disabled />
                    </VCol>

                    <VCol cols="12">
                        <AppTextField v-model="description" label="Description" />
                    </VCol>
                </VRow>
                <p v-if="isMandatoryFilled === false" class="text-body-2 pt-3 pb-0 mb-3 text-error">All fields are
                    mandatory</p>
                <VRow>
                    <VCol cols="6">
                        <VBtn class="me-2" color="primary" @click="handleAddDetailsSubmit()"
                            :loading="isSubmitBtnLoading" :disabled="isSubmitBtnDisable">
                            Submit
                        </VBtn>
                    </VCol>
                </VRow>
            </VForm>
        </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
        confirmation-question="Are you sure you want to update this server data?" cancel-title="Cancelled"
        confirm-title="Confirm" />

    <VDialog v-model="isSuccessDialogVisible" max-width="500">
        <VCard>
            <VCardText class="text-center px-10 py-6">
                <VBtn icon variant="outlined" color="success" class="my-4"
                    style="block-size: 88px; inline-size: 88px; pointer-events: none;">
                    <VIcon icon="tabler-check" size="38" />
                </VBtn>
                <h1 class="text-h4 mb-4">{{ successTitle }}</h1>
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
                    style="block-size: 88px; inline-size: 88px; pointer-events: none;">
                    <span class="text-5xl font-weight-light">X</span>
                </VBtn>
                <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
                <p>{{ errorMessage }}</p>
                <VBtn color="success" @click="handlePageReload">
                    OK
                </VBtn>
            </VCardText>
        </VCard>
    </VDialog>
</template>
