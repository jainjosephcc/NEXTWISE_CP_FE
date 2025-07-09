<script setup>
import { ref } from 'vue';

// Define your tip list array
const tiplist = ref([]);
const isEditTipModal=ref(false);
const selectedTip=ref(null)
const isDeleteConfirmDialog=ref(false)
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');
const tipId=ref(null)
const isShowAddModal=ref(false)

onMounted(async () => {
  fetchTradingTips();
});

const fetchTradingTips = async () => {
  try {
    const res = await $api('learning/get-forex-tips', {
      method: 'GET',
    });
    if (res) {
        tiplist.value=res.data;
    }

  } catch (err) {
    console.error('Error fetching group category:', err);
    error.value = err;
  }
}

function showEditModal(tip){
    selectedTip.value=tip
    isEditTipModal.value=true;
    
}
function handleDelete(tip){
    tipId.value=tip.id
    isDeleteConfirmDialog.value=true

}

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        try {
            const res = await $api('learning/delete-forex-tip', {
                method: 'POST',
                body: {
                    id:tipId.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong!';
                    errorMessage.value = response._data.message;
                    isErrorDialogVisible.value = true;
                },
            });
            if (res) {
                successTitle.value = 'Updated!';
                successMessage.value = 'Trading Tip Deleted Successfully!';
                isSuccessDialogVisible.value = true;
            }
        } catch (Ex) {
            errorTitle.value = 'Something Went Wrong!';
            errorMessage.value = Ex.data.message;
            isErrorDialogVisible.value = true;
        }
    }
};

const handlePageReload = async (confirmed) => {
  window.location.reload()
}
</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <VCol cols="12">
          <VCard>
            <VRow class="mt-3 mb-3 mr-3">
            <VCol class="d-flex align-center justify-space-between">
                <!-- Left-aligned content, can add something here if needed -->
                <div>
                <VCardTitle>
                    Trading Tips
                </VCardTitle>
                </div>
                <div>
                <VBtn class="me-2" @click="isShowAddModal=true"><VIcon icon="tabler-plus"/>Add Tips</VBtn>
                </div>
            </VCol>
            </VRow>
            <VDivider/>

            <VTable v-if="tiplist.length" height="800" fixed-header class="text-no-wrap">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TITLE</th>
                  <th>TIP</th>
                  <th>LEVEL</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tip in tiplist">
                  <td>{{ tip.id }}</td>
                  <td>{{ tip.title }}</td>
                  <td class="tip-text">{{ tip.tip }}</td>
                  
                  <td>
                    <VChip v-if="tip.level==='high'" color="error" :label="false">{{ tip.level }}</VChip>
                    <VChip v-if="tip.level==='low'" color="info" :label="false">{{ tip.level }}</VChip>
                    <VChip v-if="tip.level==='medium'" color="warning" :label="false">{{ tip.level }}</VChip></td>
                  <td><VChip v-if="tip.status===1" color="primary" label size="small" variant="outlined">Active</VChip>
                      <VChip v-if="tip.status===0" color="error" label size="small" variant="outlined">Inactive</VChip>
                  </td>
                    <!-- {{ tip.status ? 'Active' : 'Inactive' }}</td> -->
                  <td>
                    <VIcon icon="tabler-edit" class="me-2" @click="showEditModal(tip)"/>
                    <VIcon icon="tabler-trash" @click="handleDelete(tip)"/>
                 </td>
                </tr>
              </tbody>
            </VTable>
            <VSkeletonLoader v-else v-for="i in 3" :key="i" type="table-tbody"/>

          </VCard>
        </VCol>
      </VRow>
    </div>
  </section>

  <!-- Add Dialog -->
  <AddTradingTipDialog v-model:isDialogVisible="isShowAddModal"/>
  <!-- Edit Dialog -->
  <EditTradingTipDialog v-model:isDialogVisible="isEditTipModal" :selectedTip="selectedTip" />

  <ConfirmDialog v-model:isDialogVisible="isDeleteConfirmDialog" @confirm="handleConfirm"
                confirmation-question="Are you sure you want to delete the Trading Tip?"
                cancel-title="Cancelled" confirm-title="Cancelled!" />

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
                    style=" block-size: 88px; inline-size: 88px; pointer-events: none;">
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
</template>
<style>
.tip-text {
  max-width: 400px; 
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis; 
}
</style>
