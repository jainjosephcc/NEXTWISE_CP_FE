<script setup>

const password = ref('');
const confirmPassword = ref('');
const show1 = ref(false);
const show2 = ref(true);
const isSubmitLoading = ref(false);
const isDisabled = ref(false);
const isConfirmDialogVisible=ref(false);
let successTitle = ref('')
let successMessage = ref('')
let errorTitle = ref('')
let errorMessage = ref('')
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);

const props = defineProps({
staffDetails: {
    type: Object,
    required: true,
    default: () => ({})
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
]);

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}

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
    if (confirmed) {       
        try {
            const res = await $api('/ChangeStaffPassword', {
                method: 'POST',
                body: {
                    user_id:props.staffDetails.id,
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
</script>
<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
           @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
    <VCard>
      <!-- SECTION Header -->

      <!-- !SECTION -->
      <VCardTitle class="pt-3">Update Investor Password</VCardTitle>
      <VDivider/>
      <VCardItem>
        <VRow>
          <VCol
            cols="12"
            sm="12"
          >
            <AppTextField
              v-model="password"
              :rules="[rules.required, rules.min,rules.capital,rules.small,rules.special]"
              :append-inner-icon="show1 ? 'tabler-eye-off' : 'tabler-eye' "
              :type="show1 ? 'text' : 'password'"
              name="input-10-2"
              placeholder="············"
              label="Enter Password"
              hint="At least 8 characters"
              @click:append-inner="show1 = !show1"
            />
          </VCol>
          <VCol
            cols="12"
            sm="12"
          >
            <AppTextField
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
        </VRow>
        <p v-if="!passwordsMatch" class="text-body-2 pt-3 pb-0 mb-0 text-error">Passwords do not match</p>
      </VCardItem>
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
          :disabled="isDisabled"
          color="primary"
          @click="isConfirmDialogVisible = true">
        
        <!--  -->
          Update Password
        </VBtn>
      </VCardText>
    </VCard>
    
    </VDialog>
    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                confirmation-question="Are you sure you want to update password?" cancel-title="Cancelled"
                confirm-title="Cancelled!" />

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
</template>
