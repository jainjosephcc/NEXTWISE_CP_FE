<script setup>
import md5 from "blueimp-md5";
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';

const inlineRadio = ref('0');
const damount = ref('');
const bpercentage = ref('');
const bamount = ref('');
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');
const isApproveBtnLoading = ref(false);
const bonusRequested = ref(false);
const MD5Hash = ref('');
const checksum = ref('');
const bonusdata = ref([]);
const isConfirmRejectDialogVisible = ref(false)
const isRejectBtnLoading = ref(false)

const props = defineProps({
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
    selectedTransaction: {
        type: Object,
        default: () => ({}), // Provide a default empty object
    },
});

const emit = defineEmits(['update:isDialogVisible']);

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
                //console.log('Bonus Data Fetched:', bonusdata.value);
                /* // Assuming each bonus in the array has a bonus_type that indicates losable (0) or non-losable (1)
                // Here we pick the first bonus in the array, you can modify based on your needs
                const firstBonus = bonusdata.value[0];
                if (firstBonus) {
                    inlineRadio.value = String(firstBonus.bonus_type); // Set radio button value
                } */
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

        const client_id = String(props.selectedTransaction.client_id);
        const MT5_ID = String(props.selectedTransaction.mt_id);
        const transaction_id = String(props.transaction_id);
        MD5Hash.value = client_id + MT5_ID + transaction_id;
        checksum.value = md5(MD5Hash.value).toString();

        try {
            const res = await $api('/processBonusRequest', {
                method: 'POST',
                body: {
                    trans_id: props.transaction_id,
                    action: 1,
                    checksum: checksum.value,
                    bonus_percentage: bpercentage.value,
                    bonus_amount: bamount.value,
                    bonus_type: inlineRadio.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                },
            });

            if (res && res.success) {
                successTitle.value = 'Success !';
                successMessage.value = res.message || 'Bonus Added to account';
                bonusRequested.value = true;
            } else {
                throw new Error(res.message || 'Failed to process bonus request');
            }
        } catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.response?.data?.message || Ex.message;
        } finally {
            isApproveBtnLoading.value = false; // Ensure the button is not stuck in loading state
        }
        isSuccessDialogVisible.value = true;
    }
};

const handleRejectConfirm = async (confirmed) => {
    if (confirmed) {
        isRejectBtnLoading.value = true;

        const client_id = String(props.selectedTransaction.client_id);
        const MT5_ID = String(props.selectedTransaction.mt_id);
        const transaction_id = String(props.transaction_id);
        MD5Hash.value = client_id + MT5_ID + transaction_id;
        checksum.value = md5(MD5Hash.value).toString();

        try {
            const res = await $api('/processBonusRequest', {
                method: 'POST',
                body: {
                    trans_id: props.transaction_id,
                    action: 0,
                    checksum: checksum.value,
                    bonus_percentage: bpercentage.value,
                    bonus_amount: bamount.value,
                    bonus_type: inlineRadio.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isRejectBtnLoading.value = false
                    isErrorDialogVisible.value = true
                },
            });

            if (res && res.success) {
                successTitle.value = 'Rejected!';
                successMessage.value = res.message || 'Bonus Request Rejected Successfully!';
                isSuccessDialogVisible.value = true;
            } else {
                // Handle unexpected response structure or unsuccessful result
                errorTitle.value = 'Unexpected Response!';
                errorMessage.value = res.message || 'The response format was not as expected.';
                isErrorDialogVisible.value = true;
            }
        } catch (Ex) {
            // Handle exceptions
            errorTitle.value = 'Something Went Wrong!';
            errorMessage.value = Ex.data?.message || 'Unknown error';
            isErrorDialogVisible.value = true;
        } finally {
            isRejectBtnLoading.value = false; // Ensure the button is not stuck in loading state
        }
        isSuccessDialogVisible.value = true;
    }
};

// Watch for changes in transaction_id and fetch bonus data
watch(() => props.transaction_id, async (newTransactionId) => {
    //console.log('Transaction ID changed:', newTransactionId);
    if (newTransactionId !== undefined && newTransactionId !== null) {
        await fetchRequestBonusData();
    }
});

// Watch for changes in bpercentage and update bamount

watch([damount, bpercentage], ([newDamount, newPercentage]) => {
    // Ensure both damount and bpercentage are valid numbers
    if (newDamount && newPercentage) {
        bamount.value = newDamount * (newPercentage / 100);
    } else {
        bamount.value = '';
    }
});


// Pre-fill the values when the dialog is opened
watch(() => props.isDialogVisible, (isVisible) => {
    if (isVisible) {
        //inlineRadio.value = props.selectedTransaction.bonus_type || '';
        bpercentage.value = props.selectedTransaction.bonus_percentage || '';
        bamount.value = bpercentage.value ? (bpercentage.value / 10).toFixed(2) : '';
        damount.value = props.amount || '';
    }
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
                            <AppTextField v-model="damount" label="DEPOSITED AMOUNT" disabled />
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
                        Approve
                        <VIcon end icon="tabler-discount-check-filled" />
                    </VBtn>

                    <VBtn color="error" :loading="isRejectBtnLoading" :disabled="isApproveBtnLoading" class="me-2"
                        @click="isConfirmRejectDialogVisible = true">
                        Reject
                        <VIcon end icon="tabler-circle-x" />
                    </VBtn>
                </VCardText>
            </VForm>
        </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
        confirmation-question="Do you want to  Approve this Bonus?" cancel-title="Cancelled"
        confirm-title="Cancelled!" />
    <ConfirmDialog v-model:isDialogVisible="isConfirmRejectDialogVisible" @confirm="handleRejectConfirm"
        confirmation-question="Are you sure to Reject this Bonus?" cancel-title="Cancelled"
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
