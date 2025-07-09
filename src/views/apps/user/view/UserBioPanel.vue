<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
  walletCreated: {
    type: Boolean,
    required: true,
  },
  walletBalance: {
    type: Number,
    required: true,
  }
})

const standardPlan = {
  plan: 'Standard',
  price: 99,
  benefits: [
    '10 Users',
    'Up to 10GB storage',
    'Basic Support',
  ],
}

//console.log(props.userData);


const isUserInfoEditDialogVisible = ref(false);
const isUpgradePlanDialogVisible = ref(false);

const total_deposit = ref(null);
const total_withdraw = ref(null);



watch(() => props.userData, (newVal) => {
  if (newVal) {
    fetchStatistics();
  }
}, { immediate: true });



async function fetchStatistics() {
  try {
    const res = await $api(`client/data-header/${props.userData.result.client_details.id}`, {
      method: 'GET',
      onResponseError({ response }) {
        //console.log(response);
      },
    })
    //console.log(res.result);
    total_deposit.value = res.result.total_deposit;
    total_withdraw.value = res.result.total_withdraw;

  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    // Handle error, maybe set default or error text

  }
}



</script>

<template>
  <VRow>
    <!-- SECTION User Details -->
    <VCol cols="12">



      <VCard v-if="props.userData">
        <VRow>
          <VCol cols="6 text-right pr-4">
            <VAvatar rounded :size="90" color="primary" variant="tonal" class="mt-8">
              <VImg src="/images/avatars/avatar-0.webp" />
              <!-- <span class="text-5xl font-weight-medium">
              {{ avatarText(props.userData.fullName) }}
            </span> -->
            </VAvatar>
            <h5 class="text-h5 mt-2 ms-3">
              {{ props.userData.result.client_details.full_name }}
            </h5>

            <!-- 👉 Role chip -->
            <VChip label size="small" class="text-capitalize mt-2">
              #{{ props.userData.result.client_details.id }}
            </VChip>
          </VCol>
          <VCol cols="6" class="mt-8 ps-4">
            <VRow>
              <!-- Deposit Column -->
              <VCol cols="12" md="12">
                <div class="d-flex align-center gap-2 mt-0 mb-0">
                  <VAvatar color="primary" variant="tonal" rounded size="30">
                    <VIcon icon="tabler-home-stats" size="20" />
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 v-if="total_deposit !== null" class="text-h6 mb-0">
                      {{ formatCurrency(total_deposit) }}
                    </h6>
                    <div class="text-xs">
                      Deposit
                    </div>
                  </div>
                </div>
              </VCol>

              <!-- Withdraw Column -->
              <VCol cols="12" md="12">
                <div class="d-flex align-center gap-2 mt-0 mb-0">
                  <VAvatar color="info" variant="tonal" rounded size="30">
                    <VIcon icon="tabler-report-money" size="20" />
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 v-if="total_withdraw !== null" class="text-h6 mb-0">
                      {{ formatCurrency(total_withdraw) }}
                    </h6>
                    <div class="text-xs">
                      Withdraw
                    </div>
                  </div>
                </div>
              </VCol>

              <!-- Wallet Column -->
              <VCol cols="12" md="12">
                <div class="d-flex align-center gap-2 mt-0 mb-0">
                  <VAvatar color="secondary" variant="tonal" rounded size="30">
                    <VIcon icon="tabler-wallet" size="20" />
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 v-if="props.walletBalance > 0" class="text-h6 mb-0">
                      {{ formatCurrency(props.walletBalance) }}
                    </h6>
                    <div v-if="props.walletCreated" class="text-xs">
                      Wallet
                    </div>
                    <div v-else class="text-xs">
                      No Wallet
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
            {{ props.userData.result.client_details.full_name }}
          </h5> -->

          <VDivider class="my-3" />


          <!-- CONTACT SECTION -->
          <span class="d-flex align-center justify-space-between">
            <p class="text-sm text-disabled mt-5">
              CONTACT
            </p>
            <div class="d-flex">
              <VAvatar size="35" variant="tonal" rounded color="primary" class="me-2">
                <VIcon icon="tabler-clipboard-copy" size="20" />
              </VAvatar>
              <VAvatar v-if="props.userData.result.client_details.email_verified == 1" size="35" variant="tonal" rounded
                color="primary" class="text-success">
                <VIcon icon="tabler-mail-check" size="20" />
              </VAvatar>
              <VAvatar v-if="props.userData.result.client_details.email_verified == 0" size="35" variant="tonal" rounded
                color="primary" class="text-success">
                <VIcon icon="tabler-mail-fast" size="25" />
              </VAvatar>
            </div>
          </span>


          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-mail" size="24" class="me-1" />
                    <div>{{ props.userData.result.client_details.email }}</div>
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
                    <div>{{ props.userData.result.client_details.phone }}</div>
                  </div>
                  <!--  <div class="d-flex">
                    <VIcon icon="tabler-face-id" size="24" class="" />
                    <VIcon icon="tabler-face-id" size="24" class="" />
                  </div> -->

                </span>
              </VListItemTitle>
            </VListItem>
          </VList>




          <VDivider class="my-5" />




          <!-- ABOUT SECTION -->
          <p class="text-sm text-disabled">
            ABOUT
          </p>

          <!-- 👉 User ID -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center">
                  <VIcon icon="tabler-face-id" size="24" class="me-1" />
                  <div class="text-body-1 font-weight-medium me-1"></div>
                  <div>#{{ props.userData.result.client_details.id }}</div>
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
                    <VIcon icon="tabler-user-square-rounded" size="24" class="me-1" />
                    <div>{{ props.userData.result.client_details.full_name }}</div>
                  </div>
                  <!--  <div class="d-flex">
                    <VIcon icon="tabler-face-id" size="24" class="" />
                    <VIcon icon="tabler-face-id" size="24" class="" />
                  </div> -->

                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Country -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-map-pin" size="24" class="me-1" />
                    <div>{{ props.userData.result.client_details.country }}</div>
                  </div>
                  <!--  <div class="d-flex">
                    <VIcon icon="tabler-face-id" size="24" class="" />
                    <VIcon icon="tabler-face-id" size="24" class="" />
                  </div> -->

                </span>
              </VListItemTitle>
            </VListItem>
          </VList>




          <VDivider class="my-5" />




          <p class="text-sm text-disabled mt-5">
            PLATFORM
          </p>

          <!-- 👉 Entity Name -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center justify-space-between">
                  <div class="d-flex">
                    <VIcon icon="tabler-tag" size="24" class="me-1" />
                    <div class="text-body-1 font-weight-medium me-1"></div>
                    <div>Entity : {{ props.userData.result.client_details.entity_name }}</div>
                  </div>
                  <VAvatar size="35" variant="tonal" rounded color="primary">
                    <VIcon icon="tabler-edit" size="20" />
                  </VAvatar>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Joined Date -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center">

                  <VIcon icon="tabler-calendar-month" size="24" class="me-1" />
                  <div class="text-body-1 font-weight-medium me-1"></div>
                  <div>Joined On : {{ formatDateToMonthShort(props.userData.result.client_details.joined_on) }}</div>


                </span>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Entity Name -->
          <VList v-if="props.userData.result.client_details.rm_id > 0" class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItem>
                <VListItemTitle class="font-weight-medium">
                  {{ props.userData.result.client_details.rm_name }}
                </VListItemTitle>
                <template #prepend>
                  <VAvatar color="secondary" size="35" variant="tonal" rounded icon="tabler-user-square-rounded" />
                </template>
                <VListItemSubtitle>
                  Relationship Manager
                </VListItemSubtitle>
              </VListItem>
            </VListItem>
          </VList>
          <VListItemTitle v-if="!props.userData.result.client_details.rm_id">
            <span class="d-flex align-center">
              <VIcon icon="tabler-user-cog" size="24" class="me-1" />
              <div class="text-body-1 font-weight-medium me-1"></div>
              Manager Not Assigned
            </span>
          </VListItemTitle>






          <VDivider class="my-5" />




          <p class="text-sm text-disabled mt-5">
            INTRODUCING BROKER
          </p>


          <VList v-if="props.userData.result.client_details.parent_ib_id > 0"
            class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItem>

                <VListItemTitle class="font-weight-medium">
                  {{ props.userData.result.client_details.parent_ib_name }}
                </VListItemTitle>
                <template #prepend>
                  <VAvatar color="secondary" size="35" variant="tonal" rounded icon="tabler-user-pentagon" />
                </template>
                <VListItemSubtitle>
                  Parent IB
                </VListItemSubtitle>
              </VListItem>
            </VListItem>
          </VList>


          <!-- 👉 Entity Name -->
          <VList class="card-list text-medium-emphasis mb-3">
            <VListItem>
              <VListItemTitle>
                <span class="d-flex align-center">
                  <VIcon icon="tabler-stack-push" size="24" class="me-1" />
                  <div class="text-body-1 font-weight-medium me-1"></div>
                  <div>IB STATUS :
                    <VChip class="ms-2" v-if="props.userData.result.client_details.is_ib == 0" variant="outlined"
                      size="x-small">
                      NOT REQUESTED
                    </VChip>
                    <VChip color="success" class="ms-2" v-if="props.userData.result.client_details.is_ib == 2"
                      variant="outlined" size="x-small">
                      ACTIVE IB
                    </VChip>
                    <VChip color="warning" class="ms-2" v-if="props.userData.result.client_details.is_ib == 1"
                      variant="outlined" size="x-small">
                      REQUESTED
                    </VChip>
                  </div>
                </span>
              </VListItemTitle>
            </VListItem>
          </VList>





          <!-- 👉 User Details list -->
          <VList class="card-list mt-2">

          </VList>
        </VCardText>

        <!-- 👉 Edit and Suspend button -->
        <VCardText class="row">
          <div class="col-12 mb-4">
            <VBtn variant="outlined" color="secondary" width="100%">
              VIEW IB PROFILE
            </VBtn>
          </div>
          <div class="col-12">
            <VBtn variant="outlined" color="secondary" width="100%">
              UPDATE CLIENT STATUS
            </VBtn>
          </div>
        </VCardText>
        <p class="text-h6">
          Dov verified:
        <div class="d-inline-block text-body-1" style="font-size: 5px;">
          {{ props.userData.result.client_details.doc_verified }}
        </div>
        </p>
      </VCard>
    </VCol>
    <!-- !SECTION -->

    <!-- SECTION Current Plan -->
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex">
          <!-- 👉 Standard Chip -->
          <VChip label color="primary" size="small" class="font-weight-medium">
            Popular
          </VChip>

          <VSpacer />

          <!-- 👉 Current Price  -->
          <div class="d-flex align-center">
            <sup class="text-h5 text-primary mt-1">$</sup>
            <h1 class="text-h1 text-primary">
              99
            </h1>
            <sub class="mt-3">
              <h6 class="text-h6 font-weight-regular mb-n1">/ month</h6>
            </sub>
          </div>
        </VCardText>

        <VCardText>
          <!-- 👉 Price Benefits -->
          <VList class="card-list">
            <VListItem v-for="benefit in standardPlan.benefits" :key="benefit">
              <div class="d-flex align-center gap-x-2">
                <VIcon size="10" color="secondary" icon="tabler-circle-filled" />
                <div class="text-medium-emphasis">
                  {{ benefit }}
                </div>
              </div>
            </VListItem>
          </VList>

          <!-- 👉 Days -->
          <div class="my-6">
            <div class="d-flex justify-space-between mb-1">
              <h6 class="text-h6">
                Days
              </h6>
              <h6 class="text-h6">
                26 of 30 Days
              </h6>
            </div>

            <!-- 👉 Progress -->
            <VProgressLinear rounded rounded-bar :model-value="65" color="primary" />

            <p class="mt-1">
              4 days remaining
            </p>
          </div>

          <!-- 👉 Upgrade Plan -->
          <div class="d-flex gap-4">
            <VBtn block @click="isUpgradePlanDialogVisible = true">
              Upgrade Plan
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>
    <!-- !SECTION -->
  </VRow>

  <!-- 👉 Edit user info dialog -->
  <UserInfoEditDialog v-model:isDialogVisible="isUserInfoEditDialogVisible" :user-data="props.userData" />

  <!-- 👉 Upgrade plan dialog -->
  <UserUpgradePlanDialog v-model:isDialogVisible="isUpgradePlanDialogVisible" />
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.5rem;
}

.text-capitalize {
  text-transform: capitalize !important;
}
</style>
