<script setup>

import { computed, onMounted, ref, watch } from "vue"

const headerData = ref({ total_staff: 0, managers: 0, rms: 0, total_clients: 0 })
const staffData = ref(null)
const rolesList = ref(null)
const groupsList = ref(null)
const teamsList = ref(null)


const searchQuery = ref('')
const selectedGroup = ref(null)
const selectedTeam = ref(null)
const selectedRole = ref(null)
const isAddStaffDrawerVisible = ref(false)// Drawer visibility

const fetchHeaderData = async () => {
  const res = await $api('/staff/staff-filter-headers', {
    method: 'GET',
    onResponseError({ response }) {
      console.log(response)
    },
  })
  //console.log(res);
  headerData.value.total_staff = res.all_staff_count
  headerData.value.total_clients = res.total_clients
  headerData.value.rms = res.relationship_manager_count
  headerData.value.managers = res.managers_count
  rolesList.value = res.roles.map(role => ({ title: role.role_name, value: role.id }))
  groupsList.value = res.groups.map(group => ({ title: group.group_name, value: group.id }))
  teamsList.value = res.teams.map(team => ({ title: team.team_name, value: team.id }))
  //headerData.value = await res.result;
}

const fetchStaffData = async () => {
  const res = await $api('/staff/staff-list', {
    method: 'POST',
    body: {
      keyword: searchQuery.value,
      groupId: selectedGroup.value,
      teamId: selectedTeam.value,
      roleId: selectedRole.value,
    },
    onResponseError({ response }) {
      console.log(response)
    },
  })
  staffData.value = await res.result.staff_list
}

onMounted(async () => {
  fetchHeaderData()
  fetchStaffData()
})

watch([searchQuery, selectedRole, selectedGroup, selectedTeam], () => {
  fetchStaffData()
}, { deep: true, immediate: false })


const widgetData = computed(() => [
  {
    title: 'Total Staff',
    value: headerData.value.total_staff.toString(),
    desc: 'Added Staffs', icon: 'tabler-users', iconColor: 'primary',
  },
  {
    title: 'Managers',
    value: headerData.value.managers.toString(),
    desc: 'Mapped as Managers', icon: 'tabler-chart-arrows-vertical', iconColor: 'warning',
  },
  {
    title: 'Relationship Managers',
    value: headerData.value.rms,
    desc: 'Normal RMs', icon: 'tabler-user-bolt', iconColor: 'success',
  },
  {
    title: 'Total Clients',
    value: headerData.value.total_clients,
    desc: 'Registered Clients Count', icon: 'tabler-user-dollar', iconColor: 'danger',
  },
])

function showAddStaffModal() {
  isAddStaffDrawerVisible.value = true
}

</script>

<template>
  <section>

    <div class="d-flex mb-6">
      <VRow>
        <template v-for="(data, id) in widgetData" :key="id">
          <VCol cols="12" md="3" sm="6">
            <VCard>
              <VCardText>
                <div class="d-flex justify-space-between">
                  <div class="d-flex flex-column gap-y-1">
                    <div class="text-body-1 text-high-emphasis">
                      {{ data.title }}
                    </div>
                    <div class="d-flex gap-x-2 align-center">
                      <h5 class="text-h5">
                        {{ data.value }}
                      </h5>
                      <div v-if="data.change" class="text-base"
                           :class="data.change > 0 ? 'text-success' : 'text-error'"
                      >
                        ({{ prefixWithPlus(data.change) }}%)
                      </div>
                    </div>
                    <div class="text-sm">
                      {{ data.desc }}
                    </div>
                  </div>
                  <VAvatar :color="data.iconColor" variant="tonal" rounded size="42">
                    <VIcon :icon="data.icon" size="26"/>
                  </VAvatar>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </template>
      </VRow>
    </div>
    <div class="d-flex mb-6">
      <VRow>
        <VCol cols="12">
          <VCard>
            <VCardText>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <VCardTitle>
                    Staff List
                  </VCardTitle>
                </div>
                <div v-if="hasAccess('add_staff')">
                  <VBtn class="me-2" @click="showAddStaffModal()"> Add Staff</VBtn>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <!-- 👉 Select MT ACCOOUNT -->
          <VCol cols="12" sm="3">
            <AppTextField v-model="searchQuery" label="Search by Name/Email" placeholder="Search Staff"/>
          </VCol>


          <!-- 👉 Select STAFF TEAMS -->
          <VCol v-if="teamsList && hasAccess('view_teams_groups')" cols="12" sm="3">
            <AppSelect label="Staff Teams" v-model="selectedTeam" placeholder="Team" :items="teamsList" clearable
                       clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select STAFF ROLES -->
          <VCol v-if="rolesList && hasAccess('view_teams_groups')" cols="12" sm="3">
            <AppSelect label="Staff Roles" v-model="selectedRole" placeholder="Roles" :items="rolesList" clearable
                       clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select STAFF GROUP -->
          <VCol v-if="groupsList && hasAccess('view_teams_groups')" cols="12" sm="3">
            <AppSelect label="Permission Group" v-model="selectedGroup" placeholder="Group" :items="groupsList"
                       clearable clear-icon="tabler-x"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider/>
      <VTable v-if="staffData" height="800" class="text-no-wrap">
        <thead>
        <tr>
          <th>
            Joined On
          </th>
          <th>
            NAME/EMAIL
          </th>
          <th>
            LAST LOGGED-IN
          </th>
          <th v-if="hasAccess('view_teams_groups')">
            ROLE
          </th>
          <th v-if="hasAccess('view_teams_groups')">
            TEAM
          </th>
          <th v-if="hasAccess('view_teams_groups')">
            GROUP
          </th>
          <th>
            ACTIONS
          </th>
        </tr>
        </thead>

        <tbody>
        <tr v-if="staffData" class="" v-for="staff in staffData" :key="staff.id">

          <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
            <VChip size="x-small">
              #{{ staff.id }}
            </VChip>
            <br/>
            {{ formatDateToMonthShort(staff.created_at) }}
          </td>

          <td>
            <CustomStaffCardChip :rm_id="staff.id" :rm_name="staff.staff_name" :rm_email="staff.email"/>
          </td>
          <td>
            {{ formatDateToMonthShort(staff.last_logged_in) }}
          </td>

          <td v-if="hasAccess('view_teams_groups')">
            {{ staff.role_name }}
          </td>
          <td v-if="hasAccess('view_teams_groups')">
            {{ staff.team_name }}
          </td>
          <td v-if="hasAccess('view_teams_groups')">
            {{ staff.group_name }}
          </td>
          <td>
            <RouterLink :to="`/staff/staff-${staff.id}-home-null-details`">
              <VIcon class="ms-3" icon="tabler-eye me-2"/>
            </RouterLink>
          </td>

        </tr>
        <VProgressLinear v-else indeterminate color="primary"/>
        </tbody>
      </VTable>
      <VSkeletonLoader v-else type="table-tbody"/>
    </VCard>

    <AddStaffDialog v-if="groupsList && rolesList" v-model:isDrawerOpen="isAddStaffDrawerVisible"
                    :groupsList="groupsList" :teamsList="teamsList" :rolesList="rolesList"
    />
  </section>
</template>

<style scoped lang="scss"></style>
