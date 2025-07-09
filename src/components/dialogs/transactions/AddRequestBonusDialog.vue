<script setup>
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';

const inlineRadio = ref('0');
const damount = ref('');
const bpercentage = ref('');
const bamount = ref('');
const bonusdata = ref([]);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');
const isApproveBtnLoading = ref(false);


const props = defineProps({
    selectedTransaction: {
        type: Object,
        required: false,
    },
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    transaction_id: {
        type: Number,
        default: null, // Provide a default value if it’s optional
    },
    amount: {
        type: Number,
        default: 0, // Provide a default value if it’s optional
    },
});

const emit = defineEmits(['update:isDialogVisible',]);//emit bonus-request 

const dialogModelValueUpdate = (val) => {
    emit('update:isDialogVisible', val);
};

const fetchRequestBonusData = async () => {
    if (props.transaction_id !== undefined && props.transaction_id !== null) {
        try {
            const res = await $api(`getRequestBonusData/${props.transaction_id}`, {
                method: 'GET',
                onResponseError({ response }) {
                    console.log('API error response:', response);
                },
            });

            if (res && Array.isArray(res.bonus_data)) {
                bonusdata.value = res.bonus_data;
                // Determine if the bonus has already been requested

            } else {
                console.error('Failed to fetch bonus or empty response');
            }
        } catch (err) {
            console.error('Error fetching bonus data:', err);
        }
    }
};

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isApproveBtnLoading.value = true;
        try {
            const res = await $api('/submitBonusRequest', {
                method: 'POST',
                body: {
                    trans_id: props.transaction_id, // corrected
                    bonus_percentage: bpercentage.value,
                    bonus_type: inlineRadio.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isApproveBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            });
            if (res) {
                successTitle.value = 'Success !';
                successMessage.value = 'Bonus Requested Successfully !';
                isApproveBtnLoading.value = false;
                isSuccessDialogVisible.value = true;

            }
        } catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.response?.data?.message || Ex.message;
            isApproveBtnLoading.value = false;
            isErrorDialogVisible.value = true;
        }
    }
};

// Watch for changes in transaction_id
watch(() => props.transaction_id, async (newTransactionId) => {
    if (newTransactionId !== undefined && newTransactionId !== null) {
        await fetchRequestBonusData();
    }
});

//changes in bamount
watch([damount, bpercentage], ([newDamount, newPercentage]) => {
    // Ensure both damount and bpercentage are valid numbers
    if (newDamount && newPercentage) {
        bamount.value = newDamount * (newPercentage / 100);
    } else {
        bamount.value = '';
    }
});


// Watch for changes in amount and update damount
watch(() => props.amount, (newAmount) => {
    damount.value = newAmount !== undefined && newAmount !== null ? newAmount : '';
});

// Fetch data on component mount if transaction_id is valid
onMounted(async () => {
    if (props.transaction_id !== undefined && props.transaction_id !== null) {
        await fetchRequestBonusData();
    }
    if (props.amount !== undefined && props.amount !== null) {
        damount.value = props.amount;
    }
});

// Handle page reload
const handlePageReload = () => {
    window.location.reload();
};
</script>

<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
        @update:model-value="dialogModelValueUpdate">
        <!-- Dialog close btn -->
        <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

        <VCard>
            <VCardText>
                <VTable v-if="bonusdata.length" class="text-no-wrap">
                    <thead>
                        <tr>
                            <th>TOTAL LOSABLE BONUS GIVEN</th>
                            <th>TOTAL NON-LOSABLE BONUS GIVEN</th>
                            <th>GROUP</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="bonus in bonusdata" :key="bonus.mt_id">

                            <td>{{ bonus.total_l_bonus }}</td>
                            <td>{{ bonus.total_nl_bonus }}</td>
                            <td>{{ bonus.mt_group_name }}</td>
                        </tr>
                    </tbody>
                </VTable>
            </VCardText>
            <VDivider />
            <VForm @submit.prevent="() => { }">
                <VCardText>
                    <VRow>
                        <VCol cols="12">
                            <VRadioGroup v-model="inlineRadio" inline>
                                <VRadio label="Losable Bonus" value="0" />
                                <VRadio label="Non-losable Bonus" value="1" />
                            </VRadioGroup>
                        </VCol>

                        <VCol cols="4">
                            <AppTextField v-model="damount" label="DEPOSITED AMOUNT" />
                        </VCol>
                        <VCol cols="4">
                            <AppTextField v-model="bpercentage" label="Bonus Percentage" suffix="%" />
                        </VCol>
                        <VCol cols="4">
                            <AppTextField v-model="bamount" label="Bonus Amount" suffix="USD" />
                        </VCol>
                    </VRow>
                </VCardText>

                <VCardText class="d-flex justify-end gap-3">
                    <VBtn color="info" class="me-2" :loading="isApproveBtnLoading" :disabled="isApproveBtnLoading"
                        @click="isConfirmDialogVisible = true">
                        Request Bonus
                        <VIcon end icon="tabler-discount-check-filled" />
                    </VBtn>

                    <VBtn color="secondary" @click="dialogModelValueUpdate(false)">
                        <VIcon start icon="tabler-circle-minus" />Cancel
                    </VBtn>
                </VCardText>
            </VForm>
        </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
        confirmation-question="Do you want to request bonus?" cancel-title="Cancelled" confirm-title="Cancelled!" />


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
