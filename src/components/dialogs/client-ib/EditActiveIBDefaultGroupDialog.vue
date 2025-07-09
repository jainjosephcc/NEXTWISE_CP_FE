<script setup>
import { onMounted, ref, watch } from 'vue';

const groups_list = ref(null);
const groupOptions = ref(null);
const selectedGroup = ref([]);
const isMandotoryFilled = ref(true);
const checkLimit = ref(null);
const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },
  groups: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(['submit', 'update:isDialogVisible']);

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val);
};

const getMTGroups = async () => {
  try {
    const res = await $api('/getAllmt5Groups', {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response);
      },
    });
    if (res) {
      groups_list.value = res.mt5Groups;
      groupOptions.value = groups_list.value.filter(user => user.ib_enabled === 1);
    } else {
      console.error('Failed to fetch group list or empty response');
    }
  } catch (err) {
    console.error('Error fetching group list:', err);
  }
};

onMounted(async () => {
  await getMTGroups();
});

watch(selectedGroup, (newVal) => {
  if (newVal.length > 3) {
    selectedGroup.value = newVal.slice(0, 3);
    checkLimit.value = true;
  } else {
    checkLimit.value = false;
  }
}, { deep: true, immediate: false });

const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isApproveBtnLoading.value = true;

    try {
      const res = await $api('/updateIbDefaultGroup', {
        method: 'POST',
        body: {
          client_id: props.clientId,
          mt_group_list: selectedGroup.value,
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong!';
          errorMessage.value = response._data.message;
          isApproveBtnLoading.value = false;
          isErrorDialogVisible.value = true;
        },
      });
      if (res) {
        successTitle.value = 'Groups Updated!';
        successMessage.value = 'MT5 Account Groups Updated Successfully!';
        isApproveBtnLoading.value = false;
        isSuccessDialogVisible.value = true;
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!';
      errorMessage.value = Ex.data.message;
      isApproveBtnLoading.value = false;
      isErrorDialogVisible.value = true;
    }
  }
};

const handlePageReload = () => {
  window.location.reload();
};
</script>


<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard title="Update IB Default Groups">
      <VCardText>
        <VAlert density="comfortable" color="secondary" variant="tonal" class="mb-5">
          Please select the default groups for mapping this IB. Clients who open MT5 accounts under this IB
          will only be able to open MT5 accounts within the selected groups.
        </VAlert>

        <VDivider />

        <!-- Display group names here -->
        <VList>
          <VListItemTitle>Default Groups</VListItemTitle>
          <VListItem>
            <div class="d-flex flex-row flex-wrap align-center">
              <div v-for="group in groups" :key="group.id" class="d-flex flex-column align-center mx-2">
                <VAvatar rounded size="45" variant="tonal" class="mb-2 ps-1 pe-1">
                  <VImg src="/images/svg/mt5_lined.svg" size="22" />
                </VAvatar>
                <h6 class="text-base font-weight-medium mb-2">
                  {{ group.mt_group_name }}
                </h6>
              </div>
            </div>
          </VListItem>
        </VList>

        <VRow class="mt-3">
          <VCol cols="6">
            <VSpacer />
            <AppSelect v-model="selectedGroup" :items="groupOptions" item-title="mt_group_name" item-value="id" multiple
              persistent-hint label="Select Group" />
          </VCol>
        </VRow>

        <p v-if="!isMandotoryFilled" class="text-body-2 pt-0 pb-0 mb-3 text-error">All fields are mandatory</p>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="dialogModelValueUpdate(false)">
          Close
        </VBtn>
        <VBtn class="align-self-end" :block="$vuetify.display.md" :loading="isApproveBtnLoading"
          :disabled="isApproveBtnLoading || selectedGroup.length === 0" color="primary"
          @click="isConfirmDialogVisible = true">
          Update
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
    confirmation-question="Do you want to update default groups?" cancel-title="Cancelled" confirm-title="Cancelled!" />

  <VDialog v-model="isSuccessDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="success" class="my-4"
          style="block-size: 88px; inline-size: 88px; pointer-events: none;">
          <VIcon icon="tabler-check" size="38" />
        </VBtn>
        <h1 class="text-h4 mb-4">
          {{ successTitle }}
        </h1>
        <p>{{ successMessage }}</p>
        <VBtn color="success" @click="handlePageReload">
          OK
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog v-model="isErrorDialogVisible" max-width="500">
    <VCard>
      <VCardText class="text-center px-10 py-6">
        <VBtn icon variant="outlined" color="error" class="my-4"
          style="block-size: 88px; inline-size: 88px; pointer-events: none;">
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
