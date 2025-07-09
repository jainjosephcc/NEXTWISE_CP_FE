<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import pdf from '@images/icons/project-icons/pdf.png'
import { onMounted } from "vue"
import { fetchPermissions } from "@/utils/permission.js"
import ActivityTimelineDialog from "@/components/dialogs/dashboard/ActivityTimelineDialog.vue"
import UpdateMT5PasswordDialog from "@/components/dialogs/client/client-mt5/UpdateMT5PasswordDialog.vue"

const moreList = [
  {
    title: 'View More',
    value: 'View More',
  },
  {
    title: 'Delete',
    value: 'Delete',
  },
]
const timeLineData = ref(null);
const TTL = 60 * 60 * 1000;
const isViewMoreTimelineDataVisible = ref(false)

const fetchMonthlySummary = () => {
  fetchDataWithLocalStorage('timelineData', 'admin/dashboard/timeline-data', timeLineData);
}

// Computed properties to split the timeline data
const timeLineDataset1 = computed(() => {
  return timeLineData.value ? timeLineData.value.slice(0, 4) : [];
});

const timeLineDataset2 = computed(() => {
  return timeLineData.value ? timeLineData.value.slice(4, 10) : [];
});


const fetchDataWithLocalStorage = async (key, apiEndpoint, dataRef) => {
  const localStorageData = getWithExpiry(key);
  if (localStorageData) {
    dataRef.value = localStorageData;
    //return localStorageData;
  }
  const res = await $api(apiEndpoint, {
    method: 'GET',
    onResponseError({ response }) {
      console.error(response);
    },
  });

  if (res) {
    dataRef.value = res;
    setWithExpiry(key, res, TTL);
    return res;
  }
};

onMounted(async () => {
  await fetchMonthlySummary();
});

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

</script>

<template>
  <VCard>
    <VCardItem>
      <template #prepend>
        <VIcon
          class="me-1"
          color="high-emphasis"
          icon="tabler-list-details"
          size="20"
        />
      </template>
      <template #append>
        <div class="mt-n4 me-n2">
          <MoreBtn
            :menu-list="moreList"
            size="small"
          />
        </div>
      </template>

      <VCardTitle>Activity Timeline</VCardTitle>
    </VCardItem>

    <VCardText>
      <VTimeline v-if="timeLineDataset1"
                 align="start"
                 density="compact"
                 line-inset="8"
                 side="end"
                 truncate-line="start"
      >

        <!-- SECTION Timeline Item: Flight -->
        <VTimelineItem v-for="item in timeLineDataset1"
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
    <VCardActions>
      <VBtn @click="isViewMoreTimelineDataVisible = !isViewMoreTimelineDataVisible">View More</VBtn>
    </VCardActions>
  </VCard>

  <ActivityTimelineDialog v-if="timeLineData" v-model:isDialogVisible="isViewMoreTimelineDataVisible" :activity-list="timeLineData"/>

</template>
