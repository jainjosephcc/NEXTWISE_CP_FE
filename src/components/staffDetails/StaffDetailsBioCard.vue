<script setup>
const snackBarText = ref('')
const isSnackbarVisible = ref(false)
const isPasswordResetDialogVisible = ref(false)
const isStaffEditDialogVisible = ref(false)

const props = defineProps({
  staffDetails: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  crm_details: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})


const copyEmail = (textToCopy) => {
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      snackBarText.value = 'Email Copied to Clipboard'
      isSnackbarVisible.value = true
    }).catch(err => {
      console.error('Failed to copy text: ', err)
    })
  } else {
    console.log('No text to copy')
  }
}

const copyCode = (textToCopy) => {
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      snackBarText.value = 'Code Copied to Clipboard'
      isSnackbarVisible.value = true
    }).catch(err => {
      console.error('Failed to copy text: ', err)
    })
  } else {
    console.log('No text to copy')
  }
}

const copyCodeLink = (textToCopy) => {
  if (textToCopy) {

    navigator.clipboard.writeText(`https://client.bitragemarkets.com/register?promo=${textToCopy}`).then(() => {
      snackBarText.value = 'Link Copied to Clipboard'
      isSnackbarVisible.value = true
    }).catch(err => {
      console.error('Failed to copy text: ', err)
    })
  } else {
    console.log('No text to copy')
  }
}

const getStaffPicUrl = computed(() => {
  const staffPic = props.staffDetails.profile_pic
  const staffId = props.staffDetails.id
  const baseUrl = import.meta.env.VITE_S3_BASE_URL
  return staffPic ? `${baseUrl}/client/profileImage/${staffId}/${staffPic}` : null
})

function handlePasswordReset() {
  isPasswordResetDialogVisible.value = true
}

function handleStaffEdit() {
  isStaffEditDialogVisible.value = true
}

