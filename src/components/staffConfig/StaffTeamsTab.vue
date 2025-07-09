<script setup>
import { onMounted, ref } from "vue"


const staff_teamlist = ref([]) // Ensure staff_teamlist is defined

const isAddStaffModalVisible = ref(false)
const isTeamUpdateModalVisible = ref(false)
const selectedTeam = ref(null)
//function to get StaffTeams
const fetchStaffTeams = async () => fetchDataWithoutLocalStorage('getStaffTeams', staff_teamlist)
// Function to format date and time
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''

  const date = new Date(dateStr)

  // Define months and am/pm indicators
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM'
  const hours = date.getHours() % 12 || 12 // Convert to 12-hour format
  const minutes = date.getMinutes().toString().padStart(2, '0') // Pad minutes with leading zero

  // Format date as "20 Jun, 2024"
  const formattedDate = `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`
  // Format time as "04:15 PM"
  const formattedTime = `${hours}:${minutes} ${ampm}`

  return `${formattedDate}\n${formattedTime}`
}
onMounted(async () => {

  fetchStaffTeams()

})

function showAddStaffModal() {
  isAddStaffModalVisible.value = true
}

function showUpdateStaffModal(trans) {
  selectedTeam.value = trans
  isTeamUpdateModalVisible.value = true
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
                <VCardTitle>STAFF TEAMS</VCardTitle>
              </div>
              <div v-if="hasAccess('add_new_team')">
                <VBtn class="me-2" @click="showAddStaffModal()">Add Teams</VBtn>
              </div>
            </div>
          </VCardItem>
          <VCardText>
            <VList v-if="staff_teamlist.teams" class="card-list">
              <VListItem>
                <VTable>
                  <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Last Logged In</th>
                    <th>Sales Representative</th>
                    <th>Status</th>
                    <th>Total Members</th>
                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="item in staff_teamlist.teams" :key="item.id">
                    <td>{{ item.team_name }}</td>
                    <td>{{ formatDateTime(item.last_logged_in) }}</td>
                    <td>{{ item.staff_name }}</td>
                    <td>
                      <VChip :label="false" color="success" v-if="item.status === 1">
                        <small>Active</small>
                      </VChip>
                      <VChip :label="false" color="error" v-else>
                        <small>Inactive</small>
                      </VChip>
                    </td>

                    <td>{{ item.total_members }}

                      <VIcon class="ms-3" icon="tabler-eye me-2"/>
                    </td>
                    <td>
                      <VIcon v-if="hasAccess('edit_or_delete_team')" icon="tabler-edit"
                             @click="showUpdateStaffModal(item)"
                      />
                      <!-- <VIcon icon="tabler-trash" />-->
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

  <EditStaffTeamDialog v-model:isDialogVisible="isTeamUpdateModalVisible" :selectedTeam="selectedTeam"/>
  <AddStaffTeamsdialog v-model:isDialogVisible="isAddStaffModalVisible"/>
</template>

<style scoped lang="scss"></style>
