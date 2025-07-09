<script setup>

const name=ref(null);
const email=ref(null);
const contact=ref(null);
const bio=ref(null);
const id=ref(null);
const isConfirmDialogVisible=ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const isLoading=ref(false)
const refInputEl = ref()

const props = defineProps({
  profileDetails: {
    type: Object,
    default: () => ({}),
  }
})

watch(() => props.profileDetails, (profile) => {
  if (profile) {
    id.value=profile.id;
    name.value = profile.staff_name || '';
    email.value = profile.email || '';
    contact.value = profile.contact_no || '';
    bio.value=profile.staff_description ||'';
  }
}, { immediate: true });

const handleConfirm = async (confirmed) => {
    if (confirmed) { 
      isLoading.value=true   
        try {
            const res = await $api('/updateStaffBio', {
                method: 'POST',
                body: {
                    staff_description:bio.value ,
                    user_id: id.value,
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isErrorDialogVisible.value = true;
                    isLoading.value=false;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Bio Updated Successfully !';
                isSuccessDialogVisible.value = true;
                isLoading.value=false;
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isErrorDialogVisible.value = true;
            isLoading.value=false;
        }

    }
}

const handlePageReload = async (confirmed) => {
  window.location.reload();
}
function handleSubmit(){
  isConfirmDialogVisible.value=true
  
}
const changeAvatar = file => {
  const fileReader = new FileReader()
  const { files } = file.target
  
  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = async () => {
      console.log(files,'fggg');
      const formData = new FormData()
      formData.append('profile_image', files ? files[0] : '')
      try {
      const res = await $api('/updateStaffProfilePic', {
        method: 'POST',
        body: formData,
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !'
          errorMessage.value = response._data.message
          // isBtnLoading.value = false
          isErrorDialogVisible.value = true
        },
      })
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Profile Pic Updated Successfully !'
        // isBtnLoading.value = false
        isSuccessDialogVisible.value = true
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong !'
      errorMessage.value = Ex.response ? Ex.response.data.message : Ex.message
      // isBtnLoading.value = false
      isErrorDialogVisible.value = true
    }
  }
    }
  }


  
</script>
<template>

<VCard v-if="profileDetails" title="Update Information">
  <VDivider  />
  <!-- <VRow>
    <VCol cols="12">
        <VCardText class="d-flex"> -->
          <!-- 👉 Avatar -->
          <!-- <VAvatar
            rounded
            size="100"
            class="me-6"
            image=""
          /> -->

          <!-- 👉 Upload Photo -->
          <!-- <form class="d-flex flex-column justify-center gap-4">
            <div class="d-flex flex-wrap gap-4">
              <VBtn
                color="primary"
                size="small"
                @click="refInputEl?.click()"
              >
                <VIcon
                  icon="tabler-cloud-upload"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block">Upload new photo</span>
              </VBtn>

              <input
                ref="refInputEl"
                type="file"
                name="file"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @input="changeAvatar"
              > -->
              <!-- @input="changeAvatar" -->
              <!-- <VBtn
                type="reset"
                size="small"
                color="secondary"
                variant="tonal"
               
              > -->
               <!-- @click="resetAvatar" -->
                <!-- <span class="d-none d-sm-block">Reset</span>
                <VIcon
                  icon="tabler-refresh"
                  class="d-sm-none"
                />
              </VBtn>
            </div>

            <p class="text-body-1 mb-0">
              Allowed JPG, GIF or PNG. Max size of 800K
            </p>
          </form>
        </VCardText>
      </VCol>
    </VRow> -->
    
    <VForm @submit.prevent="() => {}">
        <VRow>
          <VCol cols="8">
            <AppTextField class="ms-5 mt-5" v-model="name" label="Name" readonly/>
          </VCol>

          <VCol cols="8">
            <AppTextField class="ms-5 mt-5" v-model="email" label="Email" readonly/>
          </VCol>

          <VCol cols="8">
            <AppTextField class="ms-5 mt-2" v-model="contact" label="Contact No" readonly/>
          </VCol>
          <VCol cols="8">
            <AppTextarea class="ms-5 mt-2" v-model="bio" label="Update Bio" auto-grow/>
          </VCol>
          <VCol cols="6">
           
          </VCol>
          <VCol cols="6">
            <VBtn class="ms-5 mb-5" color="primary" @click="handleSubmit" :loading="isLoading">
                        Submit
            </VBtn>
          </VCol>
        </VRow>
    </VForm>
</VCard>
<VSkeletonLoader v-else type="table-tbody" />
<ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you want to update bio?" cancel-title="Cancelled"
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
</template>
