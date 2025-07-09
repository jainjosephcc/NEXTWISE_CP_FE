<script setup>
import { computed } from "vue"

const props = defineProps({
  activityList: {
    type: Object,
    required: false,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})
const isConfirmDialogVisible = ref(false);
const isApproveLoading = ref(false);
const isApproveDisabled = ref(false);
const isSuccessDialogVisible = ref(false);
let successTitle = ref('')
let successMessage = ref('')
const isErrorDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')

const formatTime = (timestamp) => {
  const timeDifference = Date.now() - new Date(timestamp).getTime();

  const minutes = Math.floor(timeDifference / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
};
const getDepositMessage = (item) => {
  switch (item.status) {
  case 0:
    return `$${item.amount_in_usd} deposit ticket is PENDING.`;
  case 2:
    return `$${item.amount_in_usd} deposit ticket has been REJECTED.`;
  case 3:
    return `$${item.amount_in_usd} deposit ticket has been APPROVED.`;
  default:
    return `$${item.amount_in_usd} deposit ticket status is unknown.`;
  }
};

const getWithdrawalMessage = (item) => {
  const amount = item.amount_in_usd;
  switch (item.status) {
  case 0:
    return `$${amount} withdrawal ticket is PENDING.`;
  case 1:
    return `$${amount} withdrawal ticket is on HOLD.`;
  case 2:
    return `$${amount} withdrawal ticket has been REJECTED.`;
  case 3:
    return `$${amount} withdrawal ticket has been APPROVED.`;
  default:
    return `$${amount} withdrawal ticket status is unknown.`;
  }
};
const getDotColor = (activityType) => {
  switch (activityType) {
  case 'deposit':
    return 'primary';
  case 'withdrawal':
    return 'warning';
  case 'client_joined':
    return 'error';
  default:
    return 'grey';
  }
};

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

watch(props, () => {
})

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}


</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 700" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
    <VCard class="pb-6">
      <VCardTitle class="pt-3">Recent Activity Timeline</VCardTitle>
      <VDivider/>
      <VCardText>
      <VTimeline v-if="activityList"
                 align="start"
                 density="compact"
                 line-inset="8"
                 side="end"
                 truncate-line="start"
      >

        <!-- SECTION Timeline Item: Flight -->
        <VTimelineItem v-for="item in activityList"
                       :dot-color="getDotColor(item.activity_type)"
                       size="x-small"
        >
          <!-- 👉 Header -->
          <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-2">
                <span v-if="item.activity_type==='deposit'" class="app-timeline-title">
                  {{getDepositMessage(item)}}
                </span>
            <span v-if="item.activity_type === 'withdrawal'" class="app-timeline-title">
                  {{ getWithdrawalMessage(item) }}
                </span>
            <span v-if="item.activity_type==='client_joined'" class="app-timeline-title">
                    A NEW CLIENT has joined.
                </span>
            <span class="app-timeline-meta">{{formatTime(item.updated_at)}}</span>
          </div>
          <div class="d-inline-flex align-center mt-1">
            <CustomClientCardChip :client_id="item.client_id" :client_name="item.client_name" :client_pic="item.client_pic" :email="item.email"/>
          </div>
        </VTimelineItem>
      </VTimeline>
      <VSkeletonLoader v-else type="list-item-avatar"/>
      </VCardText>
    </VCard>
  </VDialog>
</template>
