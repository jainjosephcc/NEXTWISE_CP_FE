<script setup>
const emit = defineEmits(['close'])

const content = ref('')
const to = ref('')
const subject = ref('')
const message = ref('')

const items = [
  'Schedule Mail',
  'Save Draft',
  'Sent',
]

const cc = ref('')
const bcc = ref('')
const isEmailCc = ref(false)
const isEmailBcc = ref(false)

const resetValues = () => {
  to.value = subject.value = message.value = ''
}

const searchQuery = ref('');
const selectedMTStatus = ref(null);
const selectedDepositStatus = ref(null);
const selectedDocStatus = ref(null);
const selectedManager = ref(null);
const selectedCountry = ref(null);
const selectedIBStatus = ref(null);
const usersData = ref(null);
const selectedIds=ref([]);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')

const mt_status_list = [
  { title: 'All', value: null },
  { title: 'Account Not Created', value: '0' },
  { title: 'Live Account Created', value: '1' },
  { title: 'Demo Account Created', value: '2' },
];
const deposit_status_list = [
  { title: 'All', value: null },
  { title: 'Deposited', value: '1' },
  { title: 'Not Deposited', value: '1' },
];
const document_status_list = [
  { title: 'All', value: null },
  { title: 'Upload Pending', value: '0' },
  { title: 'Approved', value: '3' },
  { title: 'Rejected', value: '2' },
  { title: 'Verification Pending', value: '1' },
];
const ib_status_list = [
  { title: 'All', value: null },
  { title: 'Normal User', value: '0' },
  { title: 'IB Requested', value: '1' },
  { title: 'Active IB', value: '2' },
];

watch([selectedMTStatus, selectedDepositStatus, selectedDocStatus, selectedManager, selectedCountry, selectedIBStatus, searchQuery], () => {
  fetchUsers();
}, { deep: true, immediate: false });

const fetchUsers = async () => {
  usersData.value = null;
  const res = await $api('/client/sorted-list', {
    method: 'POST',
    body: {
      keyword: searchQuery.value,
      page: null,
      RM: selectedManager.value,
      mt_account_status: selectedMTStatus.value,
      deposit_status: selectedDepositStatus.value,
      document_status: selectedDocStatus.value,
      country: selectedCountry.value,
      is_ib: selectedIBStatus.value
    },
    onResponseError({ response }) {
      console.log(response);
      // errors.value = response._data.message
    },
  })
  usersData.value = res;

}
const users = computed(() => usersData.value?.result.client_details.data || []);

