<template>
  <VChip size="medium" class="pr-3 pl-3 pt-1 pb-1">
    <div class="pr-1">
      <VImg v-if="is_wallet === 0" :src="mt5Icon" style="padding: 5px; width: 25px;" />
      <i v-else class="tabler-wallet v-icon notranslate v-theme--light"></i>
    </div>
    {{ is_wallet === 0 ? mt_id : 'Wallet' }}
  </VChip>
</template>

<script>
export default {
  name: 'CustomMT5Chip',
  props: {
    mt_id: {
      type: [String, Number],
      required: true
    },
    is_wallet: {
      type: Number,
      required: true
    },
    client_id: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      mt5Icon: '/images/svg/mt5_lined.svg'
    };
  }
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
