<script setup>
const title=ref(null)
const tip=ref(null)
const selectedLevel=ref(null)
const selectedStatus=ref(null)
const levelOption = [
    { text: 'High', value: 'High' },
    { text: 'Medium', value: 'Medium' },
    { text: 'Low', value: 'Low' },
];
const statusOption = [
    { text: 'Active', value: 1 },
    { text: 'Inactive', value: 0 },
];
const isMandotoryFilled = ref(null)
const isSubmitBtnDisable=ref(false)
const isSubmitBtnLoading=ref(false)
const isConfirmDialogVisible=ref(false)
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');
const isShowTitleValidation=ref(false);
const isShowTipValidation=ref(false);

const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    }
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
function handleAddDetailsSubmit() {

  if (title.value===null || tip.value===null || 
    selectedLevel.value === null || selectedStatus.value === null) {
    isMandotoryFilled.value = false;
    } else {
        isMandotoryFilled.value = true;
        isConfirmDialogVisible.value = true;
    }
}

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isSubmitBtnLoading.value = true;
        isSubmitBtnDisable.value = true;
        try {
            const res = await $api('learning/add-forex-tip', {
                method: 'POST',
                body: {
                    title:title.value,
                    tip:tip.value,
                    level:selectedLevel.value,
                    status:selectedStatus.value
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
                successMessage.value = 'Trading Tip Added Successfully!';
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

const handlePageReload = async (confirmed) => {
  window.location.reload()
}

watch([title], () => {
    if (title.value.length>=30){
        isShowTitleValidation.value=true
    }
    else{
        isShowTitleValidation.value=false
    }
}, { deep: true, immediate: false })

watch([tip], () => {
    if (tip.value.length>=150){
        isShowTipValidation.value=true
    }
    else{
        isShowTipValidation.value=false
    }
}, { deep: true, immediate: false })
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
                            Add Trading Tips
                        </h6>
                    </div>
                </div>
            </div>
            <VForm @submit.prevent="() => { }">
                <VRow>
                    <VCol cols="6">
                        <AppTextField v-model="title" label="Title" maxlength="30"/>
                        <span v-if="isShowTitleValidation" class="text-error" style="font-size:12px">Only 30 characters are allowed</span>
                    </VCol>
                    <VCol cols="6">
                        <AppSelect v-model="selectedLevel" :items="levelOption" item-title="text" item-value="value"
                            label="Level" single-line />
                    </VCol>
                    <VCol cols="6">
                        <AppTextarea v-model="tip" label="Tip" maxlength="150"/>
                        <span v-if="isShowTipValidation" class="text-error" style="font-size:12px">Only 150 characters are allowed</span>
                    </VCol>
                    <VCol cols="6">
                        <AppSelect v-model="selectedStatus" :items="statusOption" item-title="text" item-value="value"
                            label="Status" single-line />
                    </VCol>
                </VRow>
                <p v-if="isMandotoryFilled === false" class="text-body-2 pt-3 pb-0 mb-3 text-error">All fields are mandatory</p>
                <VRow>
                    <VCol cols="6">
                        <VBtn class="me-2" color="primary" @click="handleAddDetailsSubmit()" :loading="isSubmitBtnLoading" :disabled="isSubmitBtnDisable">
                            Sumbit 
                        </VBtn>
                    </VCol>
                </VRow>
            </VForm>
        </VCard>
    </VDialog>
    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you sure you want to add the Trading Tip?"
                cancel-title="Cancelled" confirm-title="Cancelled!" />

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
                    style=" block-size: 88px; inline-size: 88px; pointer-events: none;">
                    <span class="text-5xl font-weight-light">X</span>
                </VBtn>
                <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
                <p>{{ errorMessage }}</p>
                <VBtn color="success" @click="handlePageReload">
                    Ok
                </VBtn>
            </VCardText>
        </VCard>
    </VDialog>
</template>
