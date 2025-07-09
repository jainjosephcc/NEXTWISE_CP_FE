<script setup>
import { country_list, fetchCountryList } from '@/utils/apiUtils';
import { computed, nextTick, onMounted, ref } from 'vue';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

const show1 = ref(false)
const show2 = ref(false)
const refForm = ref()
const inlineRadio = ref('0')
const fullName = ref('')
const email = ref('')
const country = ref('')
const contact = ref('')
const password = ref('')
const confirmPassword = ref('')
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isMandotoryFilled = ref(null);
let errorTitle = ref('');
let errorMessage = ref('');
let successTitle = ref('');
let successMessage = ref('');
const passwordsMatch = computed(() => password.value === confirmPassword.value)

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'userData',
])

const handleDrawerModelValueUpdate = (val) => {
  emit('update:isDrawerOpen', val)
}

const rules = {
  required: (value) => !!value || 'Required.',
  min: (v) => v.length >= 8 || 'Min 8 characters',
  capital: (v) => /[A-Z]/.test(v) || 'Min 1 uppercase letter',
  small: (v) => /[a-z]/.test(v) || 'Min 1 lowercase letter',
  special: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Min 1 special character',
  number: (v) => /[0-9]/.test(v) || 'Min 1 number',
  email: (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
}

const validateForm = () => {
  const requiredFields = [
    fullName.value,
    email.value,
    country.value,
    contact.value,
    password.value,
    confirmPassword.value
  ];
  return requiredFields.every((field) => !!field) && passwordsMatch.value;
}

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}
const handleConfirm = async (confirmed) => {
  if (confirmed) {
    isApproveBtnLoading.value = true;

    try {
      const response = await fetch('https://beclient.bitragemarkets.com/api/client/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_entity: 1,
          email_id: email.value,
          fname: fullName.value,
          is_corporate: inlineRadio.value,
          is_email_verified: 0,
          nationality: country.value,
          password: password.value,
          phone_number: contact.value,
          // const res = await response.json();
        }),

        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong !';
          errorMessage.value = response._data.message;
          isApproveBtnLoading.value = false;
          isErrorDialogVisible.value = true;
        },
      })
      const res = await response.json();
      if (res) {
        successTitle.value = 'Success !'
        successMessage.value = 'Client Created Successfully !';
        isApproveBtnLoading.value = false;
        isSuccessDialogVisible.value = true;
      }
    }
    catch (Ex) {
      errorTitle.value = 'Something Went Wrong !';
      errorMessage.value = Ex.data.message;
      isApproveBtnLoading.value = false;
      isErrorDialogVisible.value = true;
    }
  }
}



const handlePageReload = async (confirmed) => {
  window.location.reload();
}

function handleAddTeamSubmit() {

  isMandotoryFilled.value = true;
  isConfirmDialogVisible.value = true;

}


onMounted(async () => {
  await fetchCountryList();
});
</script>

<template>
  <VNavigationDrawer temporary :width="400" location="end" class="scrollable-content" :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate">
    <!-- 👉 Title -->
    <AppDrawerHeaderSection title="Add New Client" @cancel="closeNavigationDrawer" />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->

          <!---👉options for client  -->
          <VRow>
            <VRadioGroup v-model="inlineRadio" inline>
              <VRadio label="Individual Client" value="0" />
              <VRadio label="Corporate Client" value="1" />
            </VRadioGroup>
          </VRow>
          <VRow>

            <!-- 👉 Full name -->
            <VCol cols="12">
              <AppTextField v-model="fullName" :rules="[rules.required]" label="Full Name"
                placeholder="Enter your full name" />
            </VCol>

            <!-- 👉 Email -->
            <VCol cols="12">
              <AppTextField v-model="email" :rules="[rules.required, rules.email]" label="Email"
                placeholder="Enter your email id" />
            </VCol>
            <!-- 👉 Contact -->
            <VCol cols="12">
              <AppTextField v-model="contact" type="number" :rules="[rules.required]" label="Contact"
                placeholder="Enter your contact number" />
            </VCol>

            <!-- 👉 Country -->
            <VCol cols="12">
              <AppSelect v-model="country" label="Select Country" placeholder="Select Country" :rules="[rules.required]"
                :items="country_list" clearable />
            </VCol>

            <VCol cols="12" sm="12">
              <AppTextField v-model="password"
                :rules="[rules.required, rules.min, rules.capital, rules.small, rules.special]"
                :append-inner-icon="show1 ? 'tabler-eye-off' : 'tabler-eye'" :type="show1 ? 'text' : 'password'"
                name="input-10-2" placeholder="············" label="Enter Password" hint="At least 8 characters"
                @click:append-inner="show1 = !show1" />
            </VCol>
            <VCol cols="12" sm="12">
              <AppTextField v-model="confirmPassword"
                :rules="[rules.required, rules.min, rules.capital, rules.small, rules.special]"
                :append-inner-icon="show2 ? 'tabler-eye-off' : 'tabler-eye'" :type="show2 ? 'text' : 'password'"
                name="input-10-2" placeholder="············" label="Enter Confirm Password"
                @click:append-inner="show2 = !show2" />
            </VCol>

            <!-- 👉 Submit and Cancel -->
            <VCol cols="12">
              <VBtn class="me-3" @click="handleAddTeamSubmit()" :loading="isApproveBtnLoading">
                Submit
              </VBtn>
              <VBtn type="reset" variant="tonal" color="error" @click="closeNavigationDrawer">
                Cancel
              </VBtn>
            </VCol>
          </VRow>

        </VCardText>
        <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
          confirmation-question="Are you sure you want to add this client?" cancel-title="Cancelled"
          confirm-title="Confirmed!" />
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

    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
