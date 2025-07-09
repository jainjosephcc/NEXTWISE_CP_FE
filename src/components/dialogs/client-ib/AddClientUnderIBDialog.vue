<script setup>
import { defineEmits, defineProps, ref, watch } from 'vue'

const isUpdateDisabled = ref(true)
const searchQuery = ref('')
const isApproveBtnLoading = ref(false)
const isConfirmDialogVisible = ref(false)
const isMandotoryFilled = ref(null)
const isErrorDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const successTitle = ref('')
const successMessage = ref('')

const loading = ref(false)
const search = ref()
const select = ref(null)
const selectedClient = ref(null)
const items = ref([])
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
])
const dialogModelValueUpdate = (val) => {
  emit('update:isDialogVisible', val)
}

// Fetch API data search query
const getStaffName = async (query) => {
  loading.value = true
  try {
    const res = await $api('/getAttachIbData', {
      method: 'POST',
      body: JSON.stringify({ keyword: query }),
    })
    if (res && res.ib_user) {
      items.value = res.ib_user
    } else {
      items.value = []
    }
  } catch (err) {
    console.error('Error fetching staff data:', err)
  } finally {
    loading.value = false
  }
}

watch(search, (query) => {
  if (query && query !== select.value) {
    getStaffName(query)
  }
})

watch(select, (selected) => {
  if (selected) {
    const client = items.value.find(item => item.client_id === selected)
    if (client) {
      selectedClient.value = client
      isUpdateDisabled.value = false
    } else {
      isUpdateDisabled.value = true
    }
  }
})

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isApproveBtnLoading.value = true
    try {
      const formData = new FormData()
      formData.append('client_id', props.clientId)
      if (selectedClient.value) {
        formData.append('parent_id', selectedClient.value.client_id) // Use the selected user's client_id
      }

      const res = await $api('/moveClientUnderIb', {
        method: 'POST',
        body: formData,

        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong!'
          errorMessage.value = response?._data?.message || 'An unknown error occurred'
          isApproveBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })

      if (res) {
        successTitle.value = 'Success!'
        successMessage.value = 'Client Successfully Attached Under IB!'
        isApproveBtnLoading.value = false
        isSuccessDialogVisible.value = true
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!'
      errorMessage.value = Ex?.data?.message || 'An unknown error occurred'
      isApproveBtnLoading.value = false
      isErrorDialogVisible.value = true
    }
  }
}

const handlePageReload = () => {
  window.location.reload()
}

</script>


<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close button -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)"/>


    <VCard title="Move Client Under IB">
      <VCardText>
        <VRow>
          <VCol>
            <VForm @submit.prevent="() => { }">
              <VRow>
                <VCol cols="12">
                  <VAlert
                    density="comfortable"
                    color="secondary"
                    variant="tonal"
                  >
                    Please select the Introducing Broker (IB) to whom you would like to map this client. Upon selection,
                    you will be able to view the default groups assigned to the IB. Please note that the mapped client
                    will only be able to open MT5 accounts within these specified groups.
                  </VAlert>
                </VCol>
                <VCol cols="12">
                  <AppAutocomplete
                    v-model="select"
                    v-model:search="search"
                    :loading="loading"
                    :items="items"
                    item-title="client_name"
                    item-value="client_id"
                    placeholder="Search for a client"
                    label="Client Name"
                    chips
                    closable-chips
                    :menu-props="{ maxHeight: '200px' }"
                  />
                </VCol>
              </VRow>
            </VForm>
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="dialogModelValueUpdate(false)">
          Close
        </VBtn>
        <VBtn :loading="isApproveBtnLoading" :disabled="isUpdateDisabled"
              @click="isConfirmDialogVisible=true" class="align-self-end" :block="$vuetify.display.md"
        >
          Submit
        </VBtn>
      </VCardText>

    </VCard>
  </VDialog>
  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                 confirmation-question="Are you sure you want to add this client under IB" cancel-title="Cancelled"
                 confirm-title="Confirmed!"
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
