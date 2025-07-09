<script setup>
const isConfirmDialogVisible=ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const password = ref('');
const confirmPassword = ref('');
const show1 = ref(false);
const show2 = ref(true);
const isSubmitLoading = ref(false);
const isDisabled = ref(false);
const oldPassword=ref('');
const isLoading=ref(false);

const props = defineProps({
  profileDetails: {
    type: Object,
    default: () => ({}),
  }
})
const rules = {
  required: value => !!value || 'Required.',
  min: v => v.length >= 8 || 'Min 8 characters',
  capital: v => /[A-Z]/.test(v) || 'Min 1 uppercase letter',
  small: v => /[a-z]/.test(v) || 'Min 1 lowercase letter',
  special: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Min 1 special character',
  number: v => /[0-9]/.test(v) || 'Min 1 number',
}
const passwordsMatch = computed(() => password.value === confirmPassword.value);

const handleConfirm = async (confirmed) => {
    isConfirmDialogVisible.value=false;
    if (confirmed) {
      isSubmitLoading.value=true       
        try {
            const res = await $api('/changePassword', {
                method: 'POST',
                body: {
                    user_id:props.profileDetails.id,
                    old_password:oldPassword.value,
                    new_password:password.value,
                    confirm_password:confirmPassword.value

                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Password Updated Successfully !';
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
function handleSubmit(){
  isConfirmDialogVisible.value= true
  
}
</script>
<template>
    <VCard v-if="profileDetails" title="Reset Password">
    <VDivider  />
    <VForm @submit.prevent="() => {}">
        <VRow>
            <VCol
            cols="12"
            sm="12"
            class="ms-5 mt-2 "
          >
            <AppTextField
              class="me-8"
              v-model="oldPassword"
              :type="show1 ? 'text' : 'password'"
              name="input-10-3"
              placeholder="············"
              label="Current Password"
            />
          </VCol>
          <VCol
            cols="12"
            sm="12"
            class="ms-5 mt-2 "
          >
            <AppTextField
              class="me-8"
              v-model="password"
              :rules="[rules.required, rules.min,rules.capital,rules.small,rules.special]"
              :append-inner-icon="show1 ? 'tabler-eye-off' : 'tabler-eye' "
              :type="show1 ? 'text' : 'password'"
              name="input-10-1"
              placeholder="············"
              label="Enter Password"
              hint="At least 8 characters"
              @click:append-inner="show1 = !show1"
            />
          </VCol>
          <VCol
            cols="12"
            sm="12"
            class="ms-5 mt-2 "
          >
            <AppTextField
              class="me-8"
              v-model="confirmPassword"
              :rules="[rules.required, rules.min,rules.capital,rules.small,rules.special]"
              :append-inner-icon="show2 ? 'tabler-eye-off' : 'tabler-eye' "
              :type="show2 ? 'text' : 'password'"
              name="input-10-2"
              placeholder="············"
              label="Enter Confirm Password"
              @click:append-inner="show2 = !show2"
            />
          </VCol>
        
          <p v-if="!passwordsMatch" class="text-body-2 pt-3 pb-0 mb-0 text- ms-5">Passwords do not match</p>
      <VCardText class="d-flex justify-end flex-wrap gap-3">

        <VBtn
          :loading="isSubmitLoading"
          :disabled="isDisabled"
          color="primary"
          @click="handleSubmit"
          >
        <!--  -->
          Update Password
        </VBtn>
      </VCardText>
        </VRow>
    </VForm>
</VCard>
<VSkeletonLoader v-else type="table-tbody" />
<ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Do you want to update password?" cancel-title="Cancelled"
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
