<script setup>
import { themes } from '@/plugins/vuetify/theme'
import { useChat } from '@/views/apps/chat/useChat'
import { useChatStore } from '@/views/apps/chat/useChatStore'
import {
  useDisplay,
  useTheme,
} from 'vuetify'

definePage({ meta: { layoutWrapperClasses: 'layout-content-height-fixed' } })

// composables
const vuetifyDisplays = useDisplay()
const store = useChatStore()
const { isLeftSidebarOpen } = useResponsiveLeftSidebar(vuetifyDisplays.smAndDown)
const { resolveAvatarBadgeVariant } = useChat()

// Perfect scrollbar
const chatLogPS = ref()

const scrollToBottomInChatLog = () => {
  const scrollEl = chatLogPS.value.$el || chatLogPS.value

  scrollEl.scrollTop = scrollEl.scrollHeight
}

// Search query
const q = ref('')

// watch(q, val => store.fetchChatsAndContacts(val), { immediate: true })

// Open Sidebar in smAndDown when "start conversation" is clicked
const startConversation = () => {
  if (vuetifyDisplays.mdAndUp.value)
    return
  isLeftSidebarOpen.value = true
}

// Chat message
const msg = ref('')

const sendMessage = async () => {
  if (!msg.value)
    return
  await store.sendMsg(msg.value)

  // Reset message input
  msg.value = ''

  // Scroll to bottom
  nextTick(() => {
    scrollToBottomInChatLog()
  })
}

const openChatOfContact = async userId => {
  await store.getChat(userId)

  // Reset message input
  msg.value = ''

  // Set unseenMsgs to 0
  const contact = store.chatsContacts.find(c => c.id === userId)
  if (contact)
    contact.chat.unseenMsgs = 0

  // if smAndDown =>  Close Chat & Contacts left sidebar
  if (vuetifyDisplays.smAndDown.value)
    isLeftSidebarOpen.value = false

  // Scroll to bottom
  nextTick(() => {
    scrollToBottomInChatLog()
  })
}

// User profile sidebar
const isUserProfileSidebarOpen = ref(false)

// Active chat user profile sidebar
const isActiveChatUserProfileSidebarOpen = ref(false)

// file input
const refInputEl = ref()
const { name } = useTheme()

const chatContentContainerBg = computed(() => {
  let color = 'transparent'
  if (themes)
    color = themes?.[name.value].colors?.background

  return color
})

const support_tickets = ref([])
const ticket_id = ref(null)
const ticketMessages = ref(null)
const client_name = ref(null)
const replymsg = ref(null)
const client_id = ref(null)
const profile_pic = ref(null)

onMounted(() => {
  fetchClientSupticket()
})

const fetchClientSupticket = async () => {
  try {
    const res = await $api('/getClientSupportTickets', {
      method: 'POST',
    })
    if (res && res.client_tickets && res.client_tickets.data) {
      support_tickets.value = res.client_tickets.data
    } else {
      console.warn('Client tickets data not found:', res)
    }
  } catch (err) {
    console.error('Error fetching Support Ticket list:', err)
  }
}

