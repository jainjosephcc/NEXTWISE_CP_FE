<script setup>
import { ref } from "vue";

const ProductName = ref('')
const shortDescription=ref('')
const availability=ref('');
const LotsNeeded=ref('')
const sizes=ref('')
const sizeAvailabilityList = ref([{ size: '', availability: '' }]);
const selectedCheckbox=ref('false')
// const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const imageFile1 = ref([]);
const imageFile2 = ref([]);
const imageFile3 = ref([]);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const items = [
  'Available',
  'Unavailable'
]

const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits([
    'submit',
    'update:isDialogVisible',
])

const dialogModelValueUpdate = val => {
    emit('update:isDialogVisible', val)
}

function addsizes(){
    console.log("Hiii");
    sizeAvailabilityList.value.push({ size: '', availability: '' });
}
function removesizes(index) {
  if (sizeAvailabilityList.value.length > 1) {
    sizeAvailabilityList.value.splice(index, 1);
    
  }
}
const handleConfirm = async (confirmed) => {
    if (confirmed) {
        console.log(ProductName.value);
        console.log(LotsNeeded.value);
       const formData = new FormData();
      formData.append('product_name', ProductName.value);
      formData.append('lots_needed', LotsNeeded.value);
      formData.append('short_description', shortDescription.value);
      formData.append('size_available', JSON.stringify(sizeAvailabilityList.value));
      formData.append('availability', selectedCheckbox.value);
      
      // Append images if they are present
      formData.append('image1', imageFile1.value ? imageFile1.value[0] : '');
      formData.append('image2', imageFile2.value ? imageFile2.value[0] : '');
      formData.append('image3', imageFile3.value ? imageFile3.value[0] : '');
        try {
            console.log("HIii");
            const res = await $api('/products-add1', {
                method: 'POST',
                body: 
                    formData,
                    
                    // product_name:ProductName.value ,
                    // lots_needed: LotsNeeded.value,
                    // short_description: shortDescription.value,
                    // size_available:sizeAvailabilityList,
                    // availability:selectedCheckbox.value,
                    // image1:image1.value,
                    // image2:image2.value,
                    // image3:image3.value,
                
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    // isApproveBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Approved !'
                successMessage.value = 'Deposit Request Approved Successfully !';
                // isApproveBtnLoading.value = false;
                isSuccessDialogVisible.value = true;
            }
        }
        catch (Ex) {
            console.log("error ex");
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            // isApproveBtnLoading.value = false;
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
                            Add Product
                        </h6>
                    </div>
                </div>
            </div>
            <VForm @submit.prevent="() => {}">
                <VRow>
                    <VCol cols="12" md="8">
                        <AppTextField v-model="ProductName" label="Product Name" placeholder="Product Name" required/>
                    </VCol>

                    <VCol cols="12" md="4">
                        <AppTextField v-model="LotsNeeded" label="Lots Needed" placeholder="Lots Needed"/>
                    </VCol>
                    <VCol cols="12" class="d-flex align-items-center">
                        <label class="v-label text-body-2 text-high-emphasis" for="shortDescription">Short Description</label>
                    </VCol>
                    <VCol cols="12" md="12">
                        <VTextarea v-model="shortDescription" label="Short Description"/>
                    </VCol>
                    <VCol cols="12" md="4">
                        <label class="v-label text-body-2 text-high-emphasis" for="image1">Image 1</label>
                    </VCol>
                    <VCol cols="12" md="4">
                        <label class="v-label text-body-2 text-high-emphasis" for="image2">Image 2</label>
                    </VCol>
                    <VCol cols="12" md="4">
                        <label class="v-label text-body-2 text-high-emphasis" for="image3">Image 3</label>
                    </VCol>
                    <VCol cols="12" md="4">
                        <VFileInput accept="image/*" label="Image 1" v-model="imageFile1"/>
                    </VCol>
                    <VCol cols="12" md="4">
                        <VFileInput accept="image/*" label="Image 2" v-model="imageFile2"/>
                    </VCol>
                    <VCol cols="12" md="4">
                        <VFileInput accept="image/*" label="Image 3" v-model="imageFile3"/>
                    </VCol>
                    <VCol cols="12" md="12">
                        <VRow v-for="(item, index) in sizeAvailabilityList" :key="index">

                            <VCol cols="12" md="4">
                                <AppTextField v-model="item.size" label="Sizes" placeholder="Sizes"/>
                            </VCol>
                            <VCol cols="12" md="4">
                                <AppCombobox v-model="item.availability" :items="items" placeholder="Available" class="mt-6"/>
                            </VCol>
                            <VCol cols="12" md="2">
                                <VBtn color="success" @click="addsizes()" class="mt-6 mr-4">
                                +
                                </VBtn>
                            </VCol>
                            <VCol cols="12" md="2">
                                <VBtn color="error" @click="removesizes(index)" class="mt-6">
                                -
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCol>
                    <VCol>
                    <div class="demo-space-x">
                        <VCheckbox v-model="selectedCheckbox" label="Available" color="success"/>
                    </div>
                    </VCol>
                    <VCol cols="12" md="12">
                        <VBtn class="me-2" color="primary" @click="isConfirmDialogVisible = true">
                        Submit
                    </VBtn>
                    </VCol>
                    <!-- :loading="isApproveBtnLoading" :disabled="isApproveBtnLoading"  -->
                </VRow>
            </VForm>
        </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you want to save the product?" cancel-title="Cancelled"
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
