<script setup>

const snackBarText= ref('');
const isSnackbarVisible= ref(false);

const props = defineProps({
  profileDetails: {
    type: Object,
    default: () => ({}),
  }
})

const copyEmail = (textToCopy) => {
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      snackBarText.value='Email Copied to Clipboard'
      isSnackbarVisible.value=true;
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  } else {
    console.log('No text to copy');
  }
};

const copyCode = (textToCopy) => {
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      snackBarText.value='Code Copied to Clipboard'
      isSnackbarVisible.value=true;
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  } else {
    console.log('No text to copy');
  }
};

const copyCodeLink = (textToCopy) => {
  if (textToCopy) {

    navigator.clipboard.writeText(`https://client.bitragemarkets.com/register?promo=${textToCopy}`).then(() => {
      snackBarText.value='Link Copied to Clipboard'
      isSnackbarVisible.value=true;
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  } else {
    console.log('No text to copy');
  }
};

</script>
<template>
   <VRow>
    <!-- SECTION User Details -->
    <VCol cols="12">
      <VCard v-if="props.profileDetails">
        <VRow>
          <VCol cols="6 text-right pr-4">
            <VAvatar rounded :size="90" color="primary" variant="tonal" class="mt-8 mr-3">

              <!-- <VImg v-if="props.profileDetails.profile_pic" :src="getStaffPicUrl" /> -->
              <VImg src="/images/avatars/avatar-0.webp" />
              <!-- <span class="text-5xl font-weight-medium">
              {{ avatarText(props.userData.fullName) }}
            </span> -->
            </VAvatar>
            <h5 class="text-h5 mt-2 ms-3">
              {{ props.profileDetails.staff_name }}
            </h5>
            <VChip label size="small" class="text-capitalize mt-2 me-9">
              #{{ props.profileDetails.id }}
            </VChip>
          </VCol>
            <VCol cols="6" class="mt-12 ps-4">
            <VRow>
              <!-- Total CRM Column -->
              <VCol cols="12" md="12">
                <div class="d-flex align-center gap-2 mt-0 mb-0">
                  <VAvatar color="primary" variant="tonal" rounded size="30">
                    <VIcon icon="tabler-users-group" size="20" />
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 class="text-h6 mb-0">
                      {{ props.profileDetails.total_clients }}
                    </h6>
                    <div class="text-xs">
                      Total Clients 
                    </div>
                  </div>
                </div>
              </VCol>

                  <!-- Unattended Column -->
              <VCol cols="12" md="12">
                <div class="d-flex align-center gap-2 mt-0 mb-0">
                  <VAvatar color="info" variant="tonal" rounded size="30">
                    <VIcon icon="tabler-moneybag" size="20" />
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 class="text-h6 mb-0">
                      {{ formatCurrency(props.profileDetails.total_deposit) }}
                    </h6>
                    <div class="text-xs">
                      Total Deposit
                    </div>
                  </div>
                </div>
              </VCol>
 
            </VRow>
            </VCol>

          
        </VRow>
        <VCardText>



          <!-- 👉 Details -->
          <!--  <h5 class="text-h5">
            {{ props.userData.full_name }}
          </h5> -->

          <VDivider class="my-3" />


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
                    <VIcon icon="tabler-mail" size="24" class="me-1" />
                    <div>{{ props.profileDetails.email }}</div>
                  </div>
                  <div class="d-flex">
                      <VBtn  @click="copyEmail(props.profileDetails.email)" size="30" variant="outlined" color="primary" class="me-2">
                        <VIcon icon="tabler-clipboard-copy" size="20" />
                      </VBtn>
                      <VIcon v-if="props.profileDetails.email_verified === 1" icon="tabler-discount-check-filled" size="30" color="primary" />
                      <VIcon v-if="props.profileDetails.email_verified === 0" icon="tabler-alert-triangle-filled" size="30" color="warning" />
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
                    <VIcon icon="tabler-device-landline-phone" size="24" class="me-1" />
                    <div>{{ props.profileDetails.contact_no }}</div>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <VDivider class="my-5" />

           <!-- ABOUT SECTION -->
          <p class="text-sm text-disabled">
            ABOUT
          </p>
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center">
                  <VIcon icon="tabler-face-id" size="24" class="me-2" />
                  <div class="d-flex gap-x-2 align-center">
                    <div class="text-md text-disabled">Staff ID : </div>
                    <h6 class="text-h6">#{{ props.profileDetails.id }} </h6>
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
                    <VIcon icon="tabler-user-square-rounded" size="24" class="me-2" />
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled">Staff Name : </div>
                      <h6 class="text-h6">{{ props.profileDetails.staff_name }} </h6>
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
                    <VIcon icon="tabler-briefcase" size="24" class="me-2" />
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled">Designation : </div>
                      <h6 class="text-h6">{{ props.profileDetails.role_name }} </h6>
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
                    <VIcon icon="tabler-north-star" size="24" class="me-2" />
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled">Team : </div>
                      <h6 class="text-h6">{{ props.profileDetails.team }} </h6>
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
                    <VIcon icon="tabler-users-group" size="24" class="me-2" />
                    <div class="d-flex gap-x-2 align-center">
                      <div class="text-md text-disabled">Group : </div>
                      <h6 class="text-h6">{{ props.profileDetails.group_name }} </h6>
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
                    <VIcon icon="tabler-user-code" size="24" class="me-1" />
                    <div class="text-md text-disabled">Partner Code : </div>
                    <h6 class="text-h6">{{ props.profileDetails.partner_code }} </h6>

                  </div>
                  <div class="d-flex">
                      <VBtn  @click="copyCode(props.profileDetails.partner_code)" size="30" variant="outlined" color="primary" class="me-2">
                        <VIcon icon="tabler-clipboard-copy" size="20" />
                      </VBtn>
                  </div>


                </span>
              </VListItemTitle>
            </VListItem>
          </VList>
        <VDivider class="my-3" />
         <p class="text-sm text-disabled">
            SALES LINK
          </p>
          <!-- 👉 partner code link -->
        
        <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-link" size="24" class="me-1" />
                    
                    <h6 class="text-h6">/signup?promo={{ props.profileDetails.partner_code }} </h6>
                  </div>
                  <div class="d-flex">
                      <VBtn  @click="copyCodeLink(props.profileDetails.partner_code)" size="30" variant="outlined" color="primary" class="me-2">
                        <VIcon icon="tabler-clipboard-copy" size="20" />
                      </VBtn>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>
          <!-- <VDivider class="my-3" /> -->
        </VCardText>
        
      </VCard>
    </VCol>
   </VRow>
   <VSnackbar
    v-model="isSnackbarVisible"
    :timeout="2000"
  >
    {{snackBarText}}
  </VSnackbar>
</template>
