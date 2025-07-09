<script setup>
const selectedGroup = ref(null)
const groupOptions = ref(null)
const headerL1D1 = ref(null)
const headerL2D1 = ref(null)
const headerL2D2 = ref(null)
const headerL3D1 = ref(null)
const headerL3D2 = ref(null)
const headerL3D3 = ref(null)
const headerL4D1 = ref(null)
const headerL4D2 = ref(null)
const headerL4D3 = ref(null)
const headerL4D4 = ref(null)
const headerL5D1 = ref(null)
const headerL5D2 = ref(null)
const headerL5D3 = ref(null)
const headerL5D4 = ref(null)
const headerL5D5 = ref(null)
const headerL6D1 = ref(null)
const headerL6D2 = ref(null)
const headerL6D3 = ref(null)
const headerL6D4 = ref(null)
const headerL6D5 = ref(null)
const headerL6D6 = ref(null)
const selectedPlan = ref(null)
const isConfirmDialogVisible = ref(false)
const isMandotoryFilled = ref(null)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const id = ref(null)

const props = defineProps({
  ibPlanList: {
    type: Array,
    required: false,
  },
  selectedIbPlan: {
    type: Object,
    required: false,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}

onMounted(async () => {
  await getEnabledMTGroups()
})

const getEnabledMTGroups = async () => {
  try {
    const res = await $api('/getIbEnabledMtGroups', {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response)
      },
    })

    if (res) {
      groupOptions.value = res.ib_enabled_mt_groups
    } else {
      console.error('Failed to fetch group list or empty response')
    }
  } catch (err) {
    console.error('Error fetching group list:', err)
  }
}

watch(() => props.selectedIbPlan, (newPlan) => {
  if (newPlan) {
    id.value = newPlan.id
    selectedGroup.value = newPlan.mt_group_id
    selectedPlan.value = newPlan.plan_id
    headerL1D1.value = newPlan.level1_d1 || ''
    headerL2D1.value = newPlan.level2_d1 || 0
    headerL2D2.value = newPlan.level2_d2 || 0
    headerL3D1.value = newPlan.level3_d1 || 0
    headerL3D2.value = newPlan.level3_d2 || 0
    headerL3D3.value = newPlan.level3_d3 || 0
    headerL4D1.value = newPlan.level4_d1 || 0
    headerL4D2.value = newPlan.level4_d2 || 0
    headerL4D3.value = newPlan.level4_d3 || 0
    headerL4D4.value = newPlan.level4_d4 || 0
    headerL5D1.value = newPlan.level5_d1 || 0
    headerL5D2.value = newPlan.level5_d2 || 0
    headerL5D3.value = newPlan.level5_d3 || 0
    headerL5D4.value = newPlan.level5_d4 || 0
    headerL5D5.value = newPlan.level5_d5 || 0
    headerL6D1.value = newPlan.level6_d1 || 0
    headerL6D2.value = newPlan.level6_d2 || 0
    headerL6D3.value = newPlan.level6_d3 || 0
    headerL6D4.value = newPlan.level6_d4 || 0
    headerL6D5.value = newPlan.level6_d5 || 0
    headerL6D6.value = newPlan.level6_d6 || 0

  }
}, { immediate: true })

function handleEditDetailsSubmit() {
  if (headerL1D1.value === null || headerL2D1.value === null || headerL2D2.value === null || headerL3D1.value === null || headerL3D2.value === null || headerL3D3.value === null || headerL4D1.value === null || headerL4D2.value === null || headerL4D3.value === null || headerL4D4.value === null || headerL5D1.value === null || headerL5D2.value === null || headerL5D3.value === null || headerL5D4.value === null || headerL5D5.value === null || headerL6D1.value === null || headerL6D2.value === null || headerL6D3.value === null || headerL6D4.value === null || headerL6D5.value === null || headerL6D6.value === null || selectedGroup.value === null || selectedPlan.value === null) {
    isMandotoryFilled.value = false
  } else {
    isMandotoryFilled.value = true
    isConfirmDialogVisible.value = true
  }
}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    // isApproveBtnLoading.value = true;

    try {
      const res = await $api(`/edit-ib-commission-plan/${id.value}`, {
        method: 'POST',
        body: {
          mt_group_id: selectedGroup.value,
          plan_id: selectedPlan.value,
          level1_d1: headerL1D1.value,
          level2_d1: headerL2D1.value,
          level2_d2: headerL2D2.value,
          level3_d1: headerL3D1.value,
          level3_d2: headerL3D2.value,
          level3_d3: headerL3D3.value,
          level4_d1: headerL4D1.value,
          level4_d2: headerL4D2.value,
          level4_d3: headerL4D3.value,
          level4_d4: headerL4D4.value,
          level5_d1: headerL5D1.value,
          level5_d2: headerL5D2.value,
          level5_d3: headerL5D3.value,
          level5_d4: headerL5D4.value,
          level5_d5: headerL5D5.value,
          level6_d1: headerL6D1.value,
          level6_d2: headerL6D2.value,
          level6_d3: headerL6D3.value,
          level6_d4: headerL6D4.value,
          level6_d5: headerL6D5.value,
          level6_d6: headerL6D6.value,


        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !';
          errorMessage.value = response._data.message;
          isErrorDialogVisible.value = true;
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Plan Updated Successfully !';
        isSuccessDialogVisible.value = true;
      }
    }
    catch (Ex) {
      errorTitle.value = 'Something Went Wrong !';
      errorMessage.value = Ex.data.message;
      isErrorDialogVisible.value = true;
    }
  }
}

