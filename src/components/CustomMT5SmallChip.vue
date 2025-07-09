<template>
  <div class="text-h6">
    {{ is_wallet === 0 ? 'MT'+mt_id : 'Wallet' }}
  </div>
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
      mt5Icon: '/images/svg/mt5_small.svg'
    };
  }
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