function sendMail(){
  isConfirmDialogVisible.value=true;
  console.log('sendmail',selectedIds.value);
  console.log('sub',subject.value);
  console.log('content',content.value);

  
  
}
const handleConfirm = async (confirmed) => {
    if (confirmed) {     
        try {
            const res = await $api('/sendEmail', {
                method: 'POST',
                body: {
                    subject:subject.value ,
                    emailContent: content.value,
                    ids:selectedIds.value
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Mail Send Successfully !';
                isSuccessDialogVisible.value = true;
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isErrorDialogVisible.value = true;
        }
    }
}
const handlePageReload = async (confirmed) => {
  window.location.reload();
}

function isSelected(userId) {
      return this.selectedIds.includes(userId);
    }

const selectedUsers = ref([]);

// Watch selectedIds for changes
watch(selectedIds, (newSelectedIds) => {
  selectedUsers.value = users.value.filter(user => newSelectedIds.includes(user.id));
  console.log(selectedUsers.value,'selected user');
  console.log(selectedIds.value,'selected valu');
   // Log the updated selectedUsers for debugging
}, { immediate: true });

// Optionally, you can use a method to toggle selection
function toggleSelection(userId) {
  if (selectedIds.value.includes(userId)) {
    selectedIds.value = selectedIds.value.filter(id => id !== userId);
  } else {
    selectedIds.value.push(userId);
  }
  console.log(selectedIds.value);
  
}
// function getDetails(){
//   this.selectedUsers = this.users.filter(user => newSelectedIds.includes(user.id));
//   console.log(this.selectedUsers);
  
// }

</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    
      <VRow>
        <VCol cols="12">
          <VCard>
            <VCardTitle>
              Bulk Email
            </VCardTitle>
          </VCard>
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="6">
          <VCard>
            <VCol cols="12">
              <VCard>
                <VCard
                  class="email-compose-dialog"
                  elevation="15"
                  max-width="40vw"
                >
                  <VCardItem class="py-3 px-6">
                    <div class="d-flex align-center">
                      <h5 class="text-h5">
                        Compose Mail
                      </h5>
                      <VSpacer />

                      <!-- <div class="d-flex align-center gap-x-2">
                        <IconBtn
                          size="small"
                          icon="tabler-minus"
                          @click="$emit('close')"
                        />
                        <IconBtn
                          size="small"
                          icon="tabler-x"
                          @click="$emit('close'); resetValues()"
                        />
                      </div> -->
                    </div>
                  </VCardItem>

                  <div class="px-1 pe-6 py-1">
                    <VTextField
                      v-model="to"
                      density="compact"
                    >
                    <div v-for="user in selectedUsers" :key="user.id" class="selected-chip">
                      <VChip class="ma-2" color="primary" outlined>{{ user.client_name }}</VChip>
                    </div>
                      <template #prepend-inner>
                        <div class="text-base font-weight-medium text-disabled">
                          To:
                        </div>
                      </template>
                      <template #append>
                        <span class="cursor-pointer">
                          <span @click="isEmailCc = !isEmailCc">Cc</span>
                          <span> | </span>
                          <span @click="isEmailBcc = !isEmailBcc">Bcc</span>
                        </span>
                      </template>
                    </VTextField>
                  </div>

                  <VExpandTransition>
                    <div v-if="isEmailCc">
                      <VDivider />

                      <div class="px-1 pe-6 py-1">
                        <VTextField
                          v-model="cc"
                          density="compact"
                        >
                          <template #prepend-inner>
                            <div class="text-disabled font-weight-medium">
                              Cc:
                            </div>
                          </template>
                        </VTextField>
                      </div>
                    </div>
                  </VExpandTransition>

                  <VExpandTransition>
                    <div v-if="isEmailBcc">
                      <VDivider />

                      <div class="px-1 pe-6 py-1">
                        <VTextField
                          v-model="bcc"
                          density="compact"
                        >
                          <template #prepend-inner>
                            <div class="text-disabled font-weight-medium">
                              Bcc:
                            </div>
                          </template>
                        </VTextField>
                      </div>
                    </div>
                  </VExpandTransition>

                  <VDivider />
                  <div class="px-1 pe-6 py-1">
                    <VTextField
                      v-model="subject"
                      density="compact"
                    >
                      <template #prepend-inner>
                        <div class="text-base font-weight-medium text-disabled">
                          Subject:
                        </div>
                      </template>
                    </VTextField>
                  </div>

                  <VDivider />

                  <!-- 👉 Tiptap Editor  -->
                  <TiptapEditor
                    v-model="content"
                    placeholder="Message"
                  />

                  <VDivider />

                  <div class="d-flex align-center px-6 py-4">
                    <VBtn
                      color="primary"
                      class="me-4"
                      append-icon="tabler-send"
                      @click="sendMail"
                    >
                      send

                      <!-- <VMenu activator="parent">
                        <VList>
                          <VListItem
                            v-for="(item, index) in items"
                            :key="index"
                            :value="index"
                          >
                            {{ item }}
                          </VListItem>
                        </VList>
                      </VMenu> -->
                    </VBtn>

                    <IconBtn size="small">
                      <VIcon icon="tabler-paperclip" />
                    </IconBtn>

                    <VSpacer />

                    <IconBtn
                      size="small"
                      class="me-2"
                    >
                      <VIcon icon="tabler-dots-vertical" />
                    </IconBtn>

                    <IconBtn
                      size="small"
                      @click="$emit('close'); resetValues()"
                    >
                      <VIcon icon="tabler-trash" />
                    </IconBtn>
                  </div>
                </VCard>
              </VCard>
            </VCol>
          </VCard>
        </VCol>

        <VCol cols="6">
          <VCard>
            <VCardTitle>
              FILTER
            </VCardTitle>
            <VRow class="mx-2 my-2">
              <!-- 👉 Select MT ACCOOUNT -->
              <VCol cols="3">
                <AppSelect label="MT Account Status" v-model="selectedMTStatus" placeholder="MT Account Status"
                  :items="mt_status_list" clearable clear-icon="tabler-x" />
              </VCol>
              <!-- 👉 Select DEPOSIT STATUS -->
              <VCol cols="3">
                <AppSelect v-model="selectedDepositStatus" label="Deposit Status" placeholder="Deposit Status"
                  :items="deposit_status_list" clearable clear-icon="tabler-x" />
              </VCol>
              <!-- 👉 Select DOCUMENT STATUS -->
              <VCol cols="3">
                <AppSelect v-model="selectedDocStatus" label="Document Status" placeholder="Document Status"
                  :items="document_status_list" clearable clear-icon="tabler-x" />
              </VCol>
              <!-- 👉 Select ASSIGNED MANAGER -->
              <!-- 👉 Select ASSIGNED MANAGER -->
              <CustomManagerSelectWidget v-model="selectedManager" />
              <!-- 👉 Select ASSIGNED MANAGER -->
              <!-- 👉 Select Country -->

              <VCol v-if="country_list && country_list.length > 2" cols="13">
                <AppSelect v-model="selectedCountry" label="Country" placeholder="Country" :items="country_list" clearable
                  clear-icon="tabler-x" />
              </VCol>
              <!-- 👉 Select Country -->
              <VCol cols="3">
                <AppSelect v-model="selectedIBStatus" label="IB Status" placeholder="IB Status" :items="ib_status_list"
                  clearable clear-icon="tabler-x" />
              </VCol>
              <div style="inline-size: 15.625rem;" class="mt-9">
                <AppTextField v-model="searchQuery" placeholder="Search User" />
              </div>
            </VRow>

          <VRow class="mb-3">
            <VCol cols="6" v-for="user in users" :key="user.id">
              <VRow class="align-center">
                <VCol cols="auto">
                  <VCheckbox v-model="selectedIds" :value="user.id" />
                </VCol>
                <VCol>
                  <CustomClientCardChip 
                    :client_name="user.client_name" 
                    :client_id="user.id" 
                    :email="user.email"
                    :client_pic="user.client_pic">
                  </CustomClientCardChip>
                </VCol>
              </VRow>
            </VCol>
          </VRow>




          </VCard>
        </VCol>
      </VRow>
      <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Do you want to send mail?" cancel-title="Cancelled"
                confirm-title="Cancelled!" />

    <VDialog v-model="isSuccessDialogVisible" max-width="500">
      <VCard>
      <VCardText class="text-center px-10 py-6">
          <VBtn icon variant="outlined" color="success" class="my-4"
              style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
          <VIcon icon="tabler-check" size="38" />
          </VBtn>
          <h1 class="text-h4 mb-4">
          {{ successTitle }}
          </h1>
          <p>{{ successMessage }}</p>
          <VBtn color="success" @click="handlePageReload()">
          OK
          </VBtn>
      </VCardText>
      </VCard>
    </VDialog>
    <VDialog v-model="isErrorDialogVisible" max-width="500">
        <VCard>
        <VCardText class="text-center px-10 py-6">
            <VBtn icon variant="outlined" color="error" class="my-4"
                style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
            <span class="text-5xl font-weight-light">X</span>
            </VBtn>
            <h1 class="text-h4 mb-4">
            {{ errorTitle }}
            </h1>
            <p>{{ errorMessage }}</p>
            <VBtn color="success" @click="handlePageReload">
            Ok
            </VBtn>
        </VCardText>
        </VCard>
    </VDialog>
  </section>
</template>

<style lang="scss">
@use "@core/scss/base/mixins";

.v-card.email-compose-dialog {
  z-index: 910 !important;

  @include mixins.elevation(18);

  .v-field--prepended {
    padding-inline-start: 20px;
  }

  .v-field__prepend-inner {
    align-items: center;
    padding: 0;
  }

  .v-card-item {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }

  .v-textarea .v-field {
    --v-field-padding-start: 20px;
  }

  .v-field__outline {
    display: none;
  }

  .v-input {
    .v-field__prepend-inner {
      display: flex;
      align-items: center;
      padding-block-start: 0;
    }
  }

  .app-text-field {
    .v-field__input {
      padding-block-start: 6px;
    }

    .v-field--focused {
      box-shadow: none !important;
    }
  }
}

.email-compose-dialog {
  .ProseMirror {
    p {
      margin-block-end: 0;
    }

    padding: 1.5rem;
    block-size: 250px;
    overflow-y: auto;
    padding-block: 0.5rem;

    &:focus-visible {
      outline: none;
    }

    p.is-editor-empty:first-child::before {
      block-size: 0;
      color: #adb5bd;
      content: attr(data-placeholder);
      float: inline-start;
      pointer-events: none;
    }

    ul,
    ol {
      padding-inline: 1.125rem;
    }

    &-focused {
      outline: none;
    }
  }
}
</style>

