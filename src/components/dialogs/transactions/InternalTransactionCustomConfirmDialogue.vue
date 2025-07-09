<script setup>
const props = defineProps({
  confirmationQuestion: {
    type: String,
    required: true,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  isConfirmLoading: {
    type: Boolean,
  },
  hasCredit: {
    type: Boolean,
  },
  confirmTitle: {
    type: String,
    required: true,
  },
  /* confirmMsg: {
    type: String,
    required: true,
  }, */
  cancelTitle: {
    type: String,
    required: true,
  },
  /* cancelMsg: {
    type: String,
    required: true,
  }, */
})

const emit = defineEmits([
  'update:isDialogVisible',
  'confirm',
])

const unsubscribed = ref(false)
const cancelled = ref(false)

const updateModelValue = val => {
  emit('update:isDialogVisible', val)
}

const onConfirmation = () => {
  emit('confirm', true)
  updateModelValue(false)
  //unsubscribed.value = true
}

const onCancel = () => {
  emit('confirm', false)
  emit('update:isDialogVisible', false)
  //cancelled.value = true
}
</script>

<template>
  <!-- 👉 Confirm Dialog -->
  <VDialog max-width="500" :model-value="props.isDialogVisible" @update:model-value="updateModelValue">


    <VCard class="px-3 pt-2">
      <VAlert v-if="props.hasCredit" type="warning" variant="tonal" class="mt-3 mb-4">
        Please note, the selected <strong>FROM ACCOUNT</strong> currently has a <strong>CREDIT</strong> balance. Upon
        completing the internal transfer, the entire credit balance of this account will be <strong>SET TO
        ZERO</strong>.
      </VAlert>
      <VCardText class="text-center px-5">
        <VBtn icon variant="outlined" color="warning" class="mb-4"
              style=" block-size: 88px;inline-size: 88px; pointer-events: none;"
        >
          <span class="text-5xl">!</span>
        </VBtn>

        <h6 class="text-lg font-weight-medium">
          {{ props.confirmationQuestion }}
        </h6>
      </VCardText>

      <VCardText class="d-flex align-center justify-center gap-2 mb-4">
        <VBtn variant="elevated" @click="onConfirmation" :loading="isConfirmLoading">
          Confirm
        </VBtn>

        <VBtn color="secondary" variant="tonal" @click="onCancel">
          Cancel
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

</template>
