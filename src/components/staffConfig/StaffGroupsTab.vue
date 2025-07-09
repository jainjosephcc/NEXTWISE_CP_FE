<script setup>

import { onMounted, ref } from "vue"

const staff_grouplist = ref([])
const isAddStaffModalVisible = ref(false)
const isGroupUpdateModalVisible = ref(false)
const selectedGroup = ref(null)
const fetchStaffGroup = async () => fetchDataWithoutLocalStorage('getStaffGroups', staff_grouplist)
onMounted(async () => {
  fetchStaffGroup()
})

function showAddStaffModal() {
  isAddStaffModalVisible.value = true
}

function showUpdateGroupModal(tran) {
  selectedGroup.value = tran
  isGroupUpdateModalVisible.value = true
}
</script>

<template>
  <section>
    <!--👉get StaffTeams -->
    <VRow>
      <VCol cols="12">
        <VCard class="custom-card">
          <VCardItem>
            <div class="d-flex align-center justify-space-between">
              <div>
                <VCardTitle>STAFF GROUP</VCardTitle>
              </div>
              <div v-if="hasAccess('add_new_group')">
                <VBtn class="me-2" @click="showAddStaffModal()">Add Groups</VBtn>
              </div>
            </div>
          </VCardItem>
          <VCardText>
            <VList v-if="staff_grouplist.groups" class="card-list">
              <VListItem>
                <VTable>
                  <thead>
                  <tr>
                    <th>Group Name</th>
                    <th>Description</th>
                    <th>Total Members</th>
                    <th>Status</th>

                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="item in staff_grouplist.groups" :key="item.id">
                    <td>{{ item.group_name }}</td>
                    <td>{{ item.description }}</td>

                    <td>{{ item.total_members }}
                      <VIcon class="ms-3" icon="tabler-eye me-2"/>
                    </td>
                    <td>
                      <VChip :label="false" color="success" v-if="item.status === 1">
                        <small>Active</small>
                      </VChip>
                      <VChip :label="false" color="error" v-else>
                        <small>Inactive</small>
                      </VChip>

                    </td>

                    <td>
                      <VIcon v-if="hasAccess('edit_or_delete_group')" icon="tabler-edit"
                             @click="showUpdateGroupModal(item)"
                      />
                      <!-- <VIcon icon="tabler-trash"  />   -->
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

  <AddStaffGroupsDialog v-model:isDialogVisible="isAddStaffModalVisible"/>
  <EditStaffGroupDialog v-model:isDialogVisible="isGroupUpdateModalVisible" :selectedGroup="selectedGroup"/>
</template>

<style scoped lang="scss"></style>