</script>
<template>
  <VRow>
    <!-- SECTION User Details -->
    <VCol cols="12">
      <VCard v-if="props.staffDetails">
        <VRow>
          <VCol cols="6 text-right pr-4">
            <VAvatar rounded :size="90" color="primary" variant="tonal" class="mt-8 mr-3">

              <!-- <VImg v-if="props.staffDetails.profile_pic" :src="getStaffPicUrl" /> -->
              <VImg src="/images/avatars/avatar-0.webp"/>
              <!-- <span class="text-5xl font-weight-medium">
              {{ avatarText(props.userData.fullName) }}
            </span> -->
            </VAvatar>
            <h5 class="text-h5 mt-2 ms-3">
              {{ props.staffDetails.staff_name }}
            </h5>
            <VChip label size="small" class="text-capitalize mt-2 me-9">
              #{{ props.staffDetails.id }}
            </VChip>
          </VCol>
          <VCol cols="6" class="mt-12 ps-4">
            <VRow>
              <!-- Total CRM Column -->
              <VCol cols="12" md="12">
                <div class="d-flex align-center gap-2 mt-0 mb-0">
                  <VAvatar color="primary" variant="tonal" rounded size="30">
                    <VIcon icon="tabler-chart-donut-filled" size="20"/>
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 v-if="props.crm_details" class="text-h6 mb-0">
                      {{ props.crm_details.total_crm_clients }}
                    </h6>
                    <div class="text-xs">
                      Total CRM Clients
                    </div>
                  </div>
                </div>
              </VCol>

              <!-- Unattended Column -->
              <VCol cols="12" md="12">
                <div class="d-flex align-center gap-2 mt-0 mb-0">
                  <VAvatar color="info" variant="tonal" rounded size="30">
                    <VIcon icon="tabler-chart-donut" size="20"/>
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 v-if="props.crm_details" class="text-h6 mb-0">
                      {{ props.crm_details.unattended_clients }}
                    </h6>
                    <div class="text-xs">
                      Unattended Clients
                    </div>
                  </div>
                </div>
              </VCol>

            </VRow>
          </VCol>


        </VRow>
        <VCardText>
          <VDivider class="my-3"/>


          <!-- CONTACT SECTION -->
          <span class="d-flex align-center justify-space-between">
            <p class="text-sm text-disabled mt-5">
              CONTACT
            </p>
            <div class="d-flex">

            </div>
          </span>


          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-mail" size="24" class="me-1"/>
                    <div>{{ props.staffDetails.email }}</div>
                  </div>
                  <div class="d-flex">
                      <VBtn @click="copyEmail(props.staffDetails.email)" size="30" variant="outlined" color="primary"
                            class="me-2"
                      >
                        <VIcon icon="tabler-clipboard-copy" size="20"/>
                      </VBtn>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>


          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-device-landline-phone" size="24" class="me-1"/>
                    <div>{{ props.staffDetails.contact_no }}</div>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>


          <VDivider class="my-5"/>

          <!-- ABOUT SECTION -->
          <p class="text-sm text-disabled">
            ABOUT
          </p>

          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center">
                  <VIcon icon="tabler-face-id" size="24" class="me-2"/>
                  <div class="d-flex gap-x-2 align-center">
                    <div class="text-md text-disabled">Staff ID : </div>
                    <h6 class="text-h6">#{{ props.staffDetails.id }} </h6>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 NAME -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-user-square-rounded" size="24" class="me-2"/>
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled">Staff Name : </div>
                      <h6 class="text-h6">{{ props.staffDetails.staff_name }} </h6>
                    </div>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Designation -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-briefcase" size="24" class="me-2"/>
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled">Designation : </div>
                      <h6 class="text-h6">{{ props.staffDetails.role_name }} </h6>
                    </div>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Team -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-north-star" size="24" class="me-2"/>
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled">Team : </div>
                      <h6 class="text-h6">{{ props.staffDetails.team }} </h6>
                    </div>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Groups -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-users-group" size="24" class="me-2"/>
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled">Group : </div>
                      <h6 class="text-h6">{{ props.staffDetails.group_name }} </h6>
                    </div>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 partner code -->

          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-user-code" size="24" class="me-1"/>
                    <div class="text-md text-disabled">Partner Code : </div>
                    <h6 class="text-h6">{{ props.staffDetails.partner_code }} </h6>

                  </div>
                  <div class="d-flex">
                      <VBtn @click="copyCode(props.staffDetails.email)" size="30" variant="outlined" color="primary"
                            class="me-2"
                      >
                        <VIcon icon="tabler-clipboard-copy" size="20"/>
                      </VBtn>
                  </div>


                </span>
              </VListItemTitle>
            </VListItem>
          </VList>
          <VDivider class="my-3"/>
          <p class="text-sm text-disabled">
            SALES LINK
          </p>
          <!-- 👉 partner code link -->

          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-link" size="24" class="me-1"/>
                    
                    <h6 class="text-h6">/signup?promo={{ props.staffDetails.partner_code }} </h6>
                  </div>
                  <div class="d-flex">
                      <VBtn @click="copyCodeLink(props.staffDetails.partner_code)" size="30" variant="outlined"
                            color="primary" class="me-2"
                      >
                        <VIcon icon="tabler-clipboard-copy" size="20"/>
                      </VBtn>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>
          <VDivider class="my-3"/>
          <p v-if="hasAccess('update_rm_password')||hasAccess('update_staff_details')" class="text-sm text-disabled">
            UPDATE
          </p>

          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div v-if="hasAccess('update_rm_password')" class="d-flex">
                    <VBtn @click="handlePasswordReset()" variant="outlined" color="primary" class="me-2">
                        Password Reset
                      </VBtn>
                  </div>
                  <div v-if="hasAccess('update_staff_details')" class="d-flex">
                      <VBtn @click="handleStaffEdit()" variant="outlined" color="primary" class="me-2">
                        Edit Staff Profile
                      </VBtn>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

        </VCardText>


      </VCard>
    </VCol>
  </VRow>

  <VSnackbar
    v-model="isSnackbarVisible"
    :timeout="2000"
  >
    {{ snackBarText }}
  </VSnackbar>

  <UpdateStaffPasswordDialog v-model:isDialogVisible="isPasswordResetDialogVisible" :staffDetails="staffDetails"/>

  <EditStaffDialog v-model:isDialogVisible="isStaffEditDialogVisible" :staffDetails="staffDetails"/>
</template>
