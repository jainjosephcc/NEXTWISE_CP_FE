<script setup>




const groups_list = ref(null)
const groupOptions = ref(null)
const selectedGroup = ref([])
const isMandotoryFilled = ref(true);
const isApproveBtnLoading = ref(false);
const checkLimit = ref(null)
const isConfirmDialogVisible = ref(false);
const isRejectDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');
const isUpdateDisabled = ref(false);
const props = defineProps({

    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    clientId: {
        type: Number,
        required: true,
    },
});
const emit = defineEmits(['submit', 'update:isDialogVisible']);

const dialogModelValueUpdate = val => {
    emit('update:isDialogVisible', val);
};
onMounted(async () => {
    await getMTGroups();

});
const getMTGroups = async () => {
    try {
        const res = await $api('/getAllmt5Groups', {
            method: 'GET',
            onResponseError({ response }) {
                console.error('Error response:', response);
            },
        });
        if (res) {

            groups_list.value = res.mt5Groups
            groupOptions.value = groups_list.value.filter(user => user.ib_enabled === 1);

            //   groupOptions.value=res.ib_enabled_mt_groups;
        } else {
            console.error('Failed to fetch group list or empty response');
        }
    } catch (err) {
        console.error('Error fetching group list:', err);
    }
};
watch([selectedGroup], (newVal) => {
    if (selectedGroup.value.length > 3) {
        checkLimit.value = true;
    }
}, { deep: true, immediate: false });

// Watch selectedGroup and enforce selection limit
watch(selectedGroup, (newVal) => {
    if (newVal.length > 3) {
        selectedGroup.value = newVal.slice(0, 3);
        checkLimit.value = true;
    } else {
        checkLimit.value = false;
    }
}, { deep: true, immediate: false });

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isApproveBtnLoading.value = true;
        try {
            const formData = new FormData();
            formData.append('client_id', props.clientId);
            selectedGroup.value.forEach((category) => {
                formData.append('mt_group_list[]', category);
            });
            const res = await $api('/submitIbRequest', {
                method: 'POST',
                body: formData,
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong!';
                    errorMessage.value = response._data.message;
                    isErrorDialogVisible.value = true;
                },
            });
            if (res) {
                successTitle.value = 'Success!';
                successMessage.value = 'IB Request Submitted Successfully!';
                isSuccessDialogVisible.value = true;
            }
            isApproveBtnLoading.value = false;
        } catch (err) {
            isApproveBtnLoading.value = false;
            errorTitle.value = 'Something Went Wrong!';
            errorMessage.value = err.message || 'An error occurred.';
            isErrorDialogVisible.value = true;
        } finally {
            isApproveBtnLoading.value = false;
        }
    }
};

const handlePageReload = () => {
    window.location.reload();
};
function handleApprove() {


    isConfirmDialogVisible.value = true;
}

</script>

<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
        @update:model-value="dialogModelValueUpdate">
        <!-- Dialog close btn -->
        <DialogCloseBtn @click="dialogModelValueUpdate(false)" />




        <VCard title="Create IB Request">
            <VCardText>
                <VAlert density="comfortable" color="secondary" variant="tonal" class="mb-5">
                    Please select the default groups for mapping this IB. Clients who open MT5 accounts under this IB
                    will only be able to open MT5 accounts within the selected groups.
                </VAlert>

                <VDivider />
                <VRow class="mt-3">
                    <VCol cols="6">
                        <VSpacer />

                        <AppSelect v-model="selectedGroup" :items="groupOptions" item-title="mt_group_name"
                            item-value="id" multiple persistent-hint label="Select Group" />

                    </VCol>

                    <p v-if="isMandotoryFilled === false" class="text-body-2 pt-0 pb-0 mb-3 text-error">All fields are
                        mandatory</p>
                </VRow>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
                <VBtn variant="tonal" color="secondary" @click="dialogModelValueUpdate(false)">
                    Close
                </VBtn>
                <VBtn :loading="isApproveBtnLoading" :disabled="isUpdateDisabled" @click="handleApprove"
                    class="align-self-end" :block="$vuetify.display.md">
                    Request
                </VBtn>
            </VCardText>
        </VCard>

    </VDialog>
    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
        confirmation-question="Do you want to approve the IB request?" cancel-title="Cancelled"
        confirm-title="Cancelled!" />

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm" cancel-title="Cancelled"
        confirm-title="Confirm" confirmation-question="Are you sure you want to place IB request?" />

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
                <VBtn color="success" @click="handlePageReload">
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
                <VBtn color="success" @click="isErrorDialogVisible = false">
                    OK
                </VBtn>
            </VCardText>
        </VCard>
    </VDialog>


</template>
