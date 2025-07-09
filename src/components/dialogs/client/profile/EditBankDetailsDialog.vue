<script setup>

import md5 from "blueimp-md5";
const bank_id=ref(null);
const acc_no=ref(null);
const holder_name=ref(null);
const bank_name=ref(null);
const country=ref(null);
const iban=ref(null);
const ifsc=ref(null);
const address=ref(null)
const isConfirmDialogVisible=ref(false);
const isUpdateBtnLoading=ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
let MD5Hash = ref('')
let checksum = ref('')
const client_id=ref(null)


const props = defineProps({
  bank_details: {
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

watch(() => props.bank_details, (bank) => {
  if (bank) {
    client_id.value=bank.client_id;
    bank_id.value=bank.id;
    acc_no.value = bank.account_no || '';
    holder_name.value = bank.holder_name || '';
    bank_name.value = bank.bank_name || '';
    country.value=bank.country ||'';
    iban.value=bank.iban;
    ifsc.value=bank.ifsc_code||'';
    address.value=bank.bank_address||'';
  }
}, { immediate: true });

function updateBank(){
    isConfirmDialogVisible.value=true;
    
}

const handleConfirm = async (confirmed) => {
    if (confirmed) {
      isUpdateBtnLoading.value=true;
      const clientIdStr = String(client_id.value);
      const accountNoStr = String(acc_no.value);
      const bankIdStr = String(bank_id.value);

      MD5Hash.value = clientIdStr + accountNoStr + bankIdStr;
      checksum.value = md5(MD5Hash.value);
        try {
            const res = await $api('/updateCbankDetails', {
                method: 'POST',
                body: {
                    client_id:client_id.value ,
                    account_no:acc_no.value,
                    ifsc_code:ifsc.value,
                    iban:iban.value,
                    checksum:checksum.value,
                    bank_name:bank_name.value,
                    bank_address:address.value,
                    holder_name:holder_name.value,
                    country:country.value
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isUpdateBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Bank Details Updated Successfully !';
                isUpdateBtnLoading.value = false;
                isSuccessDialogVisible.value = true;
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isUpdateBtnLoading.value = false;
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
      <div class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
        <!-- 👉 Left Content -->
        <div>
          <div class="d-flex align-center app-logo ">
            <h6 class="app-logo-title">
  
              Edit Bank Details 
            </h6>
          </div>
        </div>
      </div>
      <VForm @submit.prevent="() => {}">
        <VRow>
          <VCol cols="6">
            <AppTextField v-model="acc_no" label="Account Number" readonly/>
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="holder_name" label="Account Holder Name"/>
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="bank_name" label="Bank Name"/>
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="country" label="Country"/>
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="iban" label="IBAN"/>
          </VCol>
          <VCol cols="6">
            <AppTextField v-model="ifsc" label="IFSC Code"/>
          </VCol>
          <VCol cols="12">
            <AppTextarea class="mt-2" v-model="address" label="Bank Address" auto-grow/>
          </VCol>
          <VCol cols="6">
            <VBtn color="primary" @click="updateBank" :loading="isUpdateBtnLoading">
                <!-- @click="isConfirmDialogVisible=true"> -->
                        Update
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
    </VDialog>
    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Do you want to update the bank details?" cancel-title="Cancelled"
                confirm-title="Cancelled!" />

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
</template>
