<script setup>
const currentTab = ref('Appetizers')

const props = defineProps({
  clientId: {
    type: Number,
    required: true,
  },
})

// Initialize items array
const items = ref([]);

// Function to build the items array based on permissions
const buildItems = () => {
  const tempItems = [];
  if (hasAccess('view_deposit_list')) {
    tempItems.push('Deposits');
  }
  if (hasAccess('view_withdraw_list')) {
    tempItems.push('Withdrawals');
  }
  if (hasAccess('view_internal_transfer_list')) {
    tempItems.push('Internal Transactions');
  }
  if (hasAccess('view_transaction_adjustments')) {
    tempItems.push('Transaction Adjustments');
  }
  items.value = tempItems;
}

// Call buildItems on mounted to initialize the items array
onMounted(() => {
  buildItems();
});

</script>

<template>
  <VCard class="py-5">
    <VTabs
      v-model="currentTab"
      fixed-tabs
    >
      <VTab
        v-for="item in items"
        :key="item"
        :value="item"
      >
        {{ item }}
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem v-if="hasAccess('view_deposit_list')" key="Deposits" value="Deposits">
          <deposit-list :client-id="clientId"/>
        </VWindowItem>
        <VWindowItem v-if="hasAccess('view_withdraw_list')" key="Withdrawals" value="Withdrawals">
          <withdraw-list :client-id="clientId"/>
        </VWindowItem>
        <VWindowItem v-if="hasAccess('view_internal_transfer_list')" key="Internal Transactions" value="Internal Transactions">
          <internal-transactions :client-id="clientId"/>
        </VWindowItem>
        <VWindowItem v-if="hasAccess('view_transaction_adjustments')" key="Transaction Adjustments" value="Transaction Adjustments">
          <transaction-adjustments :client-id="clientId"/>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
