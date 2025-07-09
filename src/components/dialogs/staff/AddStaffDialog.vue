<script setup>
import { computed, nextTick, ref } from 'vue';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

const show1 = ref(false);
const show2 = ref(false);
const refForm = ref();
const name = ref('');
const email = ref('');
const contact = ref('');
const password = ref('');
const confirmPassword = ref('');
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isMandotoryFilled = ref(null);
let errorTitle = ref('');
let errorMessage = ref('');
let successTitle = ref('');
let successMessage = ref('');
const gender = ref(null);
const emailError = ref('');
const contactError = ref('');
const passwordsMatch = computed(() => password.value === confirmPassword.value);

const genderOptions = [
    { text: 'Male', value: 'Male' },
    { text: 'Female', value: 'Female' },
    { text: 'Other', value: 'Other' }
];

const props = defineProps({
    isDrawerOpen: {
        type: Boolean,
        required: true
    },
    groupsList: {
        type: Object,
        required: true
    },
    teamsList: {
        type: Object,
        required: true
    },
    rolesList: {
        type: Object,
        required: true
    }
});

const selectedGroup = ref(null);
const selectedTeam = ref(null);
const selectedRole = ref(null);

const emit = defineEmits([
    'update:isDrawerOpen',
    'userData'
]);

const handleDrawerModelValueUpdate = (val) => {
    emit('update:isDrawerOpen', val);
};

const rules = {
    required: (value) => !!value || 'Required.',
    min: (v) => v.length >= 8 || 'Min 8 characters',
    capital: (v) => /[A-Z]/.test(v) || 'Min 1 uppercase letter',
    small: (v) => /[a-z]/.test(v) || 'Min 1 lowercase letter',
    special: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Min 1 special character',
    number: (v) => /[0-9]/.test(v) || 'Min 1 number',
    email: (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
};

const validateForm = () => {
    const requiredFields = [
        name.value,
        email.value,
        contact.value,
        password.value,
        confirmPassword.value
    ];
    return requiredFields.every((field) => !!field) && passwordsMatch.value;
};

const closeNavigationDrawer = () => {
    emit('update:isDrawerOpen', false);
    nextTick(() => {
        refForm.value?.reset();
        refForm.value?.resetValidation();
    });
};

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isApproveBtnLoading.value = true;
        emailError.value = '';
        contactError.value = '';

        try {
            const res = await $api('/addManger', {
                method: 'POST',
                body: {
                    staff_name: name.value,
                    email: email.value,
                    password: password.value,
                    password_confirmation: confirmPassword.value,
                    contact_no: contact.value,
                    gender: gender.value,
                    group_id: selectedGroup.value,
                    role_id: selectedRole.value,
                    team_id: selectedTeam.value
                },
                onResponseError({ response }) {
                    console.log('Error Response:', response); // Add this line
                    if (response.status === 422) {
                        const errors = response._data.errors || {};
                        emailError.value = errors.email ? errors.email[0] : '';
                        contactError.value = errors.contact_no ? errors.contact_no[0] : '';
                        isApproveBtnLoading.value = false;
                        return; // Prevent further error handling
                    }
                    // Handle other errors
                    errorTitle.value = 'Something Went Wrong!';
                    errorMessage.value = response._data?.message || 'Unknown error';
                    isErrorDialogVisible.value = true;
                    isApproveBtnLoading.value = false;
                }
            });

            if (res) {
                successTitle.value = 'Success!';
                successMessage.value = 'Staff Created Successfully!';
                isSuccessDialogVisible.value = true;
            }
        } catch (error) {
            // Handle exceptions
            console.log('Exception Error:', error); // Add this line
            errorTitle.value = 'Something Went Wrong!';
            errorMessage.value = error.data?.message || 'Unknown error';
            isErrorDialogVisible.value = true;
            isApproveBtnLoading.value = false;
        }
    }
};


const handlePageReload = async (confirmed) => {
    window.location.reload();
};

function handleAddTeamSubmit() {
    isMandotoryFilled.value = true;
    isConfirmDialogVisible.value = true;
}
</script>

