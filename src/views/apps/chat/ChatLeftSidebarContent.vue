<script setup>
import ChatContact from '@/views/apps/chat/ChatContact.vue';
import { useChatStore } from '@/views/apps/chat/useChatStore';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import { useChat } from './useChat';

const props = defineProps({
  search: {
    type: String,
    required: true,
  },
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'openChatOfContact',
  'showUserProfile',
  'close',
  'update:search',
])

const support_tickets = ref([]);

const fetchClientSupticket = async () => {
  try {
    const res = await $api('/getClientSupportTickets', {
      method: 'POST',
    });
    if (res && res.client_tickets && res.client_tickets.data) {
      support_tickets.value = res.client_tickets.data; // Access the 'data' array from the response
    } else {
      console.warn('Client tickets data not found:', res);
    }
  } catch (err) {
    console.error('Error fetching Support Ticket list:', err);
  }
}


// Calling functions
onMounted(() => {
  fetchClientSupticket();
});

const { resolveAvatarBadgeVariant } = useChat()
const search = useVModel(props, 'search', emit)
const store = useChatStore()
</script>

<template>
  <!-- 👉 Chat list header -->
  <div v-if="store.profileUser" class="chat-list-header">
    <VBadge dot location="bottom right" offset-x="3" offset-y="3"
      :color="resolveAvatarBadgeVariant(store.profileUser.status)" bordered>
      <VAvatar size="40" class="cursor-pointer" @click="$emit('showUserProfile')">
        <VImg :src="store.profileUser.avatar" alt="John Doe" />
      </VAvatar>
    </VBadge>

    <AppTextField v-model="search" placeholder="Search..." prepend-inner-icon="tabler-search"
      class="ms-4 me-1 chat-list-search" />

    <IconBtn v-if="$vuetify.display.smAndDown" @click="$emit('close')">
      <VIcon icon="tabler-x" class="text-medium-emphasis" />
    </IconBtn>
  </div>
  <VDivider />

  <PerfectScrollbar tag="ul" class="d-flex flex-column gap-y-1 chat-contacts-list px-3 py-2 list-none"
    :options="{ wheelPropagation: false }">
    <li class="list-none">
      <h5 class="chat-contact-header text-primary text-h5">
        Chats
      </h5>
    </li>

    <li :key="store.chatsContacts.length" class="chat-contact cursor-pointer d-flex align-center"
      :class="{ 'chat-contact-active': isChatContactActive }">
      <VBadge dot location="bottom right" offset-x="3" offset-y="0" color="info" bordered
        :model-value="props.isChatContact">
        <VAvatar size="40" :variant="!props.user.avatar ? 'tonal' : undefined"
          :color="!props.user.avatar ? resolveAvatarBadgeVariant(props.user.status) : undefined">
          <VImg v-if="props.user.avatar" :src="props.user.avatar" alt="John Doe" />
          <span v-else>{{ avatarText(user.fullName) }}</span>
        </VAvatar>
      </VBadge>
      <div class="flex-grow-1 ms-4 overflow-hidden">
        <p class="text-base text-high-emphasis mb-0">
          {{ props.user.fullName }}
        </p>
        <p class="mb-0 text-truncate text-body-2">
          {{ props.isChatContact && 'chat' in props.user ? props.user.chat.lastMessage.message : props.user.about }}
        </p>
      </div>
      <div v-if="props.isChatContact && 'chat' in props.user" class="d-flex flex-column align-self-start">
        <div class="text-body-2 text-disabled whitespace-no-wrap">
          {{ formatDateToMonthShort(props.user.chat.lastMessage.time) }}
        </div>
        <VBadge v-if="props.user.chat.unseenMsgs" color="error" inline :content="props.user.chat.unseenMsgs"
          class="ms-auto" />
      </div>
    </li>
    <!--  <ChatContact
      v-for="contact in support_tickets"
      :key="contact.ticket_id"
      :user="contact"
      is-chat-contact
      @click="$emit('openChatOfContact', contact.ticket_id)"
    /> -->
    <!--<VList class="card-list">
      <VListItem v-for="item in support_tickets" :key="item.ticket_id">
        <template #prepend>
          <VAvatar rounded size="34" color="secondary" variant="tonal" class="me-1">
            <VIcon size="22" />
          </VAvatar>
        </template>
<VListItemTitle class="font-weight-medium me-2">
  {{ item.client_name }}
</VListItemTitle>
<VListItemSubtitle class="font-weight-medium me-2">
  {{ item.email }}
</VListItemSubtitle>
<template #append>
          <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
            <VChip size="x-small" label="Ticket ID">
              {{ item.ticket_id }}
            </VChip>
          </VAvatar>
          <span>
            <VBtn icon="tabler-user-plus" variant="outlined" color="success"
              @click="fetchTicketdetails(item.ticket_id)" />
          </span>
        </template>
</VListItem>
</VList>-->

    <span v-show="!store.chatsContacts.length" class="no-chat-items-text text-disabled">No chats found</span>
    <li class="list-none pt-2">
      <h5 class="chat-contact-header text-primary text-h5">
        Contacts
      </h5>
    </li>

    <ChatContact v-for="contact in store.contacts" :key="`chat-${contact.id}`" :user="contact"
      @click="$emit('openChatOfContact', contact.id)" />

    <span v-show="!store.contacts.length" class="no-chat-items-text text-disabled">No contacts found</span>
  </PerfectScrollbar>
</template>

<style lang="scss">
.chat-contacts-list {
  --chat-content-spacing-x: 16px;

  padding-block-end: 0.75rem;

  .chat-contact-header {
    margin-block: 0.5rem 0.25rem;
  }

  .chat-contact-header,
  .no-chat-items-text {
    margin-inline: var(--chat-content-spacing-x);
  }
}

.chat-list-search {
  .v-field--focused {
    box-shadow: none !important;
  }
}
</style>
