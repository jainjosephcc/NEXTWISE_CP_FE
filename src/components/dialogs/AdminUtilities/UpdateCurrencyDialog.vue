<script setup>
import { ref } from "vue";

const code = ref('');
const tousd = ref('');
const status = ref('');
const isSubmitBtnLoading = ref(false);
const isSubmitBtnDisable = ref(false);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');

const statusOption = [
    { text: 'Active', value: 1 },
    { text: 'Inactive', value: 0 },
];

const props = defineProps({
    selectedCurrency: {
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

const closeDialog = () => {
    emit('update:isDialogVisible', false);
};

const dialogModelValueUpdate = (val) => {
    emit('update:isDialogVisible', val);
};

watch(() => props.selectedCurrency, (newValue) => {
    if (newValue) {
        code.value = newValue.id;
        tousd.value = newValue.to_usd;
        status.value = newValue.status;
    }
});

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isSubmitBtnLoading.value = true;
        isSubmitBtnDisable.value = true;
        try {
            const res = await $api('/currencies/update', {
                method: 'POST',
                body: {
                    id: code.value,
                    to_usd: tousd.value,
                    status: status.value,
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
                successTitle.value = 'Updated!';
                successMessage.value = 'Currency Data Updated Successfully!';
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

const updateData = async (confirmed) => {
    window.location.reload();
};
</script>

<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
        @update:model-value="dialogModelValueUpdate">
        <!-- Dialog close btn -->
        <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
        <VCard class="pa-6 pa-sm-10">
            <div
                class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
                <!-- Left Content -->
                <div>
                    <div class="d-flex align-center app-logo">
                        <h6 class="app-logo-title">
                            Update Currency data
                        </h6>
                    </div>
                </div>
            </div>
            <VForm @submit.prevent="() => { }">
                <VRow>
                    <VCol cols="6">
                        <AppTextField v-model="code" label="Code" disabled />
                    </VCol>
                    <VCol cols="6">
                        <AppTextField v-model="tousd" label="USD conversion" />
                    </VCol>
                    <VCol cols="6">
                        <AppSelect v-model="status" :items="statusOption" item-title="text" item-value="value"
                            label="Status" single-line />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="6">
                        <VBtn class="me-2" :loading="isSubmitBtnLoading" :disabled="isSubmitBtnDisable" color="primary"
                            @click="isConfirmDialogVisible = true">
                            Update
                        </VBtn>
                    </VCol>
                </VRow>
            </VForm>
            <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you sure you want to update the Currency Conversion?"
                cancel-title="Cancelled" confirm-title="Cancelled!" />
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
                <VBtn color="success" @click="updateData()">
                    OK
                </VBtn>
            </VCardText>
        </VCard>
    </VDialog>
    <VDialog v-model="isErrorDialogVisible" max-width="500">
        <VCard>
            <VCardText class="text-center px-10 py-6">
                <VBtn icon variant="outlined" color="error" class="my-4"
                    style=" block-size: 88px; inline-size: 88px; pointer-events: none;">
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
</template>
