<script setup>
import md5 from "blueimp-md5";
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';

const inlineRadio = ref(0)
const damount = ref('')
const bpercentage = ref('')
const bamount = ref('')
const bonusdata = ref([])
const isConfirmDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const successTitle = ref('')
const successMessage = ref('')
const isApproveBtnLoading = ref(false)
const isApproveBtnDisabled = ref(true)
const updatedDepositAmount = ref(0)

let MD5Hash = ref('')
let checksum = ref('')
let snackMessage = ref('')

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
})

const emit = defineEmits(['update:isDialogVisible'])//emit bonus-request

const dialogModelValueUpdate = (val) => {
    emit('update:isDialogVisible', val)
}

const fetchRequestBonusData = async () => {
    if (props.transaction_id !== undefined && props.transaction_id !== null) {
        try {
            const res = await $api(`getRequestBonusData/${props.transaction_id}`, {
                method: 'GET',
                onResponseError({ response }) {
                    console.log('API error response:', response)
                },
            })

            if (res && Array.isArray(res.bonus_data)) {
                bonusdata.value = res.bonus_data
                // Determine if the bonus has already been requested

            } else {
                console.error('Failed to fetch bonus or empty response')
            }
        } catch (err) {
            console.error('Error fetching bonus data:', err)
        }
    }
}

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isApproveBtnLoading.value = true
        var client_id = String(props.selectedTransaction.client_id)
        var MT5_ID = String(props.selectedTransaction.mt_id)
        var transaction_id = String(props.selectedTransaction.transaction_id)
        MD5Hash.value = client_id + MT5_ID + transaction_id
        checksum.value = md5(MD5Hash.value)

        try {
            const res = await $api('/approveClientDepositTicketWithBonus', {
                method: 'POST',
                body: {
                    transId: transaction_id,
                    approvedAmt: updatedDepositAmount.value,
                    checksum: checksum.value,
                    bonus_percentage: bpercentage.value,
                    bonus_amount: bamount.value,
                    bonus_type: inlineRadio.value,
                    action: 1,
                    comment: "DEPOSIT APP. CRM",
                },
                onResponseError({ response }) {
                    // Handle API response errors
                    errorTitle.value = 'Something Went Wrong!'
                    errorMessage.value = response._data.message || 'Unknown error'
                    isApproveBtnLoading.value = false
                    isErrorDialogVisible.value = true
                },
            })

            // Check if the response contains 'Success' and is true
            if (res && res.Success) {
                successTitle.value = 'Approved!'
                successMessage.value = res.message || 'Deposit Request Approved Successfully!'
                isSuccessDialogVisible.value = true
            } else {
                // Handle unexpected response structure or unsuccessful result
                errorTitle.value = 'Unexpected Response!'
                errorMessage.value = res.message || 'The response format was not as expected.'
                isErrorDialogVisible.value = true
            }
        } catch (Ex) {
            // Handle exceptions
            errorTitle.value = 'Something Went Wrong!'
            errorMessage.value = Ex.data?.message || 'Unknown error'
            isErrorDialogVisible.value = true
        } finally {
            // Ensure that loading is always turned off after handling
            isApproveBtnLoading.value = false
        }
    }
}

// Watch for changes in transaction_id
watch(() => props.transaction_id, async (newTransactionId) => {
    if (newTransactionId !== undefined && newTransactionId !== null) {
        await fetchRequestBonusData()
    }
})

//changes in bamount
watch([bpercentage, updatedDepositAmount], ([newBPercentage, newUpdatedDepositAmount]) => {
    // Ensure both damount and bpercentage are valid numbers
    if (newUpdatedDepositAmount && newBPercentage) {
        bamount.value = newUpdatedDepositAmount * (newBPercentage / 100)
    } else {
        bamount.value = ''
    }
    if (newUpdatedDepositAmount > 0) {
        isApproveBtnDisabled.value = false
    } else {
        isApproveBtnDisabled.value = true
    }
})


// Watch for changes in amount and update damount
watch(() => props.amount, (newAmount) => {
    if (newAmount) {
        damount.value = newAmount
    }
})

/*watch(() => updatedDepositAmount, (newValue) => {
  if (newValue) {
    console.log(newValue)
    damount.value = newValue
  }
})*/

// Fetch data on component mount if transaction_id is valid
onMounted(async () => {
    if (props.transaction_id !== undefined && props.transaction_id !== null) {
        await fetchRequestBonusData()
    }
    if (props.amount !== undefined && props.amount !== null) {
        damount.value = props.amount
        updatedDepositAmount.value = props.amount
    }
})

// Handle page reload
const handlePageReload = () => {
    window.location.reload()
}
</script>

<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
        @update:model-value="dialogModelValueUpdate">
        <!-- Dialog close btn -->
        <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

        <VCard>
            <VCardTitle>Approve / Reject Credit In Ticket</VCardTitle>
            <VDivider />

            <VTable class="text-no-wrap">
                <thead>
                    <tr>
                        <th>MT5 ID</th>
                        <th>MT5 GROUP</th>
                        <th>TOTAL LB GIVEN</th>
                        <th>TOTAL NLB GIVEN</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <CustomMT5Chip :client_id="props.selectedTransaction.client_id"
                                :is_wallet="props.selectedTransaction.is_wallet"
                                :mt_id="props.selectedTransaction.mt_id" />
                        </td>
                        <td>{{ bonusdata[0]?.mt_group_name }}</td>
                        <td>{{ formatCurrency(bonusdata[0]?.total_l_bonus) }}</td>
                        <td>{{ formatCurrency(bonusdata[0]?.total_nl_bonus) }}</td>
                    </tr>
                </tbody>
            </VTable>

            <VDivider />
            <VForm @submit.prevent="() => { }">
                <VCardText>
                    <VRow>

                        <VCol cols="6">
                            <AppTextField v-model="damount" label="Requested Amount" suffix="USD" disabled />
                        </VCol>
                        <VCol cols="6">
                            <AppTextField v-model="updatedDepositAmount" label="Amount to be Approved" prefix="$"
                                type="number" />
                        </VCol>

                    </VRow>
                    <VRow>
                        <VCol cols="12">
                            <VRadioGroup v-model="inlineRadio" inline>
                                <VRadio label="Losable Bonus" value="0" />
                                <VRadio label="Non-losable Bonus" value="1" />
                            </VRadioGroup>
                        </VCol>
                        <VCol cols="4">
                            <AppTextField v-model="bpercentage" label="Bonus Percentage" suffix="%" />
                        </VCol>
                        <VCol cols="4">
                            <AppTextField v-model="bamount" label="Bonus Amount" suffix="USD" disabled />
                        </VCol>
                    </VRow>
                </VCardText>

                <VCardText class="d-flex justify-end gap-3">
                    <VBtn color="success" class="me-2" :loading="isApproveBtnLoading" :disabled="isApproveBtnDisabled"
                        @click="isConfirmDialogVisible = true">
                        Approve Deposit
                        <VIcon end icon="tabler-discount-check-filled" />
                    </VBtn>

                    <VBtn color="secondary" @click="dialogModelValueUpdate(false)">
                        <VIcon start icon="tabler-circle-minus" />
                        Cancel
                    </VBtn>
                </VCardText>
            </VForm>
        </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
        confirmation-question="Do you want to approve this deposit?" cancel-title="Cancelled"
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
