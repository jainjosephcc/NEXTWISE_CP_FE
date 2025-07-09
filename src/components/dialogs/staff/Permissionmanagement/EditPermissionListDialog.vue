<script setup>
import { defineEmits, defineProps, onMounted, ref } from 'vue';

const isConfirmDialogVisible = ref(false);
//const permissioncategory = ref('');
const permissionname = ref('');
const permisssiondescription = ref('');
const isSubmitBtnLoading = ref(false);
const staff_categorylist = ref({ permission: [] });
const categoriesOptions = ref([]);
const percategory = ref('');

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

const dialogModelValueUpdate = (val) => {
    emit('update:isDialogVisible', val);
};

const handleConfirm = () => {
    // Add logic for handling confirm action
    console.log('Confirmed');
    // Perform your form submission or other logic here
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

// Fetch data when component is mounted
onMounted(async () => {
    await getStaffCategories();
});
</script>

<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
        @update:model-value="dialogModelValueUpdate">
        <!-- Dialog close button -->
        <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
        <VCard class="pa-6 pa-sm-10">
            <div
                class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
                <div>
                    <div class="d-flex align-center app-logo">
                        <h6 class="app-logo-title"> Edit Permission</h6>
                    </div>
                </div>
            </div>
            <VForm @submit.prevent="() => { }">
                <VRow>
                    <AppSelect v-model="percategory" :items="categoriesOptions" item-title="category_name"
                        item-value="cat_id" label="Permission Category" placeholder="Select Category" single-line
                        :rules="[requiredValidator]" />
                    <VCol cols="12">
                        <AppTextField v-model="permissionname" label="Permission Name" placeholder="" />
                    </VCol>
                    <VCol cols="12">
                        <AppTextarea v-model="permisssiondescription" label="Permission Description" placeholder="" />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="6">
                        <VBtn class="me-2" :loading="isSubmitBtnLoading" color="primary"
                            @click="isConfirmDialogVisible = true">
                            Update
                        </VBtn>
                    </VCol>
                </VRow>
            </VForm>
            <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you sure you want to add this team?" cancel-title="Cancelled"
                confirm-title="Confirmed!" />
        </VCard>
    </VDialog>
</template>

<style scoped>
/* Add custom styles here if needed */
</style>


<style scoped>
/* Add custom styles here if needed */
</style>