const getClientTicketMessages = async () => {
  try {
    const res = await $api(`/getClientTicketMessages/${ticket_id.value}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response)
      },
    })

    if (res) {
      ticketMessages.value = res.ticket_messages.reverse()
    } else {
      console.error('Failed to fetch group list or empty response')
    }
  } catch (err) {
    console.error('Error fetching group list:', err)
  }
}


function getTicketMessages(ticket) {
  ticket_id.value = ticket.ticket_id
  client_name.value = ticket.client_name
  client_id.value = ticket.client_id
  profile_pic.value = ticket.profile_pic
  getClientTicketMessages()
}

const getClientPicUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_S3_BASE_URL
  return (ticket) =>
    ticket.profile_pic ? `${baseUrl}/client/profileImage/${ticket.client_id}/${ticket.profile_pic}` : 'default-image-url' // Provide a default image URL if necessary

})
const getProfilePic = computed(() => {
  const baseUrl = import.meta.env.VITE_S3_BASE_URL
  return profile_pic.value ? `${baseUrl}/client/profileImage/${client_id.value}/${profile_pic.value}` : null
})

const sendReplay = async () => {
  let Messagedata = new FormData()

  Messagedata.append('message', replymsg.value || '')
  Messagedata.append('ticket_id', ticket_id.value || '')

  const res = await $api('/storeTicketReply', {
    method: 'POST',
    body: {
      message: replymsg.value || '',
      ticket_id: ticket_id.value,
    },
    onResponseError({ response }) {

    },
  })
  replymsg.value = ''
  getClientTicketMessages()

}


</script>

<template>
  <!--  <VLayout class="chat-app-layout">

  </VLayout>-->
  <div class="chat-app-layout"
       style="z-index: 0; height: 80vh;"
  >
    <!---->
    <VRow>
      <VCol cols="3">
        <div class="v-navigation-drawer__content">
          <div class="chat-list-header">
            <div class="v-badge v-badge--bordered v-badge--dot">
              <div class="v-badge__wrapper">
                <div class="v-avatar v-theme--light v-avatar--density-default v-avatar--variant-flat cursor-pointer"
                     style="width: 40px; height: 40px;"
                >
                  <div class="v-responsive v-img" aria-label="John Doe" role="img">
                    <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>
                    <img class="v-img__img v-img__img--contain"
                      src="/images/avatars/avatar-0.webp"
                       
                      alt="John Doe" style="">
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                  </div>
                  <!---->
                  <span class="v-avatar__underlay"></span>
                </div>
                <span class="v-badge__badge v-theme--light bg-success" aria-atomic="true" aria-label="Badge"
                      aria-live="polite" role="status" style="top: calc(100% - 11px); left: calc(100% - 11px);"
                >
                  <!---->
                </span>
              </div>
            </div>
            <div class="app-text-field flex-grow-1 ms-4 me-1 chat-list-search">
              <!---->
              <div
                class="v-input v-input--horizontal v-input--center-affix v-input--density-comfortable v-locale--is-ltr v-text-field"
              >
                <!---->
                <div class="v-input__control">
                  <div
                    class="v-field v-field--center-affix v-field--prepended v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                  >
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div
                        class="v-progress-linear v-progress-linear--rounded v-progress-linear--rounded-bar v-progress-linear--rounded v-theme--light v-locale--is-ltr"
                        role="progressbar" aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px; left: 50%; transform: translateX(-50%);"
                      >
                        <!---->
                        <div class="v-progress-linear__background"
                             style="background-color: rgba(var(--v-track-bg)); width: 100%;"
                        ></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long bg-primary"></div>
                          <div class="v-progress-linear__indeterminate short bg-primary"></div>
                        </div>
                        <!---->
                      </div>
                    </div>
                    <div class="v-field__prepend-inner">
                      <i class="tabler-search v-icon notranslate v-theme--light v-icon--size-default"
                         aria-hidden="true"
                      ></i>
                      <!---->
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <!---->
                      <label class="v-label v-field-label" for="input-193">
                        <!---->
                        <!---->
                      </label>
                      <!---->
                      <input placeholder="Search..." size="1" type="text" id="input-193"
                             aria-describedby="input-193-messages" class="v-field__input"
                      >
                      <!---->
                    </div>
                    <!---->
                    <!---->
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <!---->
                      <div class="v-field__outline__end"></div>
                      <!---->
                    </div>
                  </div>
                </div>
                <!---->
                <!---->
              </div>
            </div>
            <!---->
          </div>
          <hr class="v-divider v-theme--light" aria-orientation="horizontal" role="separator">
          <ul class="ps d-flex flex-column gap-y-1 chat-contacts-list px-3 py-2 list-none ps--active-y">
            <li class="list-none">
              <h5 class="chat-contact-header text-primary text-h5 mb-4"> Chats </h5>
            </li>

            <!--Listing starts here---->

            <div v-for="tickets in support_tickets">
              <li class="chat-contact cursor-pointer d-flex align-center chat-contact-active pb-3 mb-2">
                <div class="v-badge v-badge--bordered v-badge--dot">
                  <div class="v-badge__wrapper">
                    <div class="v-avatar v-theme--light v-avatar--density-default v-avatar--variant-flat"
                         style="width: 40px; height: 40px;"
                    >
                      <div class="v-responsive v-img" aria-label="John Doe" role="img">
                        <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>
                        <img v-if="tickets.profile_pic" class="v-img__img v-img__img--contain"
                             :src="getClientPicUrl(tickets)" alt="John Doe" style=""
                        >
                        <img v-else class="v-img__img v-img__img--contain"
                          src="/images/avatars/avatar-0.webp"
                          alt="John Doe" style="">
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                      </div>
                      <!---->
                      <span class="v-avatar__underlay"></span>
                    </div>
                    <span class="v-badge__badge v-theme--light bg-secondary" aria-atomic="true" aria-label="Badge"
                          aria-live="polite" role="status" style="top: calc(100% - 8px); left: calc(100% - 11px);"
                    >
                      <!---->
                    </span>
                  </div>
                </div>
                <div class="flex-grow-1 ms-4 overflow-hidden" @click="getTicketMessages(tickets)">
                  <p class="text-base text-high-emphasis mb-0">{{ tickets.client_name }}</p>

                  <p class="mb-0 text-truncate text-body-2">{{ tickets.subject }}</p>
                </div>
                <div class="d-flex flex-column align-self-start">
                  <div class="text-body-2 text-disabled whitespace-no-wrap">{{
                      formatDateToMonthShort(tickets.created_at)
                    }}
                  </div>
                  <!---->
                </div>
              </li>
            </div>

          </ul>
        </div>
      </VCol>
      <VCol cols="9">
        <div v-if="ticketMessages">
          <main class="v-main chat-content-container"
                style="--v-layout-left: 370px; --v-layout-right: 0px; --v-layout-top: 0px; --v-layout-bottom: 0px;"
          >

            <div class="d-flex flex-column h-100">

              <div class="active-chat-header d-flex align-center text-medium-emphasis bg-surface">
                <button type="button"
                        class="v-btn v-btn--icon v-theme--light text-default v-btn--density-default v-btn--size-default v-btn--variant-text d-md-none me-3"
                >
                  <span class="v-btn__overlay"></span>
                  <span class="v-btn__underlay"></span>
                  <!---->
                  <span class="v-btn__content" data-no-activator="">
                    <i class="tabler-menu-2 v-icon notranslate v-theme--light v-icon--size-default"
                       aria-hidden="true"
                    ></i>
                  </span>
                </button>

                <div class="d-flex align-center cursor-pointer">
                  <div class="v-badge v-badge--bordered v-badge--dot">
                    <div class="v-badge__wrapper">
                      <div
                        class="v-avatar v-theme--light v-avatar--density-default v-avatar--variant-flat cursor-pointer"
                        style="width: 40px; height: 40px;"
                      >
                        <div class="v-responsive v-img" aria-label="Gavin Griffith 1" role="img">
                          <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>

                          <img v-if="profile_pic" class="v-img__img v-img__img--contain" :src="getProfilePic"
                               alt="Gavin Griffith" style=""
                          >

                          <img v-else class="v-img__img v-img__img--contain"
                            src="/images/avatars/avatar-0.webp"
                            alt="Gavin Griffith" style="">
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                        </div>
                        <!---->
                        <span class="v-avatar__underlay"></span>
                      </div>
                      <span class="v-badge__badge v-theme--light bg-secondary" aria-atomic="true" aria-label="Badge"
                            aria-live="polite" role="status" style="top: calc(100% - 8px); left: calc(100% - 11px);"
                      >
                        <!---->
                      </span>
                    </div>
                  </div>
                  <div class="flex-grow-1 ms-4 overflow-hidden">
                    <RouterLink :to="`/client/client-${client_id}-home-null-details`">
                      <div class="text-h6 mb-0 font-weight-regular">{{ client_name }}</div>
                    </RouterLink>
                    <!-- <p class="text-truncate mb-0 text-body-2">Frontend Developer</p> -->
                  </div>
                </div>
                <div class="v-spacer"></div>
                <div class="d-sm-flex align-center d-none text-medium-emphasis">
                  <button type="button"
                          class="v-btn v-btn--icon v-theme--light text-default v-btn--density-default v-btn--size-default v-btn--variant-text"
                  >
                    <span class="v-btn__overlay"></span>
                    <span class="v-btn__underlay"></span>
                    <!---->
                    <span class="v-btn__content" data-no-activator="">
                      <i class="tabler-phone v-icon notranslate v-theme--light v-icon--size-default"
                         aria-hidden="true"
                      ></i>
                    </span>
                    <!---->
                    <!---->
                  </button>
                  <button type="button"
                          class="v-btn v-btn--icon v-theme--light text-default v-btn--density-default v-btn--size-default v-btn--variant-text"
                  >
                    <span class="v-btn__overlay"></span>
                    <span class="v-btn__underlay"></span>
                    <!---->
                    <span class="v-btn__content" data-no-activator="">
                      <i class="tabler-video v-icon notranslate v-theme--light v-icon--size-default"
                         aria-hidden="true"
                      ></i>
                    </span>
                    <!---->
                    <!---->
                  </button>
                  <button type="button"
                          class="v-btn v-btn--icon v-theme--light text-default v-btn--density-default v-btn--size-default v-btn--variant-text"
                  >
                    <span class="v-btn__overlay"></span>
                    <span class="v-btn__underlay"></span>
                    <!---->
                    <span class="v-btn__content" data-no-activator="">
                      <i class="tabler-search v-icon notranslate v-theme--light v-icon--size-default"
                         aria-hidden="true"
                      ></i>
                    </span>
                    <!---->
                    <!---->
                  </button>
                  <button type="button"
                          class="v-btn v-btn--icon v-theme--light text-default v-btn--density-default v-btn--size-default v-btn--variant-text"
                  >
                    <span class="v-btn__overlay"></span>
                    <span class="v-btn__underlay"></span>
                    <!---->
                    <span class="v-btn__content" data-no-activator="">
                      <i class="tabler-dots-vertical v-icon notranslate v-theme--light v-icon--size-default"
                         aria-hidden="true"
                      ></i>
                    </span>
                    <!---->
                    <!---->
                  </button>
                </div>
              </div>
              <VDivider/>

              <ul class="ps flex-grow-1 ps--active-y">
                <div class="chat-log pa-6">
                  <div v-for="ticket in ticketMessages">
                    <div v-if="ticket.client_id" class="chat-group d-flex align-start mb-6">
                      <div class="chat-body d-inline-flex flex-column align-start">
                        <div class="chat-content py-2 px-4 elevation-2 chat-left mb-2"
                             style="background-color: rgb(var(--v-theme-surface));"
                        >
                          <p class="mb-0 text-base">{{ ticket.message }}</p>
                        </div>
                        <div class="">

                          <span class="text-sm ms-2 text-disabled">{{
                              new
                              Date(ticket.created_at).toLocaleString('en-US',
                                { hour: 'numeric', minute: 'numeric', hour12: true })
                            }}</span>

                        </div>
                      </div>
                    </div>


                    <div v-if="ticket.staff_id" class="chat-group d-flex align-start flex-row-reverse mb-6">
                      <div class="chat-avatar ms-4">
                        
                      </div>
                      <div class="chat-body d-inline-flex flex-column align-end">

                        <div class="chat-content py-2 px-4 elevation-2 bg-primary text-white chat-right mb-1"
                             style="background-color: rgb(var(--v-theme-surface));"
                        >
                          <p class="mb-0 text-base">{{ ticket.message }}</p>
                        </div>
                        <div class="text-right">
                          <i class="tabler-checks v-icon notranslate v-theme--light text-success" aria-hidden="true"
                             style="font-size: 16px; height: 16px; width: 16px;"
                          ></i>
                          <span class="text-sm ms-2 text-disabled">{{
                              new
                              Date(ticket.created_at).toLocaleString('en-US',
                                { hour: 'numeric', minute: 'numeric', hour12: true })
                            }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </ul>
              <form class="v-form chat-log-message-form mb-5 mx-5" novalidate="">
                <div
                  class="v-input v-input--horizontal v-input--center-affix v-input--density-default v-locale--is-ltr v-text-field chat-message-input"
                >
                  <!---->
                  <div class="v-input__control">
                    <div
                      class="v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-solo v-theme--light v-locale--is-ltr">
                      
                      <!---->
                      <div class="v-field__field" data-no-activator="">
                        <!---->
                        
                        <!---->
                        <input autofocus="" placeholder="Type your message..." size="1" type="text" id="input-202"
                               aria-describedby="input-202-messages" class="v-field__input" v-model="replymsg"
                        >
                        <!---->
                      </div>
                      <!---->
                      <div class="v-field__append-inner">
                        <div class="d-flex gap-1">
                                                   <button type="button"
                            class="v-btn v-btn--elevated v-theme--light bg-primary v-btn--density-default v-btn--size-default v-btn--variant-elevated"
                            @click="sendReplay">
                            <span class="v-btn__overlay"></span>
                            <span class="v-btn__underlay"></span>
                            <!---->
                            <span class="v-btn__content" data-no-activator=""> Send </span>
                            <span class="v-btn__append">
                              <i class="tabler-send v-icon notranslate v-theme--light v-icon--size-default"
                                 aria-hidden="true"
                                 style="color: rgb(255, 255, 255); caret-color: rgb(255, 255, 255);"
                              ></i>
                            </span>
                            <!---->
                          </button>
                        </div>
                        <!---->
                      </div>
                      <div class="v-field__outline">
                        <!---->
                        <!---->
                      </div>
                    </div>
                  </div>
                  <!---->
                  <!---->
                </div>
                <input type="file" name="file" accept=".jpeg,.png,.jpg,GIF" hidden="">
              </form>
            </div>
            <!-- </div> -->
          </main>
        </div>
      </VCol>
    </VRow>
  </div>

</template>

<style lang="scss">
@use "@styles/variables/vuetify.scss";
@use "@core/scss/base/mixins.scss";
@use "@layouts/styles/mixins" as layoutsMixins;

// Variables
$chat-app-header-height: 76px;

// Placeholders
%chat-header {
  display: flex;
  align-items: center;
  min-block-size: $chat-app-header-height;
  padding-inline: 1.5rem;
}

.chat-start-conversation-btn {
  cursor: default;
}

.chat-app-layout {
  border-radius: vuetify.$card-border-radius;

  @include mixins.elevation(vuetify.$card-elevation);

  $sel-chat-app-layout: &;

  @at-root {
    .skin--bordered {
      @include mixins.bordered-skin($sel-chat-app-layout);
    }
  }

  .active-chat-user-profile-sidebar,
  .user-profile-sidebar {
    .v-navigation-drawer__content {
      display: flex;
      flex-direction: column;
    }
  }

  .chat-list-header,
  .active-chat-header {
    @extend %chat-header;
  }

  .chat-list-sidebar {
    .v-navigation-drawer__content {
      display: flex;
      flex-direction: column;
    }
  }
}

.chat-content-container {
  /* stylelint-disable-next-line value-keyword-case */
  background-color: v-bind(chatContentContainerBg);

  // Adjust the padding so text field height stays 48px
  .chat-message-input {
    .v-field__input {
      font-size: 0.9375rem !important;
      line-height: 1.375rem !important;
      padding-block: 0.6rem 0.5rem;
    }

    .v-field__append-inner {
      align-items: center;
      padding-block-start: 0;
    }

    .v-field--appended {
      padding-inline-end: 8px;
    }
  }
}

.chat-user-profile-badge {
  .v-badge__badge {
    /* stylelint-disable liberty/use-logical-spec */
    min-width: 12px !important;
    height: 0.75rem;
    /* stylelint-enable liberty/use-logical-spec */
  }
}
</style>
