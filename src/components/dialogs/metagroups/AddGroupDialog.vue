<script setup>
const groupName = ref(null);
const selectedCategory = ref(null);
const mindeposit=ref(null);
const spread=ref(null);
const commission=ref(null);
const categoryItems=ref(null);
const selectedswap = ref(null);
const selectedStatus = ref(null);
const selectedIbStatus=ref(null);
const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isMandotoryFilled=ref(null);

const swapOptions = [
  { text: 'Active', value: 1 },
  {  text: 'Inactive', value: 0 }
];
const statusOptions=[
  { text: 'Active', value: 1 },
  {  text: 'Inactive', value: 0 }
];
const ibOptions=[
  { text: 'Yes', value: 1 },
  {  text: 'No', value: 0 }
];

const props = defineProps({
  categoryList: {
    type: Object,
    required: false,
  },
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
watch(
      () => props.categoryList,
      (newCategoryList) => {
        if (newCategoryList && newCategoryList.group_category) {
          categoryItems.value = newCategoryList.group_category.map(category => ({
            text: category.category_name,
            value: category.id
          }));
        } else {
          categoryItems.value = [];
        }
      },
      { immediate: true, deep: true } // immediate to run it on initial load, deep to watch nested changes
    );

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isApproveBtnLoading.value = true;
       
        try {
            const res = await $api('/createMtGroup', {
                method: 'POST',
                body: {
                    mt_group_name:groupName.value ,
                    mt_category: selectedCategory.value,
                    min_deposit: mindeposit.value,
                    spread:spread.value,
                    commission:commission.value,
                    swap:selectedswap.value,
                    ib_enabled:selectedIbStatus.value,
                    status:selectedStatus.value,
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
                successMessage.value = 'Group added Successfully !';
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

function handleAddGroupSubmit(){
     if (groupName.value===null || selectedCategory.value===null || commission.value===null || mindeposit.value ===null ||spread.value===null ||selectedswap.value ===null ||selectedIbStatus.value===null){
     isMandotoryFilled.value=false;
    }
    else{
        isMandotoryFilled.value=true;
        isConfirmDialogVisible.value=true;
    }
}         

</script>
<template>
   <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
    <VCard class="pa-6 pa-sm-10">
      <div class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
        <!-- 👉 Left Content -->
        <div>
          <div class="d-flex align-center app-logo ">
            <h6 class="app-logo-title">
              Add Group
            </h6>
          </div>
        </div>
      </div>
      <VForm @submit.prevent="() => {}">
        <VRow>
          <VCol cols="6">
            <AppTextField v-model="groupName" label="Group Name"/>
          </VCol>
          <VCol cols="6">
            <AppSelect v-model="selectedCategory" :items="categoryItems" item-title="text" item-value="value" label="Category" single-line/>
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="mindeposit" label="Minimum Deposit" />
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="spread" label="Spread" />
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="commission" label="Commission"/>
          </VCol>
          <VCol cols="6">
            <AppSelect v-model="selectedswap" :items="swapOptions" item-title="text" item-value="value" label="Swap" single-line/>
          </VCol>
           <VCol cols="6">
            <AppSelect v-model="selectedStatus" :items="statusOptions" item-title="text" item-value="value" label="Status" single-line/>
          </VCol>
          <VCol cols="6">
            <AppSelect v-model="selectedIbStatus" :items="ibOptions" item-title="text" item-value="value" label="IB Enabled" single-line/>
          </VCol> 
        </VRow>
        <p v-if="isMandotoryFilled===false" class="text-body-2 pt-3 pb-0 mb-3 text-error" >All fields are mandatory</p>
        <VRow>
          <VCol cols="6">
            <VBtn class="me-2" color="primary" @click="handleAddGroupSubmit()">
                        Submit
            </VBtn>
          </VCol>
        </VRow>
        <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you want to update group?" cancel-title="Cancelled"
                confirm-title="Cancelled!" />
      </VForm>
    </VCard>
   </VDialog>
</template>
    