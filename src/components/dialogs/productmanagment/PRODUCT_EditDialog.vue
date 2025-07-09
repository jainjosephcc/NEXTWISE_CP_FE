<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const productName = ref('');
const shortDescription = ref('');
const lotsNeeded = ref('');
const sizeAvailableArray = ref([]);
const transformedArray = ref([]);
const availability = ref(false); 
const sizeLabel = ref('');
const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false); 
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const imageFile1 = ref([]);
const imageFile2 = ref([]);
const imageFile3 = ref([]);
const sizelabel=ref('')
const statusOptions = ref([
  { text: "Available", value: "available" },
  { text: "Unavailable", value: "unavailable" }
]);


const props = defineProps({
    selectedProduct: {
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
// Watch for changes in selectedProduct prop
watch(() => props.selectedProduct, (newProduct) => {
    if (newProduct) {
        productName.value = newProduct.product_name || '';
        shortDescription.value = newProduct.short_description || '';
        lotsNeeded.value = newProduct.lots_needed || '';
        availability.value=newProduct.availability
        imageFile1.value=newProduct.Image1;
        imageFile2.value=newProduct.Image2;
        imageFile3.value=newProduct.Image3;
         sizeAvailableArray.value = JSON.parse(newProduct.size_available);
         
        // Check if size_available is an array and has items
        // if (Array.isArray(newProduct.size_available) && newProduct.size_available.length > 0) {
        //     sizeAvailableArray.value = newProduct.size_available;
        //     transformedArray.value = sizeAvailableArray.value.map(item => ({
        //         label: item.label,
        //         status: item.status
        //     }));
        // // sizelabel.value=transformedArray.value.label
        // } else {
        //     sizeAvailableArray.value = [];
        //     transformedArray.value = [];
        // }
    }
}, { immediate: true });

// Method to update product
const updateProduct = async () => {
    // Example of accessing sizeAvailableArray.value
    console.log('Size Available Array:', sizeAvailableArray.value);
};
const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isApproveBtnLoading.value = true;
        console.log(im);
        try {
            const res = await $api('/transactions/deposit-ticket-process...', {
                method: 'POST',
                body: {
                    ProductName:ProductName.value ,
                    LotsNeeded: lotsNeeded.value,
                    shortDescription: shortDescription.value,
                    // sizeAvailabilityList:sizeAvailabilityList,
                    selectedCheckbox:availability.value,

                    action: 1,
                    // comment: "DEPOSIT APP. CR"
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isApproveBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res.result) {
                successTitle.value = 'Approved !'
                successMessage.value = 'Deposit Request Approved Successfully !';
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
// const statusOptions = ['Available', 'Unavailable'];

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
                            Edit Product{{sizeAvailableArray}}
                        </h6>
                    </div>
                </div>
            </div>
            <VForm @submit.prevent="() => {}">
                <VRow>
                    <VCol cols="12">
                        <VRow no-gutters>
                            <VCol cols="12" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis" for="productName">Product Name</label>
                            </VCol>
                        </VRow>
                    </VCol>
                    <VCol cols="12" md="12">
                        <AppTextField id="productName" v-model="productName" persistent-placeholder/>
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="12">
                        <VRow no-gutters>
                            <VCol cols="12" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis" for="shortDescription">Short Description</label>
                            </VCol>
                        </VRow>
                    </VCol>
                    <VCol cols="12" md="12">
                        <VTextarea id="shortDescription" v-model="shortDescription" persistent-placeholder/>
                    </VCol>
                </VRow>
                <!-- <VRow>
                    <VCol cols="12">
                        <VRow no-gutters>
                            <VCol cols="12" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis" for="">Sizes Available</label>
                            </VCol>
                        </VRow>
                    </VCol>
                    <VCol cols="6">
        <VRow v-for="(item, index) in sizeAvailableArray" :key="index" class="mb-3">
            {{item}} -->
    <!-- <VCol cols="12" md="8">
      <AppTextField 
        v-model="item.label" 
        persistent-placeholder 
        label="Size" 
      />
    </VCol>
    <VCol cols="12" md="4">
      <AppSelect 
        v-model="item.status" 
        :items="statusOptions" 
        persistent-placeholder 
        label="Availability" 
      />
    </VCol> -->
  <!-- </VRow>
                    </VCol>
                </VRow> -->
                <VRow>
                
                    <VCol cols="12">
                        <VRow no-gutters>
                            <VCol cols="12" class="d-flex align-items-center">
                                <label class="v-label text-body-2 text-high-emphasis" for="lotsNeeded">Lots Needed</label>
                            </VCol>
                        </VRow>
                    </VCol>
                    <!-- <VRow> -->
                        <VCol cols="12" md="6">
                            <AppTextField id="lotsNeeded" v-model="lotsNeeded" persistent-placeholder/>
                        </VCol>

                        <VCol cols="12" md="6">
                            <!-- <VRow no-gutters>
                                <VCol cols="3" md=""> -->
                                    <VCheckbox v-model="availability" label="Available"/>
                                <!-- </VCol>
                            </VRow> -->
                        </VCol>
                    <!-- </VRow> -->
                    <VRow>
                        <!-- <VCol cols="12" md=12> -->
                    <VCol cols="12" md="4">
                        <VFileInput accept="image/*" label="Image 1" v-model="imageFile1"/>
                    </VCol>
                    <VCol cols="12" md="4">
                        <VFileInput accept="image/*" label="Image 2" v-model="imageFile2"/>
                    </VCol>
                    <VCol cols="12" md="4">
                        <VFileInput accept="image/*" label="Image 3" v-model="imageFile3"/>
                    </VCol>
                        <!-- </VCol> -->
                    </VRow>

                    <VCol cols="12" md="12">
                        <VBtn class="me-2" :loading="isApproveBtnLoading" :disabled="isApproveBtnLoading" color="primary" @click="isConfirmDialogVisible = true">
                        Update
                    </VBtn>
                    </VCol>
                  <!-- <VBtn @click="updateProduct()">
                    Update
                  </VBtn> -->
                    
                
                </VRow>
                
                
            </VForm>
        </VCard>
    </VDialog>
    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you want to update the product?" cancel-title="Cancelled"
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
<style>

</style>
