<script setup>

const props = defineProps({
  clientId: {
    type: Number,
    required: true,
  },
})
const currentTab = ref('Bank Details')
const items = [
  'Bank Details',
  'Update Status'
]


</script>

<template>
<VCard class="py-5">
<VTabs class="mb-0 pb-0 mt-0 pt-0"
      v-model="currentTab"
      grow
    >
      <VTab
        v-for="item in items"
        :key="item"
      >
        {{ item }}
      </VTab>
  </VTabs>
  <VWindow v-model="currentTab">
    <VWindowItem>
      <VRow>
        <VCol cols="12">
          <VCard>
            <profile-settings :client-id="clientId"/>
          </VCard>
        </VCol>
      </VRow>
    </VWindowItem>
    <VWindowItem>
      <VRow>
        <VCol cols="12">
          <VCard>
            <client-status-change :clientId="clientId"/>
          </VCard>
        </VCol>
      </VRow>
    </VWindowItem>
    <!-- <VWindowItem>
      <VRow>
        <VCol cols="12">
          <VCard>
            <client-update-label :clientId="clientId"/>
          </VCard>
        </VCol>
      </VRow>
    </VWindowItem> -->
  </VWindow>
  
</VCard>


</template>

<style scoped lang="scss">

</style>
