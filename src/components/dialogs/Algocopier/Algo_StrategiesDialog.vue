<script setup>
const minimumAmount = ref('')
const copierSublabel = ref('')
const groupId = ref('')
//const cDate = ref('')
//const uDate = ref('')
const cstatus = ref('')
const copiername = ref('')
const strategydescription = ref('')
const riskscore = ref('')
const commissionrate = ref('')
const equity = ref('')
const lockdays = ref('')
const floatingprofit = ref('')
const balance = ref('')
const bonus = ref('')
const leverage = ref('')
const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const props = defineProps({
    selectedStrategies: {
        type: Object,
        required: false,
    },
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
})
const closeDialog = () => {
    emit('update:isDialogVisible', false);
}

const emit = defineEmits([
    'submit',
    'update:isDialogVisible',
])

const dialogModelValueUpdate = (val) => {
    emit('update:isDialogVisible', val);
}
watch(props, () => {
    minimumAmount.value = props.selectedStrategies.minimum_amount;
    copierSublabel.value = props.selectedStrategies.copier_sublabel;
    groupId.value = props.selectedStrategies.group_id;
    // cDate.value = props.selectedStrategies.created_at;
    // uDate.value = props.selectedStrategies.updated_at;
    cstatus.value = props.selectedStrategies.status;
    copiername.value = props.selectedStrategies.copier_name;
    strategydescription.value = props.selectedStrategies.strategy_description;
    riskscore.value = props.selectedStrategies.risk_score;
    commissionrate.value = props.selectedStrategies.commission_rate;
    equity.value = props.selectedStrategies.equity;
    lockdays.value = props.selectedStrategies.lock_days;
    floatingprofit.value = props.selectedStrategies.floating_profit;
    balance.value = props.selectedStrategies.balance;
    bonus.value = props.selectedStrategies.bonus;
    leverage.value = props.selectedStrategies.leverage;

});
const updateAlgo = async () => {
    emit('update', true)
    updateModelValue(false)
    console.log(minimumAmount.value);

}
const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isApproveBtnLoading.value = true;
        console.log(im);
        try {
            const res = await $api('/algo-copiers/Update-Algo-Strategies...', {
                method: 'PUT',
                body: {

                    minimumAmount: minimumAmount.value,

                    action: 1,
                    comment: "Algo Strategies APP. CRM"
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isApproveBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res.result) {
                successTitle.value = 'Updated !'
                successMessage.value = 'Algo Data Updated Successfully !';
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
</script>

<template>
    <section>
        <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
            @update:model-value="dialogModelValueUpdate">

            <!-- Dialog close btn -->
            <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
            <VCard class="pa-6 pa-sm-10">
                <!-- SECTION Header -->
                <div
                    class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
                    <!-- 👉 Left Content -->
                    <div>
                        <div class="d-flex align-center app-logo mb-6">
                            <!-- 👉 Logo -->
                            <!-- <VNodeRenderer  /> -->

                            <!-- 👉 Title -->
                            <h6 class="app-logo-title">
                                Update Algo Strategies

                            </h6>
                            <div class="d-flex flex-column gap-2">

                                <!-- 👉 Group Id -->
                                <div
                                    class="d-flex align-start align-sm-center gap-x-4 font-weight-medium text-md flex-column flex-sm-row">
                                    <span class="text-high-emphasis text-sm-end" style="inline-size: 8.625rem;">Group
                                        ID:</span>
                                    <span>
                                        <v-text-field variant="filled" id="groupId" v-model="groupId"
                                            disabled></v-text-field>
                                    </span>

                                </div>

                            </div>
                        </div>
                    </div>
                    <!---- <div
                        class="d-flex align-start align-sm-center gap-x-4 font-weight-medium text-md flex-column flex-sm-row">
                        <span class="text-high-emphasis text-sm-end" style="inline-size: 8.625rem;">Created
                            Date:</span>

                        <v-text-field variant="filled" id="cDate" v-model="cDate"></v-text-field>
                    </div>

                    <div
                        class="d-flex align-start align-sm-center gap-x-4 font-weight-medium text-md flex-column flex-sm-row">
                        <span class="text-high-emphasis text-sm-end" style="inline-size: 8.625rem;">Updated
                            date</span>

                        <v-text-field variant="filled" id="uDate" v-model="uDate"></v-text-field>

                    </div>
                -->
                    <div class="d-flex gap-x-4 align-start align-sm-center flex-column flex-sm-row">
                        <span class="text-high-emphasis text-sm-end" style="inline-size: 8.625rem;">Status:</span>

                        <VChip v-if="cstatus === 1" color="success" variant="outlined">
                            <VIcon start icon="tabler-check" />

                            Active
                        </VChip>
                        <VChip v-if="cstatus === 0" color="error" variant="outlined">
                            <VIcon start icon="tabler-ban" />
                            Inactive
                        </VChip>

                    </div>
                </div>
                <VForm @submit.prevent="() => { }">
                    <VRow>
                        <VCol cols="12">
                            <VRow no-gutters>
                                <VCol cols="12" class="d-flex align-items-center">
                                    <label class="v-label text-body-2 text-high-emphasis"
                                        for="strategydescription">Strategy Description</label>
                                </VCol>
                            </VRow>
                        </VCol>
                        <VCol cols="12" md="12">
                            <VTextarea id="strategydescription" v-model="strategydescription" persistent-placeholder />
                        </VCol>
                    </VRow>
                    <VRow>
                        <VCol cols="12">
                            <VRow no-gutters>
                                <VCol cols="12" class="d-flex align-items-center">
                                    <label class="v-label text-body-2 text-high-emphasis"
                                        for="copierSublabel">Sublabel</label>
                                </VCol>
                            </VRow>
                        </VCol>
                        <VCol cols="12" md="12">
                            <AppTextField id="copierSublabel" v-model="copierSublabel" persistent-placeholder />
                        </VCol>
                    </VRow>

                    <VRow>
                        <VCol cols="6">
                            <AppTextField v-model="minimumAmount" label="Minimum
                                        Amount" />
                        </VCol>
                        <VCol cols="6">
                            <AppTextField v-model="riskscore" label="Risk
                                        Score" />
                        </VCol>
                        <VCol cols="6">
                            <AppTextField v-model="commissionrate" label="Commission Rate" />
                        </VCol>
                        <VCol cols="6">
                            <AppTextField v-model="equity" label="Equity" />
                        </VCol>
                        <VCol cols="6">
                            <AppTextField v-model="lockdays" label="Lock Days" />
                        </VCol>

                        <VCol cols="6">
                            <AppTextField v-model="leverage" label="Leverage" />
                        </VCol>
                        <VCol cols="6">
                            <AppTextField v-model="balance" label="Balance" />
                        </VCol>
                        <VCol cols="6">
                            <AppTextField v-model="bonus" label="Bonus" />
                        </VCol>

                    </VRow>
                    <VRow>

                        <VCol cols="6">

                            <VBtn class="me-2" color="primary" @click="closeDialog">Close</VBtn>

                        </VCol>
                        <VCol cols="6">


                            <VBtn class="me-2" @click="updateAlgo()">Update</VBtn>


                        </VCol>
                    </VRow>

                </VForm>

            </VCard>



        </VDialog>
        <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
            confirmation-question="Are you want to update to this Strategies?" cancel-title="Cancelled"
            confirm-title="Cancelled!" />
    </section>
</template>

<style scoped lang="scss"></style>
