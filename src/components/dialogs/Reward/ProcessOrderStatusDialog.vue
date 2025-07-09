<script setup>

const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const selectedStatus = ref('');
const statusOptions = [
    { text: 'Onhold', value: 4 },
    { text: 'Order Shipped', value: 1 },
    { text: 'Reward Shared in Email', value: 3 },
    { text: 'Order Rejected', value: 2 },
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

const dialogModelValueUpdate = val => {
    emit('update:isDialogVisible', val)
}
const handleConfirm = async (confirmed) => {

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
            <div
                class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
                <!-- 👉 Left Content -->
                <div>
                    <div class="d-flex align-center app-logo ">
                        <h6 class="app-logo-title">
                            Update Order Status
                        </h6>
                    </div>
                </div>
            </div>
            <VForm @submit.prevent="() => { }">

                <VRow>
                    <VCol cols="6">
                        <AppSelect v-model="selectedStatus" :items="statusOptions" item-title="text" item-value="value"
                            label="Update Order Status" single-line :rules="[requiredValidator]" />
                    </VCol>
                </VRow>

                <VCardText class="d-flex justify-end flex-wrap gap-3">
                    <VBtn variant="tonal" color="secondary" @click="dialogModelValueUpdate(false)">
                        Close
                    </VBtn>
                    <VBtn class="align-self-end" :loading="isApproveBtnLoading" :disabled="isApproveBtnLoading"
                        color="primary" @click="isConfirmDialogVisible = true" :block="$vuetify.display.md">
                        Submit
                    </VBtn>

                </VCardText>


                <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                    confirmation-question="Are you want to Update Status?" cancel-title="Cancelled"
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
            </VForm>
        </VCard>
    </VDialog>
</template>
