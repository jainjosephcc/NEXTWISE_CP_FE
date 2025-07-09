<script setup>


import {  onMounted } from 'vue';
import { fetchDataWithoutLocalStorage } from "@/utils/apiUtils.js"

const productData = ref(null);
const isProductDetailsDialogVisible = ref(false);
const selectedProduct = ref(null);
const isAddProductsDialogVisible=ref(false)

onMounted(async () => {
  fetchProductDetails();
});

const fetchProductDetails= () => fetchDataWithoutLocalStorage( 'products', productData);


const getImageUrl = (path) => {
    return `https://s3.ap-south-1.amazonaws.com/crm.paperboat.demo/bitrage/images/reward_products/${path}`;
  };

const truncateDescription = (description) => {
    if (description.length > 50) {
      return description.substring(0, 50) + '...';
    }
    return description;
  };

  
  const getSizeLabelsFromString = (escapedJsonString) => {
  try {
    const jsonString = JSON.parse(escapedJsonString);
    const sizes = JSON.parse(jsonString);
    return sizes.map(size => size.label).join(', ');
  } catch (error) {
    console.error('Failed to parse size data:', error);
    return '';
  }
};

function showProduct(product) {
    selectedProduct.value = product;
    isProductDetailsDialogVisible.value = true;
}
function addProduct() {
    isAddProductsDialogVisible.value = true;
    console.log("hii");
}

</script>

<template>
  <section>
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            Product Management
          </VCardTitle>
        </VCard>
      </VCol>
    </VRow>
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VBtn prepend-icon="tabler-plus" class="ml-5 mt-5" @click="addProduct()">
            Add Product
          </VBtn>
        </VRow>
      </VCardText>
      <VTable v-if="productData" height="800" class="text-no-wrap mt-5">
        <thead class="border-top">
          <tr>
            <th class="sorting sorting_asc" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width:860px;" aria-label="product: activate to sort column descending" aria-sort="ascending">PRODUCT IMAGE</th>
            <th class="sorting sorting_asc" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width:50px" aria-label="product: activate to sort column descending" aria-sort="ascending">PRODUCT NAME</th>
            <th class="sorting sorting_asc" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 2000px;" aria-label="product: activate to sort column descending" aria-sort="ascending">DESCRIPTION</th>
            <th class="sorting sorting_asc" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 398px;" aria-label="product: activate to sort column descending" aria-sort="ascending">SIZE</th>
            <th class="sorting sorting_asc" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 498px;" aria-label="product: activate to sort column descending" aria-sort="ascending">LOTS NEEDED</th>
            <th class="sorting sorting_asc" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 398px;" aria-label="product: activate to sort column descending" aria-sort="ascending">AVAILABILITY</th>
            <th class="sorting sorting_asc" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 398px;" aria-label="product: activate to sort column descending" aria-sort="ascending">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd mt-6" v-for="product in productData" :key="product.id">
            <td class="sorting_1">
              <div class="d-flex justify-content-start align-items-center product-name">
                <div class="avatar-wrapper">
                  <div class="avatar avatar me-4 rounded-2 bg-label-secondary">
                    <img v-if="product.image1" :src="getImageUrl(product.image1)" alt="Product Image" class="img-thumbnail small-image mr-1" />
                    <img v-if="product.image2" :src="getImageUrl(product.image2)" alt="Product Image" class="img-thumbnail small-image mr-1" />
                    <img v-if="product.image3" :src="getImageUrl(product.image3)" alt="Product Image" class="img-thumbnail small-image" />
                  </div>
                </div>
              </div>
            </td>
            <td>
              <span class="text-truncate d-flex align-items-center">
                <span class="avatar-sm rounded-circle d-flex justify-content-center align-items-center bg-label-success">
                  <i class="ti ti-shoe ti-sm"></i>
                </span>
                {{ product.product_name }}
              </span>
            </td>
            <td>
              <span class="d-flex align-items-center text-heading">
                <span class="avatar-sm rounded-circle d-flex justify-content-center align-items-center bg-label-success">
                  <i class="ti ti-shoe ti-sm"></i>
                </span>
                {{ truncateDescription(product.short_description) }}
              </span>
            </td>
            <td>
              <span class="avatar-sm rounded-circle d-flex justify-content-center align-items-center bg-label-success ">{{ getSizeLabelsFromString(product.size_available) }}
              </span>
            </td>
            <td>
              <span class="avatar-sm rounded-circle d-flex justify-content-center align-items-center bg-label-success ms-6">{{ product.lots_needed }}
              </span>
            </td>
            <td>
              <span class="justify-content-center align-items-center ">
                <VChip v-if="product.availability" color="success" variant="outlined">
                  Available
                </VChip>
                <VChip v-else color="error" variant="outlined">
                  Unavailable
                </VChip>
              </span>
            </td>
            <td>
              <VIcon icon="tabler-edit" @click="showProduct(product)" />
            </td>
          </tr>
        </tbody>
      </VTable>
      <VSkeletonLoader v-else
                       v-for="i in 3"
                       :key="i"
                       type="table-tbody"
      />
    </VCard>
  </section>

  <PRODUCT_EditDialog v-model:isDialogVisible="isProductDetailsDialogVisible"
        :selectedProduct="selectedProduct" />
  <PRODUCT_AddDialog v-model:isDialogVisible="isAddProductsDialogVisible" />
  
</template>

<style scoped lang="scss">
  .small-image {
  width: 40px;
  height: 40px; 
  object-fit: cover;
  border-radius: 8px; /* Ensure the image fits within the specified dimensions */
}
</style>
