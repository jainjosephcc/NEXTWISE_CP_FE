<script setup>

const statusOptions = ref([])
const status = ref(null)
const selectedStatus = ref(null)
const comment = ref(null)
const isConfirmDialogVisible = ref(false)
const isUpdateBtnLoading = ref(false)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const isMandotoryFilled = ref(null)
const clientComment = ref([])
const isLoading = ref(true)

const props = defineProps({
  clientId: {
    type: Number,
    required: true,
  },
})

onMounted(async () => {
  fetchStatus()
  fetchClientComment()
})

const fetchStatus = async () => {
  try {
    const res = await $api('/getClientStatusData', {
      method: 'GET',
    })
    if (res) {
      status.value = res
      statusOptions.value = status.value.client_status

    }

  } catch (err) {
    console.error('Error fetching group category:', err)
    error.value = err
  }
}

const fetchClientComment = async () => {
  const res = await $api(`/getClientComments/${props.clientId}`, {
    method: 'GET',
    onResponseError({ response }) {
      //console.log(response);
      // errors.value = response._data.message
    },
  })
  if (res) {
    clientComment.value = res.comments
    isLoading.value = false
  }
}

function updateStatus() {
  if (selectedStatus.value === null || comment.value === null) {
    isMandotoryFilled.value = false
  } else {
    isConfirmDialogVisible.value = true

    isMandotoryFilled.value = true
  }

}

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isUpdateBtnLoading.value = true
    try {
      const res = await $api('/addClientComment', {
        method: 'POST',
        body: {
          client_id: props.clientId,
          comment: comment.value,
          status: selectedStatus.value,
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          isErrorDialogVisible.value = true
          isUpdateBtnLoading.value = false
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Client Status Updated Successfully !'
        isSuccessDialogVisible.value = true
        isUpdateBtnLoading.value = false
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.data.message
      isErrorDialogVisible.value = true
      isUpdateBtnLoading.value = false
    }
  }
}
const handlePageReload = async (confirmed) => {
  window.location.reload()
}

</script>
<template>
  <VRow>
    <VCol cols="6">
      <VCardText v-if="hasAccess('view_client_status_history')">
        <VSkeletonLoader v-if="isLoading" v-for="i in 3" :key="i" type="article"/>
        <div v-if="clientComment.length>0">
          <VTimeline v-if="clientComment"
                     align="start"
                     density="compact"
                     line-inset="8"
                     side="end"
                     truncate-line="start"

          >


            <!-- SECTION Timeline Item: Flight -->
            <VTimelineItem v-for="comment in clientComment" size="x-small">
              <!-- v-for="item in timeLineDataset1"
                            :dot-color="getDotColor(item.activity_type)" -->
              <!-- 👉 Header -->
              <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-2">
                <div>
                  <span class="app-timeline-title"> {{ comment.status_name }}</span>
                  <div>{{ comment.message }}</div>
                </div>
                <span class="app-timeline-meta">{{ formatDateToMonthShort(comment.created_at) }}</span>
              </div>

              <div class="d-inline-flex align-center mt-1">
                <CustomStaffCardChip :rm_id="comment.staff_id" :rm_name="comment.staff_name"/>
              </div>
            </VTimelineItem>
          </VTimeline>
        </div>
        <div v-else>

          <VAlert type="warning" v-if="!isLoading">
            No Data Found ....
          </VAlert>
        </div>
        <!-- <VSkeletonLoader v-else type="list-item-avatar"/> -->
      </VCardText>
      <VCardText v-else>
        <VAlert type="warning">
          You dont have enough permissions to view this data.
        </VAlert>
      </VCardText>
    </VCol>
    <VCol cols="6">
      <VCardTitle>
        Update Status
        <VDivider/>
      </VCardTitle>
      <VForm @submit.prevent="() => {}">
        <VRow>
          <VCol cols="12">
            <AppSelect class="mx-3" v-model="selectedStatus" :items="statusOptions" item-title="status_name"
                       item-value="id" label="Select Plan" single-line :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12">
            <AppTextarea class="mx-3" v-model="comment" label="Comment" auto-grow/>
          </VCol>
          <p v-if="isMandotoryFilled===false" class="text-body-2 pt-3 pb-0 mb-3 text-error ms-3">All fields are
            mandatory</p>
        </VRow>
        <VCol cols="6">
          <VBtn v-if="hasAccess('update_client_status')" class=" mb-5" color="primary" @click="updateStatus"
                :loading="isUpdateBtnLoading"
          >
            Submit
          </VBtn>
          <p v-else>You dont have permission to update client status</p>
        </VCol>
      </VForm>
    </VCol>
  </VRow>
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Are you want to update client status?" cancel-title="Cancelled"
                 confirm-title="Cancelled!"
  />

  <VDialog v-model="isSuccessDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="success" class="my-4"
              style=" block-size: 88px;inline-size: 88px; pointer-events: none;"
        >
          <VIcon icon="tabler-check" size="38"/>
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
              style=" block-size: 88px;inline-size: 88px; pointer-events: none;"
        >
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
