<script setup>
const currentTab = ref('window-1')
const category_list = ref([])
const first_cat_id = ref(null)
const groupList = ref([])
const group_list = ref(null)
const selectedGroup = ref(null)
const isGroupUpdateModalVisible = ref(false)
const isAddCategoryModalVisible = ref(false)
const isAddGroupModalVisible = ref(false)

onMounted(async () => {
  await fetchGroupCategory()
})

const fetchGroupCategory = async () => {
  try {
    const res = await $api('/getGroupCategories', {
      method: 'GET',
    })
    if (res) {
      category_list.value = res
      first_cat_id.value = category_list.value.group_category[0].id
      if (category_list.value.group_category.length > 0) {
        currentTab.value = category_list.value.group_category[0].id
      }
      fetchGroupList()
    }

  } catch (err) {
    console.error('Error fetching algo list:', err)
    error.value = err
  }
}

const fetchGroupList = async () => {
  group_list.value = null
  if (!first_cat_id.value) {
    console.error('First category ID is not set')
    return
  }

  try {
    const res = await $api(`/getMT5GroupList/${first_cat_id.value}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response)
      },
    })

    if (res && res.mt_groups) {
      groupList.value = res
      group_list.value = groupList.value.mt_groups
    } else {
      console.error('Failed to fetch group list or empty response')
    }
  } catch (err) {
    console.error('Error fetching group list:', err)
  }
}

function getGroupDetails(id) {
  first_cat_id.value = id
  fetchGroupList()

}

function showUpdateGroupModal(category) {
  selectedGroup.value = category
  isGroupUpdateModalVisible.value = true
}

function showAddCategoryModal() {
  isAddCategoryModalVisible.value = true
}

function showAddGroupModal() {
  isAddGroupModalVisible.value = true
}
</script>

<template>
  <!-- 👉 HEADER WIDGET START-->
  <CustomMT5GroupsHeader/>
  <!-- 👉 HEADER WIDGET END-->
  <VCard>
    <div class="d-flex align-center justify-space-between">
      <div class="flex-grow-1 me-4">
        <VCardTitle>MT5 Group Management</VCardTitle>
        <VCardSubtitle class="pb-3">Manage MT5 Groups</VCardSubtitle>
      </div>
      <div>
        <VBtn v-if="hasAccess('add_mt5_category')" class="me-2" @click="showAddCategoryModal()">Add Category</VBtn>
        <VBtn v-if="hasAccess('add_mt5_group')" class="me-2" @click="showAddGroupModal()">Add Group</VBtn>
      </div>
    </div>

    <VDivider/>

    <VCardItem>
      <div class="d-flex gap-6">
        <div>
          <VTabs v-model="currentTab" direction="vertical" class="v-tabs-pill">
            <VTab v-for="category in category_list.group_category" :key="category.id" :value="category.id"
                  @click="getGroupDetails(category.id)"
            >
              <VIcon start icon="tabler-list-details"/>
              {{ category.category_name }}
            </VTab>
          </VTabs>
        </div>

        <VCard>
          <!-- 👉 GROUP LISTING START-->
          <VCardText>
            <VWindow v-model="currentTab">
              <VWindowItem v-for="category in category_list.group_category" :key="category.id" :value="category.id">
                <p class="mb-0">

                  CATEGORY : {{ category.category_name }}
                  <VDivider/>
                  <VTable v-if="group_list" height="800" class="text-no-wrap">
                    <thead>
                    <tr>
                      <th>
                        #gid
                      </th>
                      <th>
                        Group Name
                      </th>
                      <th>
                        Min. Deposit
                      </th>
                      <th>
                        Spread From
                      </th>
                      <th>
                        Commission
                      </th>
                      <th>
                        Swap
                      </th>
                      <th>
                        Status
                      </th>
                      <th>
                        Update
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="group in group_list">

                      <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
                        <VChip size="x-small">
                          #{{ group.id }}
                        </VChip>
                      </td>

                      <td>
                        {{ group.mt_group_name }}

                      </td>
                      <td>
                        {{ formatCurrency(group.min_deposit) }}

                      </td>
                      <td>
                        {{ formatCurrency(group.spread) }}

                      </td>
                      <td>
                        {{ formatCurrency(group.commission) }}

                      </td>
                      <td>
                        <VChip :label="false" color="success" v-if="group.swap == 1">
                          <small>AVAILABLE</small>
                        </VChip>
                        <VChip :label="false" color="error" v-else>
                          <small>UNAVAILABLE</small>
                        </VChip>
                      </td>
                      <td>
                        <VChip :label="false" color="success" v-if="group.status == 1">
                          <small>AVAILABLE</small>
                        </VChip>
                        <VChip :label="false" color="error" v-else>
                          <small>UNAVAILABLE</small>
                        </VChip>
                      </td>
                      <td v-if="hasAccess('add_mt5_group')">
                        <VIcon icon="tabler-edit" @click="showUpdateGroupModal(group)"/>
                      </td>

                    </tr>
                    </tbody>
                  </VTable>
                  <VSkeletonLoader v-else v-for="i in 3" :key="i" type="table-tbody"/>
                </p>
              </VWindowItem>
            </VWindow>
          </VCardText>
          <!-- 👉 GROUP LISTING END-->
        </VCard>
      </div>
    </VCardItem>
  </VCard>


  <GroupEditDialog v-model:isDialogVisible="isGroupUpdateModalVisible" :selected-group="selectedGroup"
                   :category-list="category_list"
  />

  <AddCategoryDialog v-model:isDialogVisible="isAddCategoryModalVisible"/>

  <AddGroupDialog v-model:isDialogVisible="isAddGroupModalVisible" :category-list="category_list"/>
  <!-- ADDGroupDialog -->
</template>

<style scoped lang="scss"></style>
