<script setup>
import { defineEmits, defineProps, onMounted, ref } from 'vue';

// Refs and reactive variables
const percategory = ref('');
const pername = ref('');
const perdescription = ref('');
const isSubmitBtnLoading = ref(false);
const isSubmitBtnDisable = ref(false);
const categoriesOptions = ref([]);
const permission = ref(null);
const status = ref(null);
const staff_categorylist = ref({ permission: [] });
const statusOptions = [
    { text: 'Active', value: 1 },
    { text: 'Inactive', value: 0 },
];
const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isMandotoryFilled = ref(null);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('');
let errorMessage = ref('');
let successTitle = ref('');
let successMessage = ref('');
const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
});
// Define props


const emit = defineEmits([
    'submit',
    'update:isDialogVisible',
]);

const dialogModelValueUpdate = (val) => {
    emit('update:isDialogVisible', val);
};

// Fetch API data and update refs
const getStaffCategories = async () => {
    try {
        const res = await $api('/getStaffGroupPermissions/0', {
            method: 'GET',
        });
        if (res && res.permission) {
            staff_categorylist.value = res.permission;
            categoriesOptions.value = res.permission;
        } else {
            console.error('Staff groups data not found:', res);
        }
    } catch (err) {
        console.error('Error fetching staff group list:', err);
    }
};

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isApproveBtnLoading.value = true;

        try {
            const res = await $api('/addStaffPermissions', {
                method: 'POST',
                body: {
                    permission_name: pername.value,
                    category: percategory.value,
                    description: perdescription.value,
                    status: status.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isApproveBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = ' Staff Permission Created Successfully !';
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
};

const handlePageReload = async (confirmed) => {
    window.location.reload();
};

function handleAddTeamSubmit() {

    isMandotoryFilled.value = true;
    isConfirmDialogVisible.value = true;
}



// Fetch data when component is mounted
onMounted(async () => {
    await getStaffCategories();
});
</script>

<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
        @update:model-value="dialogModelValueUpdate">
        <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
        <VCard class="pa-6 pa-sm-10">
            <div
                class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
                <div>
                    <div class="d-flex align-center app-logo">
                        <h6 class="app-logo-title">Add Permission</h6>
                    </div>
                </div>
            </div>
            <VForm @submit.prevent="() => { }">
                <VRow>
                    <VCol cols="12">
                        <AppSelect v-model="percategory" :items="categoriesOptions" item-title="category_name"
                            item-value="cat_id" label="Permission Category" placeholder="Select Category" single-line
                            :rules="[requiredValidator]" />
                    </VCol>
                    <VCol cols="12">
                        <AppTextField v-model="pername" label="Permission Name" placeholder="" />
                    </VCol>
                    <VCol cols="12">
                        <AppTextarea v-model="perdescription" label="Permission Description" placeholder="" />
                    </VCol>
                    <VCol cols="6">
                        <AppSelect v-model="status" :items="statusOptions" item-title="text" item-value="value"
                            label="Status" single-line />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="6">
                        <VBtn class="me-2" color="primary" @click="handleAddTeamSubmit()"
                            :loading="isApproveBtnLoading">
                            Submit
                        </VBtn>
                    </VCol>
                </VRow>
            </VForm>
            <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you sure you want to add this Permission?" cancel-title="Cancelled"
                confirm-title="Confirmed!" />
            <VDialog v-model="isSuccessDialogVisible" max-width="500">
                <VCard>
                    <VCardText class="text-center px-10 py-6">
                        <VBtn icon variant="outlined" color="success" class="my-4"
                            style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
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
                            style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
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
        </VCard>
    </VDialog>
</template>
