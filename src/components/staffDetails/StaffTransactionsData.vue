<script setup>
const currentTab = ref('Appetizers')

const props = defineProps({
  staffId: {
    type: Number,
    required: true,
  },
})

const items = [
  'Deposits',
  'Withdrawals',
  'Internal Transactions',
  'Transaction Adjustments',
]

const tabItemText = 'hortbread chocolate bar marshmallow bear claw tiramisu chocolate cookie wafer. Gummies sweet brownie brownie marshmallow chocolate cake pastry. Topping macaroon shortbread liquorice dragée macaroon.'
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
        <VWindowItem key="Deposits" value="Deposits">
          <staff-deposit-list :staff-id="props.staffId"/>
        </VWindowItem>
        <VWindowItem key="Withdrawals" value="Withdrawals">
          <staff-withdraw-list :staff-id="props.staffId"/>
        </VWindowItem>
        <VWindowItem key="Internal Transactions" value="Internal Transactions">
          <staff-internal-transactions :staff-id="props.staffId"/>
        </VWindowItem>
        <VWindowItem key="Transaction Adjustments" value="Transaction Adjustments">
          <staff-transaction-adjustments :staff-id="props.staffId"/>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
