<script setup>
import { ref } from 'vue'

const isCurrentPasswordVisible = ref(false)
const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isConfirmDialogVisible=ref(false)
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const isBtnLoading=ref(false)

const passwordRequirements = [
  'Minimum 8 characters long - the more, the better',
  'At least one lowercase character',
  'At least one uppsercase character',
  'At least one special character',
  'At least one number or symbol',
]


// Validation rules for password
const passwordRules = [
  (v) => !!v || 'Password is required',
  (v) => /[A-Z]/.test(v) || 'At least one uppercase letter',
  (v) => /[a-z]/.test(v) || 'At least one lowercase letter',
  (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'At least one special character',
  (v) => /[0-9]/.test(v) || 'At least one number',
  (v) => v.length >= 8 || 'Minimum 8 characters long',
]

// Rule to check if passwords match
const confirmPasswordRules = [
  (v) => !!v || 'Password is required',
  (v) => v === newPassword.value || 'Passwords must match',
]

const isPasswordsMatch = computed(() => {
  return newPassword.value === confirmPassword.value
})

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isBtnLoading.value = true;  
        try {
            const res = await $api('/change-password', {
                method: 'POST',
                body: {
                  current_password:currentPassword.value,
                  new_password:newPassword.value,
                  new_password_confirmation:confirmPassword.value
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                    isConfirmDialogVisible.value=false;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Password Updated Successfully !';
                isBtnLoading.value = false;
                isSuccessDialogVisible.value = true;
                isConfirmDialogVisible.value=false;
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isBtnLoading.value = false;
            isErrorDialogVisible.value = true;
            isConfirmDialogVisible.value=false;
        }

    }
}
const handlePageReload = async (confirmed) => {
  window.location.reload();
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Change Password">
        <VForm>
          <VCardText class="pt-0">
            <!-- Current Password -->
            <VRow>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="currentPassword"
                  :type="isCurrentPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCurrentPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  label="Current Password"
                  :rules="[(v) => !!v || 'Current password is required']"
                  autocomplete="on"
                  placeholder="············"
                  @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible"
                />
              </VCol>
            </VRow>

            <!-- New Password -->
            <VRow>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="newPassword"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  label="New Password"
                  :rules="passwordRules"
                  autocomplete="on"
                  placeholder="············"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                />
              </VCol>

              <VCol cols="12" md="6">
                <!-- Confirm New Password -->
                <AppTextField
                  v-model="confirmPassword"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  label="Confirm New Password"
                  :rules="confirmPasswordRules"
                  autocomplete="on"
                  placeholder="············"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>
            </VRow>
          </VCardText>

          <!-- Action Buttons -->
          <VCardText class="d-flex flex-wrap gap-4">
            <VBtn @click="isConfirmDialogVisible=true" :disabled="!isPasswordsMatch" :loading="isBtnLoading">Save changes</VBtn>
            
          </VCardText>
        </VForm>

        <VCardText>
            <h6 class="text-h6 text-medium-emphasis mb-4">
              Password Requirements:
            </h6>

            <VList class="card-list">
              <VListItem
                v-for="item in passwordRequirements"
                :key="item"
                :title="item"
                class="text-medium-emphasis"
              >
                <template #prepend>
                  <VIcon
                    size="10"
                    icon="tabler-circle-filled"
                  />
                </template>
              </VListItem>
            </VList>
          </VCardText>
      </VCard>
    </VCol>    
  </VRow>

  <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Do you want to change password?" cancel-title="Cancelled"
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

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 16px;
}


</style>
