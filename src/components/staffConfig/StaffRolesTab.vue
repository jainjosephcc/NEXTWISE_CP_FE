<script setup>
import { onMounted, ref } from 'vue'


const staff_rolelist = ref([])
const isAddStaffModalVisible = ref(false)
const isGroupUpdateModalVisible = ref(false)
const selectedRole = ref(null)
// Function to get StaffRoles
const fetchStaffRoles = async () => fetchDataWithoutLocalStorage('getStaffRoles', staff_rolelist)


// Fetch roles on mount
onMounted(async () => {
  fetchStaffRoles()
})

function showAddStaffModal() {
  isAddStaffModalVisible.value = true
}

function showUpdateGroupModal(trans) {
  selectedRole.value = trans
  isGroupUpdateModalVisible.value = true
}
</script>

<template>
  <section>
    <!-- Staff Roles -->
    <VRow>
      <VCol cols="12">
        <VCard class="custom-card">
          <VCardItem>
            <div class="d-flex align-center justify-space-between">
              <div>
                <VCardTitle>STAFF ROLES</VCardTitle>
              </div>
              <div v-if="hasAccess('add_new_role')">
                <VBtn class="me-2" @click="showAddStaffModal()">Add Roles</VBtn>
              </div>
            </div>
          </VCardItem>
          <VCardText>
            <VList v-if="staff_rolelist.roles" class="card-list">
              <VListItem>
                <VTable>
                  <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Total Members</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="role in staff_rolelist.roles" :key="role.id">
                    <td>{{ role.role_name }}</td>
                    <td>{{ role.description }}</td>
                    <td>{{ role.total_members }}
                      <VIcon class="ms-3" icon="tabler-eye me-2"/>
                    </td>
                    <td>
                      <VChip :label="false" color="success" v-if="role.status === 1">
                        <small>Active</small>
                      </VChip>
                      <VChip :label="false" color="error" v-else>
                        <small>Inactive</small>
                      </VChip>
                    </td>
                    <td>
                      <VIcon v-if="hasAccess('edit_or_delete_role')" icon="tabler-edit"
                             @click="showUpdateGroupModal(role)"
                      />
                      <!-- <VIcon icon="tabler-trash" /> -->
                    </td>
                  </tr>
                  </tbody>
                </VTable>
              </VListItem>
            </VList>
            <VSkeletonLoader v-else type="table-tbody"/>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </section>

  <!-- Add Staff Roles Dialog -->
  <AddStaffRolesDialog v-model:isDialogVisible="isAddStaffModalVisible"/>
  <EditStaffRoleDialog v-model:isDialogVisible="isGroupUpdateModalVisible" :selectedRole="selectedRole"/>
</template>
