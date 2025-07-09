<script setup>
const props = defineProps({
  selectedTransaction: {
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


watch(props, () => {
})

const handlePageReload = async (confirmed) => {
  window.location.reload();
}

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}




// To access the properties individually and maintain reactivity, use `toRefs`
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 800" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
    <VCard class="pa-6 pa-sm-10">
      <!-- SECTION Header -->
      <div
        class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
        <!-- 👉 Left Content -->
        <div>
          <div class="d-flex align-center app-logo mb-6">
            <!-- 👉 Logo -->
            <!-- <VNodeRenderer  /> -->

            <!-- 👉 Title -->
            <h6 class="app-logo-title">
              Deposit Ticket Details
            </h6>
          </div>


        </div>

        <!-- 👉 Right Content -->

      </div>
      <!-- !SECTION -->
    </VCard>
  </VDialog>
</template>