</script>
<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
    <VCard class="pa-6 pa-sm-10">
      <div
        class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
        <!-- 👉 Left Content -->
        <div>
          <div class="d-flex align-center app-logo ">
            <h6 class="app-logo-title">
              Edit IB Plan Details{{ selectedIbPlan }}
            </h6>
          </div>
        </div>
      </div>
      <VForm @submit.prevent="() => { }">
        <VRow>
          <VCol cols="6">

            <AppSelect v-model="selectedGroup" :items="groupOptions" item-title="mt_group_name" item-value="id"
              label="Select Group" single-line :rules="[requiredValidator]" />
          </VCol>
          <VCol cols="6">
            <AppSelect v-model="selectedPlan" :items="props.ibPlanList" item-title="plan_name" item-value="id"
              label="Select Plan" single-line :rules="[requiredValidator]" />
          </VCol>
        </VRow>
        <VRow class="ms-3 mb-3">
          <table>
            <thead>
              <tr class="me-3">
                <th><br>L1|D1
                  <VTextField v-model="headerL1D1" />
                </th>
              </tr>
              <tr class="me-3">
                <th><br>L2|D1
                  <VTextField v-model="headerL2D1" />
                </th>
                <th><br>L2|D2
                  <VTextField v-model="headerL2D2" />
                </th>
              </tr>
              <tr>
                <th><br>L3|D1
                  <VTextField v-model="headerL3D1" />
                </th>
                <th><br>L3|D2
                  <VTextField v-model="headerL3D2" />
                </th>
                <th><br>L3|D3
                  <VTextField v-model="headerL3D3" />
                </th>
              </tr>
              <tr>
                <th><br>L4|D1
                  <VTextField v-model="headerL4D1" />
                </th>
                <th><br>L4|D2
                  <VTextField v-model="headerL4D2" />
                </th>
                <th><br>L4|D3
                  <VTextField v-model="headerL4D3" />
                </th>
                <th><br>L4|D4
                  <VTextField v-model="headerL4D4" />
                </th>
              </tr>
              <tr>
                <th><br>L5|D1
                  <VTextField v-model="headerL5D1" />
                </th>
                <th><br>L5|D2
                  <VTextField v-model="headerL5D2" />
                </th>
                <th><br>L5|D3
                  <VTextField v-model="headerL5D3" />
                </th>
                <th><br>L5|D4
                  <VTextField v-model="headerL5D4" />
                </th>
                <th><br>L5|D5
                  <VTextField v-model="headerL5D5" />
                </th>
              </tr>
              <tr>
                <th style="width: 70px;"><br>L6|D1
                  <VTextField v-model="headerL6D1" />
                </th>
                <th style="width: 70px;"><br>L6|D2
                  <VTextField v-model="headerL6D2" />
                </th>
                <th style="width: 70px;"><br>L6|D3
                  <VTextField v-model="headerL6D3" />
                </th>
                <th style="width: 70px;"><br>L6|D4
                  <VTextField v-model="headerL6D4" />
                </th>
                <th style="width: 70px;"><br>L6|D5
                  <VTextField v-model="headerL6D5" />
                </th>
                <th style="width: 70px;"><br>L6|D6
                  <VTextField v-model="headerL6D6" />
                </th>
              </tr>
            </thead>
          </table>
          <!-- </VTable> -->
        </VRow>
        <p v-if="isMandotoryFilled === false" class="text-body-2 pt-3 pb-0 mb-3 text-error">All fields are mandatory</p>
        <VRow>
          <VCol cols="6">
            <VBtn class="ms-3" color="primary" @click="handleEditDetailsSubmit">
              Submit
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </VDialog>
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
    confirmation-question="Are you want to update IB Plan Details?" cancel-title="Cancelled"
    confirm-title="Cancelled!" />
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
          style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
          <span class="text-5xl font-weight-light">X</span>
        </VBtn>
        <h1 class="text-h4 mb-4">
          {{ errorTitle }}
        </h1>
        <p>{{ errorMessage }}</p>
        <VBtn color="success" @click="handlePageReload">
          Ok
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
