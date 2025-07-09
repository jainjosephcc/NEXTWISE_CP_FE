<script setup>
import { onMounted, ref } from 'vue';

// State variables
const staff_categorylist = ref(null); // List of staff categories
const permission_list = ref(null); // List of permissions for the selected category
const currentTab = ref(null); // Current selected tab (category)
const selectedCategoryTitle = ref(null);
const firstcategoryId = ref(null); // ID of the first category
const isAddCategoryModalVisible = ref(false); // Visibility of the Add Category modal
const isAddPermissionModalVisible = ref(false); // Visibility of the Add Permission modal
const isEditPermissionModalVisible = ref(false); // Visibility of the Edit Permission modal

// Function to fetch staff category list
const fetchStaffCategory = async () => {
  try {
    const res = await $api('/getStaffGroupPermissions/0', {
      method: 'GET',
    });
    if (res && res.permission) {
      staff_categorylist.value = res.permission;
      if (staff_categorylist.value.length > 0) {
        const firstCategory = staff_categorylist.value[0];
        firstcategoryId.value = firstCategory.cat_id;
        selectedCategoryTitle.value = firstCategory.category_name;
        currentTab.value = firstCategory.cat_id;
        await fetchStaffPermission(firstCategory.cat_id);
      }
    } else {
      console.error('Staff groups data not found:', res);
    }
  } catch (err) {
    console.error('Error fetching staff group list:', err);
  }
};

// Function to fetch staff permissions
const fetchStaffPermission = async (categoryId) => {

  if (!categoryId) {
    console.error('Category ID is not set');
    return;
  }

  try {
    const res = await $api(`/getStaffPermissions/${categoryId}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response);
      },
    });

    if (res && res.permission) {
      permission_list.value = res.permission;
    } else {
      console.error('Failed to fetch permission list or empty response');
    }
  } catch (err) {
    console.error('Error fetching permission list:', err);
  }
};

// Lifecycle hook to fetch staff categories on component mount
onMounted(() => {
  fetchStaffCategory();
});

// Function to get permission details for a selected category
const getPermissionDetails = (id, name) => {
  permission_list.value = null;
  firstcategoryId.value = id;
  selectedCategoryTitle.value = name;
  fetchStaffPermission(id);
};

// Function to show the Add Category modal
function showAddCategoryModal() {
  isAddCategoryModalVisible.value = true;
}

// Function to show the Add Permission modal
function showAddPermissionModal() {
  isAddPermissionModalVisible.value = true;
}

// Function to show the Edit Permission modal
function showEditPermissionModal() {
  isEditPermissionModalVisible.value = true;
}
</script>

<template>
  <section>
    <!-- Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <VCol cols="12">
          <VCard>
            <VCardText>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <VCardTitle>
                    Staff Permission Management
                  </VCardTitle>
                </div>
                <div>
                  <VBtn class="me-2" @click="showAddCategoryModal()"> Add Category</VBtn>
                  <VBtn class="me-2" @click="showAddPermissionModal()">Add Permission</VBtn>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <VRow>
      <VCol cols="4">
        <VCard>
          <VCardItem>
            <VCardTitle>
              CATEGORIES
            </VCardTitle>
          </VCardItem>
          <VCardText>
            <VList v-if="staff_categorylist" class="card-list">
              <VListItem v-for="item in staff_categorylist" :key="item.cat_id" :value="item.cat_id"
                @click="getPermissionDetails(item.cat_id, item.category_name)">
                <template #prepend>
                  <VChip :label="false" color="success">#{{ item.cat_id }}</VChip>
                  <VListItemTitle class="font-weight-medium me-2">
                    {{ item.category_name }}
                  </VListItemTitle>
                </template>
              </VListItem>
            </VList>
            <VSkeletonLoader v-else type="table-tbody" />
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="8">
        <VCard class="flex-grow-1">
          <VCardItem>

            <VCard>
              <VCardTitle>
                <div class="d-flex align-center justify-space-between mb-3">
                  <div v-if="permission_list">
                    {{ selectedCategoryTitle }}
                  </div>

                </div>

              </VCardTitle>
              <VRow v-if="permission_list">
                <!-- {{currencyList}} -->
                <VCol cols="6" v-for="(permission, index) in permission_list" :key="permission.id">

                  <VRow>
                    <VCol><strong>{{ permission.permission_name }} </strong>
                      <div> {{ permission.description }} </div>
                    </VCol>

                    <VBtn icon="tabler-edit" variant="text" color="info" class="me-2"
                      @click="showEditPermissionModal()" />
                    <VBtn icon="tabler-trash" variant="text" color="info" />
                  </VRow>



                </VCol>
              </VRow>
              <VSkeletonLoader v-else type="table-tbody" />

            </VCard>

          </VCardItem>
        </VCard>
      </VCol>
    </VRow>
  </section>
  <AddCategoryPermissionDialog v-model:isDialogVisible="isAddCategoryModalVisible" />
  <AddPermissionLIstDialog v-model:isDialogVisible="isAddPermissionModalVisible" />
  <EditPermissionListDialog v-model:isDialogVisible="isEditPermissionModalVisible" />
</template>

<style scoped lang="scss"></style>
