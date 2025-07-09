<script setup>
const currentTab = ref(0)
const ibPlanid = ref(0)
const ibList = ref(null)
const ibPlanList = ref(null)
const ibPlanCommisionList = ref(null)
const isAddIbPlanModalVisible = ref(false)
const isAddPlanDetailsModalVisible = ref(false)
const ibPlanname = ref(null)
const ibPlan_id = ref(null)
const selectedIbPlan = ref(null)
const isIbPlanDetailsUpdateModalVisible = ref(false)
onMounted(async () => {
  await fetchIbPlans()
})

const fetchIbPlans = async () => {
  ibPlanCommisionList.value = null
  try {
    const res = await $api(`/getIbPlans/${ibPlanid.value}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response)
      },
    })

    if (res) {
      ibList.value = res
      ibPlanList.value = ibList.value.ib_plans
      // ibPlanname.value=ibPlanList.value[0].plan_name

      ibPlanCommisionList.value = ibList.value.ib_plan_commission
      ibPlanname.value = ibPlanCommisionList.value[0].plan_name
      ibPlanid.value = ibPlanCommisionList.value[0].id
    } else {
      console.error('Failed to fetch group list or empty response')
    }
  } catch (err) {
    console.error('Error fetching group list:', err)
  }
}

function getPlanCommision(planid) {
  ibPlanid.value = planid

  fetchIbPlans()
}

function showAddIbPlanModal() {
  isAddIbPlanModalVisible.value = true
}

function showAddPlanDetailsModal() {
  isAddPlanDetailsModalVisible.value = true
}

function showIbPlanDetailsEditModal(ibDetails) {
  selectedIbPlan.value = ibDetails
  isIbPlanDetailsUpdateModalVisible.value = true
}

</script>

<template>
  <section>

    <!-- 👉 Widgets -->
    <VCard>
      <div class="d-flex align-center justify-space-between">
        <div>
          <VCardTitle>IB Plan Settings</VCardTitle>
          <VCardSubtitle class="pb-3">Manage IB Plans</VCardSubtitle>
        </div>
        <div>
          <VBtn class="me-2" v-if="hasAccess('add_new_ib_plan')" @click="showAddIbPlanModal()">Add IB Plan</VBtn>
          <VBtn class="me-2" v-if="hasAccess('add_ib_plan_level_commissions')" @click="showAddPlanDetailsModal()">Add
            Plan Details
          </VBtn>
        </div>
      </div>

      <VDivider/>

      <VCardItem>
        <div class="d-flex gap-6">
          <div>
            <VTabs v-model="currentTab" direction="vertical" class="v-tabs-pill">
              <VTab v-for="ibPlan in ibPlanList" :key="ibPlan.id" :value="ibPlan.id"
                    @click="getPlanCommision(ibPlan.id)"
              >
                <VIcon start icon="tabler-clipboard-check"/>
                {{ ibPlan.plan_name }}
                <!--  -->
              </VTab>
            </VTabs>
          </div>

          <VCard>
            <!-- 👉 GROUP LISTING START-->
            <VCardText>
              <VWindow v-model="currentTab">
                <VWindowItem v-for="ibPlan in ibPlanList" :key="ibPlan.id" :value="ibPlan.id">
                  <!--  -->
                  <p class="mb-">
                  <span class="ms-3 mb-2">
                  PLAN : {{ ibPlan.plan_name }}</span>
                    <VDivider/>
                    <VTable v-if="ibPlanCommisionList" height="800" class="text-no-wrap">
                      <thead>
                      <tr>
                        <th>
                          GROUP NAME
                        </th>
                        <th>
                          L1|D1
                        </th>
                        <th>
                          L2|D1
                        </th>
                        <th>
                          L2|D2
                        </th>
                        <th>
                          L3|D1
                        </th>
                        <th>
                          L3|D2
                        </th>
                        <th>
                          L3|D3
                        </th>
                        <th>
                          L4|D1
                        </th>
                        <th>
                          L4|D2
                        </th>
                        <th>
                          L4|D3
                        </th>
                        <th>
                          L4|D4
                        </th>
                        <th>
                          L5|D1
                        </th>
                        <th>
                          L5|D2
                        </th>
                        <th>
                          L5|D3
                        </th>
                        <th>
                          L5|D4
                        </th>
                        <th>
                          L5|D5
                        </th>
                        <th>
                          L6|D1
                        </th>
                        <th>
                          L6|D2
                        </th>
                        <th>
                          L6|D3
                        </th>
                        <th>
                          L6|D4
                        </th>
                        <th>
                          L6|D5
                        </th>
                        <th>
                          L6|D6
                        </th>
                        <th>

                        </th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="ibCommision in ibPlanCommisionList">
                        <!--   -->

                        <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
                          <VChip size="x-small">
                            {{ ibCommision.mt_group_name }}
                          </VChip>
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level1_d1 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level2_d1 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level2_d2 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level3_d1 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level3_d2 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level3_d3 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level4_d1 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level4_d2 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level4_d3 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level4_d4 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level5_d1 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level5_d2 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level5_d3 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level5_d4 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level5_d5 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level6_d1 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level6_d2 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level6_d3 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level6_d4 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level6_d5 }}
                        </td>
                        <td style="text-align:center">
                          {{ ibCommision.level6_d6 }}
                        </td>
                        <td style="text-align:center">
                          <VIcon v-if="hasAccess('add_new_ib_plan')" icon="tabler-edit"
                                 @click="showIbPlanDetailsEditModal(ibCommision)"
                          />
                          <!--                          <VIcon icon="tabler-trash"/>-->
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

    <AddIbPlanDialog v-model:isDialogVisible="isAddIbPlanModalVisible"/>

    <AddIbPlanDetailsDialog v-model:isDialogVisible="isAddPlanDetailsModalVisible" :ibPlanList="ibPlanList"/>

    <EditIbPlanDetailsDialog v-model:isDialogVisible="isIbPlanDetailsUpdateModalVisible"
                             :selectedIbPlan="selectedIbPlan" :ibPlanList="ibPlanList"
    />
  </section>
</template>

<style scoped lang="scss">

</style>
