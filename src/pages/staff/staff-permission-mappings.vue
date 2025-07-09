<script setup>
import { fetchDataWithoutLocalStorage } from "@/utils/apiUtils.js";
import { onMounted, ref, watch } from 'vue';

const groupListRes = ref(null);
const staff_grouplist = ref([]);
const currentTab = ref(null);
const permission_list = ref([]);
const selected_permission_ids = ref([]);
const error = ref(null);
const loadingPermissions = ref(true);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');

const fetchStaffGroups = async () => {
  await fetchDataWithoutLocalStorage('getStaffGroups', groupListRes);
}

watch(groupListRes, async (newVal) => {
  if (newVal) {
    staff_grouplist.value = newVal.groups;
    if (staff_grouplist.value.length > 0) {
      const firstGroupId = staff_grouplist.value[0].id;
      currentTab.value = firstGroupId;
      await fetchStaffGrupsdetails(firstGroupId);
    }
  }
});

const fetchStaffGrupsdetails = async (id) => {
  permission_list.value = []; // Clear previous permissions
  selected_permission_ids.value = []; // Clear previous selected permissions

  try {
    const res = await $api(`/getStaffGroupPermissions/${id}`, {
      method: 'GET',
    });

    if (res && res.selected_permission) {
      selected_permission_ids.value = res.selected_permission.map(perm => perm.id);
    } else {
      console.error('Selected permissions data not found:', res);
      return;
    }

    // Fetch all possible permissions from another endpoint
    const allPermissionsRes = await $api(`/getStaffGroupPermissions/0`, {
      method: 'GET',
    });

    if (allPermissionsRes && allPermissionsRes.permission) {
      const allPermissions = allPermissionsRes.permission;

      // Filter permissions based on selected permissions
      const filteredPermissions = allPermissions.map(category => {
        const filteredPerms = Object.values(category.permission);
        return {
          ...category,
          permission: filteredPerms
        };
      });

      permission_list.value = filteredPermissions;
    } else {
      console.error('All permissions data not found:', allPermissionsRes);
    }
  } catch (err) {
    console.error('Error fetching staff group permission list:', err);
  }
};

onMounted(() => {
  fetchStaffGroups();
});

const getStaffDetails = async (id) => {
  currentTab.value = id;
  await fetchStaffGrupsdetails(id);
};

const isChecked = (id) => {
  return selected_permission_ids.value.includes(id);
};

const updatePermissionSelection = (id) => {
  if (selected_permission_ids.value.includes(id)) {
    selected_permission_ids.value = selected_permission_ids.value.filter(permId => permId !== id);
  } else {
    selected_permission_ids.value.push(id);
  }
};

const handleConfirm = async () => {
  try {
    const payload = {
      groupId: currentTab.value,
      selected_permissionname: selected_permission_ids.value
    };

    const res = await $api('/storeAdminPermissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res && res.status === 1) {
      successTitle.value = 'Updated !';
      successMessage.value = 'Admin Permission Updated Successfully !';
      isSuccessDialogVisible.value = true;
    } else {
      errorTitle.value = 'Something Went Wrong !';
      errorMessage.value = res.message || 'An error occurred.';
      isErrorDialogVisible.value = true;
    }
  } catch (error) {
    errorTitle.value = 'Something Went Wrong !';
    errorMessage.value = error.message || 'An error occurred.';
    isErrorDialogVisible.value = true;
    console.error('Error updating admin permissions:', error);
  }
};

const handlePageReload = () => {
  window.location.reload();
};
</script>

<template>
  <section>
    <VRow>
      <VCol cols="4">
        <VCard>
          <VCardItem>
            <VCardTitle>USER GROUPS</VCardTitle>
          </VCardItem>
          <VCardText>
            <VList v-if="groupListRes" class="card-list">
              <VListItem v-for="item in staff_grouplist" :key="item.id" :value="item.id"
                @click="getStaffDetails(item.id)">
                <template #prepend>
                  <VChip :label="false" color="success">#{{ item.id }}</VChip>
                  <VListItemTitle class="font-weight-medium me-2">{{ item.group_name }}</VListItemTitle>
                </template>
                <template #append>
                  <div class="d-flex align-center gap-x-2">
                    <div class="text-body-1">{{ item.total_members }}</div>
                    <VIcon icon="tabler-users-group" />
                  </div>
                </template>
              </VListItem>
            </VList>
            <VSkeletonLoader v-else type="table-tbody" />
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="8">
        <VCard v-if="permission_list">
          <VCardText>
            <div class="d-flex align-center justify-space-between">
              <div>
                <VCardTitle>ALL PERMISSION MAPPING</VCardTitle>
              </div>
              <div>
                <VBtn class="me-2 mb-4" @click="isConfirmDialogVisible = true">Update</VBtn>
              </div>
            </div>

            <VExpansionPanels>
              <VExpansionPanel v-for="category in permission_list" :key="category.cat_id">
                <VExpansionPanelTitle>{{ category.category_name }}</VExpansionPanelTitle>
                <VExpansionPanelText>
                  <VDivider />
                  <VTable height="400" class="text-no-wrap">
                    <tbody>
                      <tr v-for="(permission, index) in category.permission" :key="index">
                        <td>
                          <VCheckbox :model-value="isChecked(permission.id)"
                            @change="updatePermissionSelection(permission.id)" :label="permission.permission_name" />
                        </td>
                        <td>{{ permission.description }}</td>
                      </tr>
                    </tbody>
                  </VTable>
                  <p v-if="!category.permission.length">No permissions found for this category.</p>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </VCardText>
        </VCard>
        <VSkeletonLoader v-else type="table-tbody" />
      </VCol>
    </VRow>
    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
      confirmation-question="Do you want to update staff permission?" cancel-title="Cancelled"
      confirm-title="Cancelled!" />

    <VDialog v-model="isErrorDialogVisible" max-width="500">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VBtn icon variant="outlined" color="error" class="my-4"
            style="block-size: 88px;inline-size: 88px; pointer-events: none;">
            <span class="text-5xl font-weight-light">X</span>
          </VBtn>
          <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
          <p>{{ errorMessage }}</p>
          <VBtn color="success" @click="handlePageReload">OK</VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <VDialog v-model="isSuccessDialogVisible" max-width="500">
      <VCard>
        <VCardText class="text-center px-10 py-6">
          <VBtn icon variant="outlined" color="success" class="my-4"
            style="block-size: 88px;inline-size: 88px; pointer-events: none;">
            <VIcon icon="tabler-check" size="38" />
          </VBtn>
          <h1 class="text-h4 mb-4">{{ successTitle }}</h1>
          <p>{{ successMessage }}</p>
          <VBtn color="success" @click="handlePageReload()">OK</VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

<style lang="scss" scoped>
.custom-card {
  max-width: 400px;
}

.card-list {
  --v-card-list-gap: 1.5rem;
}
</style>
