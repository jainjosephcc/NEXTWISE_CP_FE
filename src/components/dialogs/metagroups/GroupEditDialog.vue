<script setup>
import { ref } from "vue";
const categoryname = ref('');
const selectedItem=ref('');
const mindeposit=ref('');
const spread=ref('');
const commission=ref('');
const swap=ref('');
const categoryItems=ref(null);
const selectedCategory = ref(null);
const selectedswap = ref(null);
const selectedStatus=ref(null);
const selectedIbStatus=ref(null);
const isSubmitBtnLoading = ref(false);
const isSubmitBtnDisable=ref(false);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const isSubmitLoading = ref(false);
const isDisabled = ref(false);
let successTitle = ref('')
let successMessage = ref('')
let errorTitle = ref('')
let errorMessage = ref('')
const group_id=ref(null);

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
  selectedGroup: {
    type: Object,
    required: false,
  },
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

watch(() => props.selectedGroup, (newCategory) => {
  if (newCategory) {
    group_id.value=newCategory.id;
    categoryname.value = newCategory.mt_group_name || '';
    mindeposit.value = newCategory.min_deposit || 0;
    spread.value = newCategory.spread || 0;
    commission.value=newCategory.commission ||0;
    selectedswap.value=newCategory.swap || 0;
    selectedStatus.value=newCategory.status || 0;
    selectedIbStatus.value=newCategory.ib_enabled || 0;
    selectedCategory.value=props.selectedGroup.mt_category;

    categoryItems.value = props.categoryList.group_category.map(category => ({
      text: category.category_name,
      value: category.id
    }));
  }
}, { immediate: true });

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isSubmitBtnLoading.value = true;
         isSubmitBtnDisable.value=true;
        try {
          console.log(selectedCategory,'sa');
            const res = await $api('/editMtGroup', {
                method: 'POST',
                body: {
                  mt_group_id:group_id.value,
                  mt_category:selectedCategory.value,
                  min_deposit:mindeposit.value,
                  spread:spread.value,
                  commission:commission.value,
                  swap:selectedswap.value,
                  status:selectedStatus.value,
                  ib_enabled:selectedIbStatus.value
                },
                onResponseError({ response }) {
                  console.log(response._data.min_deposit);
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.min_deposit;
                    isSubmitBtnLoading.value = false;
                     isSubmitBtnDisable.value=false;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Updated !'
                successMessage.value = 'Group Updated Successfully !';
                isSubmitBtnLoading.value = false;
                isSubmitBtnDisable.value=false;
                isSuccessDialogVisible.value = true;
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isSubmitBtnLoading.value = false;
            isSubmitBtnDisable.value=false;
            isErrorDialogVisible.value = true;
        }

    }
}
const handlePageReload = async (confirmed) => {
  window.location.reload();
}

</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
    <VCard class="pa-6 pa-sm-10">
      <div
        class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
        <!-- 👉 Left Content -->
        <div>
          <div class="d-flex align-center app-logo ">
            <h6 class="app-logo-title">
              Update Group
            </h6>
          </div>
        </div>
      </div>
      <VForm @submit.prevent="() => {}">
        <VRow>
          <VCol cols="6">
            <AppTextField v-model="categoryname" label="Group Name" readonly/>
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
        <VRow>
          <VCol cols="6">
            <VBtn class="me-2" :loading="isSubmitBtnLoading" :disabled="isSubmitBtnDisable" color="primary" @click="isConfirmDialogVisible = true">
                        Update
            </VBtn>
          </VCol>
        </VRow>
      </VForm>

      <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you sure you want to update the MT5 group?" cancel-title="Cancelled"
                confirm-title="Cancelled!" />
       
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
            <VBtn color="success" @click="handlePageReload">
              Ok
            </VBtn>
          </VCardText>
        </VCard>
      </VDialog>

      
    </VCard>

  </VDialog>
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
  
</template>
<style>

</style>

