<script setup>
import { onMounted } from "vue"

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },
})

const client_id = ref(null);
const currentTab = ref(0);
const leverageTab = ref(0);

watch(() => props.clientId, (newVal) => {
  if (newVal) {
    client_id.value = props.clientId;
    //fetchStatistics();
  }
}, { immediate: true })

watch(() => props.isDialogVisible, async (newVal) => {
  if (newVal) {
    await fetchGroupsLeverages();
  }
}, { immediate: true })

const available_groups = ref(null);
const leverages = ref(null);
const isSubmitLoading = ref(false);
const isDisabled = ref(false);
const isSuccessDialogVisible = ref(false);
let successTitle = ref('')
let successMessage = ref('')
const isErrorDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
const isBtnDisabled=ref(false)

const fetchGroupsLeverages = async () => {
  const res = await $api(`live-account/groups-leverages/${client_id.value}`, {
    method: 'GET',
    onResponseError({ response }) {
      //console.log(response);
      // errors.value = response._data.message
    },
  })
  available_groups.value=res.result.groups;
  leverages.value=res.result.leverage;

}

watch(currentTab, () => {
  if (typeof currentTab.value === 'undefined' || currentTab.value === null) {
    isDisabled.value = true;
  } else {
    isDisabled.value = false;
  }
}, { deep: true, immediate: false });

watch(leverageTab, () => {
  if (typeof leverageTab.value === 'undefined' || leverageTab.value === null) {
    isBtnDisabled.value = true;
  } else {
    isBtnDisabled.value = false;
  }
}, { deep: true, immediate: false });


const createMT5Account = async () => {
  isSubmitLoading.value=true;
  isDisabled.value=true;
  // console.log(available_groups.value[currentTab.value]);
  
  const res = await $api('/live-account/create', {
    method: 'POST',
    body: {
      groupid: available_groups.value[currentTab.value].id,
      client_id: client_id.value,
      leverage: leverages.value[leverageTab.value].leverage,
    },
    onResponseError({ response }) {
      isSubmitLoading.value=false;
      isDisabled.value=false;
      errorTitle.value = 'Something Went Wrong !';
      errorMessage.value = response._data.message;
      isErrorDialogVisible.value=true;
    },
  })
  if(res){
    successTitle.value = 'Account Created !'
    successMessage.value = 'Live MT5 Account Created Successfully !';
    isSuccessDialogVisible.value = true;
    isSubmitLoading.value=false;
    isDisabled.value=false;
  }
  transData.value = res

}


const handlePageReload = async (confirmed) => {
  window.location.reload();
}

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])



const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}


const selectedRadio = ref('starter')

// To access the properties individually and maintain reactivity, use `toRefs`
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
    <VCard>
      <!-- SECTION Header -->

      <!-- !SECTION -->
      <VCardTitle>Create Live MT5 Account</VCardTitle>
      <VDivider/>
      <VCardSubtitle class="pt-3">Select Group</VCardSubtitle>
      <div class="pa-3 pa-sm-4" v-if="available_groups">
        <VSlideGroup v-model="currentTab" class="mt-0">
          <VSlideGroupItem v-for="(data, index) in available_groups" :key="data.id" v-slot="{ isSelected, toggle }"
                           :value="index"
          >
            <div style="block-size: 160px; inline-size: 130px;"
                 :style="isSelected ? 'border-color:rgb(var(--v-theme-primary)) !important' : ''"
                 :class="isSelected ? 'border' : 'border border-dashed'"
                 class="d-flex flex-column justify-center align-center cursor-pointer rounded py-4 px-5 me-4"
                 @click="toggle"
            >
              <VAvatar rounded size="45" :color="isSelected ? 'primary' : ''" variant="tonal" class="mb-2 ps-1 pe-1">
                <VImg src="/images/svg/mt5_lined.svg" size="22"/>
              </VAvatar>
              <h6 class="text-base font-weight-medium mb-2">
                {{ data.mt_group_name }}
              </h6>
              <div class="d-flex justify-space-between align-center gap-2 flex-wrap" style="font-size: 12px;"><span class="app-timeline-title">Spread  :</span><span class="app-timeline-meta">{{ data.spread }}</span></div>
              <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-2" style="font-size: 12px;"><span class="fs-">Min Dep.:</span><span class="app-timeline-meta">{{ data.min_deposit }}</span></div>
            </div>
          </VSlideGroupItem>
        </VSlideGroup>
      </div>
      <VSkeletonLoader v-else v-for="i in 3" :key="i" type="article" />
      <VCardSubtitle class="pt-3">Select Leverage</VCardSubtitle>
      <div class="pa-3 pa-sm-4">
        <VSlideGroup v-model="leverageTab" class="mt-0">
          <VSlideGroupItem v-for="(data, index) in leverages" :key="data.id" v-slot="{ isSelected, toggle }"
                           :value="index"
          >
            <div style="block-size: 30px; inline-size: 100px;"
                 :style="isSelected ? 'border-color:rgb(var(--v-theme-primary)) !important' : ''"
                 :class="isSelected ? 'border' : 'border border-dashed'"
                 class="d-flex flex-column justify-center align-center cursor-pointer rounded py-4 px-5 me-4"
                 @click="toggle"
            >
              <h6 class="text-base font-weight-medium">
                1:{{ data.leverage }}
              </h6>
             </div>
          </VSlideGroupItem>
        </VSlideGroup>
      </div>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="dialogModelValueUpdate(false)"
        >
          Close
        </VBtn>
        <VBtn
          :loading="isSubmitLoading"
          :disabled="isDisabled || isBtnDisabled"
          color="primary"
          @click="createMT5Account()"
        >
          Create Account
        </VBtn>
      </VCardText>
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
    </VCard>
  </VDialog>
</template>