<template>
    <VNavigationDrawer temporary :width="400" location="end" class="scrollable-content"
        :model-value="props.isDrawerOpen" @update:model-value="handleDrawerModelValueUpdate">
        <AppDrawerHeaderSection title="Add New Staff" @cancel="closeNavigationDrawer" />

        <VDivider />

        <PerfectScrollbar :options="{ wheelPropagation: false }">
            <VCard flat>
                <VCardText>
                    <VRow>
                        <VCol cols="12">
                            <AppTextField v-model="name" :rules="[rules.required]" label="Full Name"
                                placeholder="Enter your full name" />
                        </VCol>

                        <VCol cols="12">
                            <AppTextField v-model="email" :rules="[rules.required, rules.email]"
                                :error-messages="emailError" label="Email" placeholder="Enter your email id" />
                        </VCol>

                        <VCol cols="12">
                            <AppTextField v-model="contact" type="number" :rules="[rules.required]"
                                :error-messages="contactError" label="Contact" placeholder="Enter contact number" />
                        </VCol>

                        <VCol cols="12" sm="12">
                            <AppTextField v-model="password"
                                :rules="[rules.required, rules.min, rules.capital, rules.small, rules.special]"
                                :append-inner-icon="show1 ? 'tabler-eye-off' : 'tabler-eye'"
                                :type="show1 ? 'text' : 'password'" name="input-10-2" placeholder="············"
                                label="Enter Password" hint="At least 8 characters"
                                @click:append-inner="show1 = !show1" />
                        </VCol>

                        <VCol cols="12" sm="12">
                            <AppTextField v-model="confirmPassword"
                                :rules="[rules.required, rules.min, rules.capital, rules.small, rules.special]"
                                :append-inner-icon="show2 ? 'tabler-eye-off' : 'tabler-eye'"
                                :type="show2 ? 'text' : 'password'" name="input-10-2" placeholder="············"
                                label="Confirm Password" @click:append-inner="show2 = !show2" />
                        </VCol>

                        <VCol cols="12">
                            <AppSelect v-model="gender" :items="genderOptions" item-title="text" item-value="value"
                                label="Gender" single-line />
                        </VCol>

                        <VCol v-if="teamsList" cols="12">
                            <AppSelect label="Select Staff Teams" v-model="selectedTeam" placeholder="Team"
                                :items="teamsList" clearable clear-icon="tabler-x" />
                        </VCol>

                        <VCol v-if="rolesList" cols="12">
                            <AppSelect label="Select Roles" v-model="selectedRole" placeholder="Role" :items="rolesList"
                                clearable clear-icon="tabler-x" />
                        </VCol>

                        <VCol v-if="groupsList" cols="12">
                            <AppSelect label="Select Permission Group" v-model="selectedGroup" placeholder="Group"
                                :items="groupsList" clearable clear-icon="tabler-x" />
                        </VCol>

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
                    confirmation-question="Are you sure you want to add this staff?" cancel-title="Cancelled"
                    confirm-title="Confirmed!" />

                <VDialog v-model="isSuccessDialogVisible" max-width="500">
                    <VCard>
                        <VCardText class="text-center px-10 py-6">
                            <VBtn icon variant="outlined" color="success" class="my-4"
                                style="block-size: 88px; inline-size: 88px; pointer-events: none;">
                                <VIcon icon="tabler-check" size="38" />
                            </VBtn>
                            <h1 class="text-h4 mb-4">{{ successTitle }}</h1>
                            <p>{{ successMessage }}</p>
                            <VBtn color="success" @click="handlePageReload()">OK</VBtn>
                        </VCardText>
                    </VCard>
                </VDialog>

                <VDialog v-model="isErrorDialogVisible" max-width="500">
                    <VCard>
                        <VCardText class="text-center px-10 py-6">
                            <VBtn icon variant="outlined" color="error" class="my-4"
                                style="block-size: 88px; inline-size: 88px; pointer-events: none;">
                                <span class="text-5xl font-weight-light">X</span>
                            </VBtn>
                            <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
                            <p>{{ errorMessage }}</p>
                            <VBtn color="success" @click="handlePageReload">Ok</VBtn>
                        </VCardText>
                    </VCard>
                </VDialog>
            </VCard>
        </PerfectScrollbar>
    </VNavigationDrawer>
</template>
