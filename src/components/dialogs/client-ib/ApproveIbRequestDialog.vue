<script setup>
const groups_list = ref(null)
const groupOptions = ref(null)
const selectedGroup = ref([])
const selectedPlan = ref(null)
const checkLimit = ref(null)
const planOptions = ref(null)
const ibdetails_id = ref(null)
const isMandotoryFilled = ref(null)
const isApproveBtnLoading = ref(false)
const isRejectBtnLoading = ref(false)
const isConfirmDialogVisible = ref(false)
const isRejectDialogVisible = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')

const props = defineProps({
  ibdetails: {
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
  await getMTGroups()
  await getPlanDetails()
})
const getMTGroups = async () => {
  try {
    const res = await $api('/getAllmt5Groups', {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response)
      },
    })
    if (res) {

      groups_list.value = res.mt5Groups
      groupOptions.value = groups_list.value.filter(user => user.ib_enabled === 1)

      //   groupOptions.value=res.ib_enabled_mt_groups;
    } else {
      console.error('Failed to fetch group list or empty response')
    }
  } catch (err) {
    console.error('Error fetching group list:', err)
  }
}
watch([selectedGroup], (newVal) => {
  if (selectedGroup.value.length > 3) {
    checkLimit.value = true
  }
}, { deep: true, immediate: false })

watch(() => props.ibdetails, (newPlan) => {
  if (newPlan) {
    ibdetails_id.value = newPlan.id


  }
}, { immediate: true })


// Watch selectedGroup and enforce selection limit
watch(selectedGroup, (newVal) => {
  if (newVal.length > 3) {
    selectedGroup.value = newVal.slice(0, 3)
    checkLimit.value = true
  } else {
    checkLimit.value = false
  }
}, { deep: true, immediate: false })

// Watch ibdetails prop for changes
watch(() => props.ibdetails, (newPlan) => {
  if (newPlan) {
    ibdetails_id.value = newPlan.id
    console.log(ibdetails_id.value, 'value')

  }
}, { immediate: true })


const getPlanDetails = async () => {
  const res = await $api(`/IbRequestDefaultGroupListing/${ibdetails_id.value}`, {
    method: 'GET',
    onResponseError({ response }) {
    },
  })
  planOptions.value = res.ib_plans
}
function handleApprove() {
  if (selectedPlan.value === null || selectedGroup.value.length === 0) {
    isMandotoryFilled.value = false
  } else {
    isMandotoryFilled.value = true
    isConfirmDialogVisible.value = true
    // Do not set loading state here
  }
}

function handleRejectRequest() {
  isRejectDialogVisible.value = true
  // Do not set loading state here
}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isApproveBtnLoading.value = true
    try {
      const formData = new FormData()
      formData.append('client_id', ibdetails_id.value)
      formData.append('plan_id', selectedPlan.value)
      formData.append('action', 1)
      selectedGroup.value.forEach((category) => {
        formData.append('mt_group_list[]', category)
      })
      const res = await $api('/ApproveIbRequest', {
        method: 'POST',
        body: formData,

        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isErrorDialogVisible.value = true
          isApproveBtnLoading.value = false
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'IB Request Approved Successfully !'
        isSuccessDialogVisible.value = true
        isApproveBtnLoading.value = false
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.data.message
      isErrorDialogVisible.value = true
      isApproveBtnLoading.value = false
    }
  } else {
    isApproveBtnLoading.value = false
  }
}

const handleReject = async (confirmed) => {
  if (confirmed) {
    isRejectBtnLoading.value = true
    try {
      const formData = new FormData()
      formData.append('client_id', ibdetails_id.value)
      formData.append('plan_id', selectedPlan.value)
      formData.append('action', 2)
      const res = await $api('/ApproveIbRequest', {
        method: 'POST',
        body: formData,

        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isErrorDialogVisible.value = true
          isRejectBtnLoading.value = false
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'IB Request Rejected Successfully !'
        isSuccessDialogVisible.value = true
        isRejectBtnLoading.value = false
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.data.message
      isErrorDialogVisible.value = true
      isRejectBtnLoading.value = false
    }
  } else {
    isRejectBtnLoading.value = false
  }
}



const handlePageReload = async (confirmed) => {
  window.location.reload()
}

</script>
<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard>
      <VCardTitle>Approve/Reject IB Request</VCardTitle>
      <VDivider />

      <VTable class="text-no-wrap">
        <thead>
          <tr>
            <th>NAME</th>
            <th>EMAIL ID</th>
            <th>PHONE NO</th>
            <th>MANAGER</th>
          </tr>
        </thead>
        <tbody>
          <!-- Render transaction details -->
          <tr>
            <td>
              {{ ibdetails.client_name }}
            </td>
            <td>{{ ibdetails.email }}</td>
            <td>{{ ibdetails.contact_no }}</td>
            <td>{{ ibdetails.rm_name }}</td>
          </tr>
        </tbody>
      </VTable>

      <VDivider />
      <VForm @submit.prevent="() => { }">
        <VCardText>
          <VRow>
            <VCol cols="6">
              <AppSelect v-model="selectedGroup" :items="groupOptions" item-title="mt_group_name" item-value="id"
                multiple persistent-hint label="Select Group" />
            </VCol>
            <VCol cols="6">
              <AppSelect v-model="selectedPlan" :items="planOptions" item-title="plan_name" item-value="id"
                label="Select Plan" single-line :rules="[requiredValidator]" />
              <!-- Show error if the approved amount is greater than the requested amount -->
              <VAlert v-if="isMandotoryFilled === false" type="error" class="mt-2">
                All fields are mandatory
              </VAlert>
            </VCol>

          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">
          <!-- Approve Button -->
          <VBtn color="primary" class="me-2" :loading="isApproveBtnLoading" :disabled="isApproveBtnLoading"
            @click="handleApprove">


            Approve
            <VIcon end icon="tabler-discount-check-filled" />
          </VBtn>
          <VBtn color="error" :loading="isRejectBtnLoading" :disabled="isApproveBtnLoading" class="me-2"
            @click="handleRejectRequest">
            Reject
            <VIcon end icon="tabler-circle-x" />
          </VBtn>




        </VCardText>
      </VForm>



    </VCard>
  </VDialog>
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
    confirmation-question="Do you want to approve the IB request?" cancel-title="Cancelled"
    confirm-title="Cancelled!" />

  <ConfirmDialog v-model:isDialogVisible="isRejectDialogVisible" @confirm="handleReject"
    confirmation-question="Do you want to reject the IB request?" confirm-title="Confirm" cancel-title="Cancel" />



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
        <VBtn color="success" @click="isErrorDialogVisible = false">
          OK
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
