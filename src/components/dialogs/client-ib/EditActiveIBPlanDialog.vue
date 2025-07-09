<script setup>
import { onMounted, ref } from 'vue';

const ibPlanid = ref(0);
const ibList = ref(null);
const ibPlanList = ref(null);
const ibPlanCommisionList = ref(null);
const ibPlanname = ref(null);
const isMandotoryFilled = ref(true);
const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');
const selectedPlan = ref(null);
const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    clientId: {
        type: Number,
        required: true,
    },
    planName: {
        type: String,
        required: true,
    },
});
//console.log('planName:', props.planName);
const emit = defineEmits(['submit', 'update:isDialogVisible']);

const dialogModelValueUpdate = val => {
    emit('update:isDialogVisible', val);
};

const getIbPlans = async () => {
    try {
        const res = await $api('/getIbPlans/0', {
            method: 'GET',
            onResponseError({ response }) {
                console.error('Error response:', response);
            },
        });
        if (res) {
            console.log('IbPlans', res);
            ibList.value = res;
            ibPlanList.value = ibList.value.ib_plans
            // ibPlanname.value=ibPlanList.value[0].plan_name

            ibPlanCommisionList.value = ibList.value.ib_plan_commission
            ibPlanname.value = ibPlanCommisionList.value[0].plan_name
            ibPlanid.value = ibPlanCommisionList.value[0].id
        } else {
            console.error('Failed to fetch group list or empty response');
        }
    } catch (err) {
        console.error('Error fetching group list:', err);
    }
};

onMounted(async () => {
    await getIbPlans();
});


const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isApproveBtnLoading.value = true;

    }
};

const handlePageReload = () => {
    window.location.reload();
};
</script>


<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
        @update:model-value="dialogModelValueUpdate">
        <!-- Dialog close btn -->
        <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

        <VCard title="Update IB Plan">
            <VCardText>
                <VAlert density="comfortable" color="secondary" variant="tonal" class="mb-5">
                    Please select the IB plan and Update your Plan
                </VAlert>

                <VDivider />

                <!-- Display group names here -->
                <VList>
                    <VList>
                        <VListItemTitle>Current Plan</VListItemTitle>
                        <VListItem>
                            <div class="d-flex flex-row flex-wrap align-center">
                                <VChip size="small" variant="outlined" color="secondary" class="text-h6">
                                    {{ props.planName }}
                                </VChip>
                            </div>
                        </VListItem>
                    </VList>

                </VList>


                <VRow class="mt-3">
                    <VCol cols="6">
                        <VSpacer />
                        <AppSelect v-model="selectedPlan" :items="ibPlanList || []" item-title="plan_name"
                            item-value="id" label="Select Plan" single-line :rules="[requiredValidator]" />
                    </VCol>
                </VRow>

                <p v-if="!isMandotoryFilled" class="text-body-2 pt-0 pb-0 mb-3 text-error">All fields are mandatory</p>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
                <VBtn variant="tonal" color="secondary" @click="dialogModelValueUpdate(false)">
                    Close
                </VBtn>
                <VBtn class="align-self-end" :block="$vuetify.display.md" :loading="isApproveBtnLoading"
                    :disabled="isApproveBtnLoading" color="primary" @click="isConfirmDialogVisible = true">
                    Update
                </VBtn>
            </VCardText>
        </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
        confirmation-question="Do you want to update default groups?" cancel-title="Cancelled"
        confirm-title="Cancelled!" />

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
                    style="block-size: 88px; inline-size: 88px; pointer-events: none;">
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
