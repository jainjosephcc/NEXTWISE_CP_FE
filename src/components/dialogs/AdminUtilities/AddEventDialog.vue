<script setup>
import AppTextarea from '@/@core/components/app-form-elements/AppTextarea.vue';
import { ref } from 'vue';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

// Form data and dialog state management
const show1 = ref(false);
const show2 = ref(false);
const refForm = ref();

const Etitle = ref('');  // Updated from Ename to Etitle
const Edescription = ref('');
const Epriority = ref(null);
const Etype = ref(null);
const EDate = ref(null);
const Elocation = ref(null);
const isShowTitleValidation = ref(false);
const isShowLocationValidation = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const isApproveBtnLoading = ref(false);
const isApproveBtnDisable = ref(false)
const isConfirmDialogVisible = ref(false);
const successTitle = ref('');
const successMessage = ref('');
const errorTitle = ref('');
const errorMessage = ref('');
const isMandotoryFilled = ref(null)
const isTitleMandatory = ref(false);
const isPriorityMandatory = ref(false);
const isTypeMandatory = ref(false);
const isDateMandatory = ref(false);

// Options for select inputs
const priorityOptions = [
    { text: 'Low', value: 'LOW' },  // Changed values to uppercase
    { text: 'Medium', value: 'MEDIUM' },
    { text: 'High', value: 'HIGH' },
];

const typeOptions = [
    { text: 'Global', value: 'GLOBAL' },  // Changed values to uppercase
    { text: 'Personal', value: 'PERSONAL' },
];

// Props and events for drawer control
const props = defineProps({
    isDrawerOpen: {
        type: Boolean,
        required: true
    },
});

const emit = defineEmits([
    'update:isDrawerOpen',
    'userData'
]);



// Function to handle drawer visibility updates
const handleDrawerModelValueUpdate = (val) => {
    emit('update:isDrawerOpen', val);
};

// Close drawer and reset form
const closeNavigationDrawer = () => {
    emit('update:isDrawerOpen', false);
};

// Handle the form confirmation
const handleConfirm = async (confirmed) => {
    if (confirmed) {

        isApproveBtnLoading.value = true;
        isApproveBtnDisable.value = true;
        try {
            const res = await $api('schedule/add', {
                method: 'POST',
                body: {
                    title: Etitle.value,  // Changed from name to title
                    short_description: Edescription.value,
                    priority: Epriority.value,
                    type: Etype.value,
                    date: EDate.value,
                    location: Elocation.value,
                },
                onResponseError({ response }) {
                    console.log("Error response:", response);
                    errorTitle.value = 'Something Went Wrong!';
                    errorMessage.value = response._data?.message || 'Error occurred';
                    isApproveBtnLoading.value = false;
                    isApproveBtnDisable.value = false;
                    isErrorDialogVisible.value = true;
                },
            });
            console.log("API response:", res);

            if (res) {
                successTitle.value = 'Success!';
                successMessage.value = 'Event added successfully!';
                isApproveBtnLoading.value = false;
                isApproveBtnDisable.value = false;
                isSuccessDialogVisible.value = true;
            }
        } catch (Ex) {
            console.log("API error:", Ex);
            errorTitle.value = 'Something Went Wrong!';
            errorMessage.value = Ex.response?.data?.message || Ex.message;
            isApproveBtnLoading.value = false;
            isApproveBtnDisable.value = false;
            isErrorDialogVisible.value = true;
        }
    }
};
watch([Etitle, Elocation], ([newTitle, newLocation]) => {
    // Title validation
    if (newTitle.length >= 255) {
        isShowTitleValidation.value = true;
    } else {
        isShowTitleValidation.value = false;
    }

    // Location validation
    if (newLocation.length >= 255) {
        isShowLocationValidation.value = true;
    } else {
        isShowLocationValidation.value = false;
    }
}, { deep: true, immediate: false });

function handleAddEventSubmit() {
    // Reset validation flags
    isTitleMandatory.value = false;
    isPriorityMandatory.value = false;
    isTypeMandatory.value = false;
    isDateMandatory.value = false;

    // Check each field and show validation message
    if (!Etitle.value) {
        isTitleMandatory.value = true;
    }
    if (!Epriority.value) {
        isPriorityMandatory.value = true;
    }
    if (!Etype.value) {
        isTypeMandatory.value = true;
    }
    if (!EDate.value) {
        isDateMandatory.value = true;
    }

    // If all fields are filled, show confirmation dialog
    if (Etitle.value && Epriority.value && Etype.value && EDate.value) {
        isMandotoryFilled.value = true;
        isConfirmDialogVisible.value = true;
    } else {
        isMandotoryFilled.value = false;
    }
}

// Reload page after success
const handlePageReload = () => {
    window.location.reload();
};

</script>

<template>
    <VNavigationDrawer temporary :width="400" location="end" class="scrollable-content"
        :model-value="props.isDrawerOpen" @update:model-value="handleDrawerModelValueUpdate">
        <AppDrawerHeaderSection title="Add New Event" @cancel="closeNavigationDrawer" />
        <VDivider />
        <PerfectScrollbar :options="{ wheelPropagation: false }">
            <VCard flat>
                <VCardText>
                    <VRow>
                        <!-- Event Title -->
                        <VCol cols="12">
                            <AppTextField v-model="Etitle" label="Event Title" placeholder="Enter event title" />
                            <span v-if="isShowTitleValidation" class="text-error" style="font-size:12px">Only 255
                                characters are allowed</span>
                            <span v-if="isTitleMandatory" class="text-error" style="font-size:12px">
                                Event title is mandatory
                            </span>
                        </VCol>
                        <!-- Event Description -->
                        <VCol cols="12">
                            <AppTextarea v-model="Edescription" label="Description"
                                placeholder="Enter short description" />
                        </VCol>
                        <!-- Event Priority -->
                        <VCol cols="12">
                            <AppSelect v-model="Epriority" :items="priorityOptions" item-title="text" item-value="value"
                                label="Priority" single-line />
                            <span v-if="isPriorityMandatory" class="text-error" style="font-size:12px">
                                Event priority is mandatory
                            </span>
                        </VCol>
                        <!-- Event Type -->
                        <VCol cols="12">
                            <AppSelect v-model="Etype" :items="typeOptions" item-title="text" item-value="value"
                                label="Type" single-line />
                            <span v-if="isTypeMandatory" class="text-error" style="font-size:12px">
                                Event type is mandatory
                            </span>
                        </VCol>
                        <!-- Event Date -->
                        <VCol cols="12">
                            <AppTextField v-model="EDate" label="Date" placeholder="Enter event date" type="date" />
                            <span v-if="isDateMandatory" class="text-error" style="font-size:12px">
                                Event date is mandatory
                            </span>
                        </VCol>
                        <!-- Event Location -->
                        <VCol cols="12">
                            <AppTextField v-model="Elocation" label="Location" placeholder="Enter event location" />
                            <span v-if="isShowLocationValidation" class="text-error" style="font-size:12px">Only 255
                                characters are allowed</span>
                        </VCol>

                        <!-- Submit and Cancel Buttons -->
                        <VCol cols="12">
                            <VBtn class="me-3" @click="handleAddEventSubmit()" :loading="isApproveBtnLoading"
                                :disabled="isApproveBtnDisable">
                                Add
                            </VBtn>
                            <VBtn type="reset" variant="tonal" color="error" @click="closeNavigationDrawer">
                                Cancel
                            </VBtn>
                        </VCol>
                    </VRow>
                </VCardText>

                <!-- Confirm Dialog -->
                <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
                    confirmation-question="Are you sure you want to add this event?" cancel-title="Cancelled"
                    confirm-title="Confirmed!" />

                <!-- Success Dialog -->
                <VDialog v-model="isSuccessDialogVisible" max-width="500">
                    <VCard>
                        <VCardText class="text-center px-10 py-6">
                            <VBtn icon variant="outlined" color="success" class="my-4"
                                style="block-size: 88px; inline-size: 88px; pointer-events: none;">
                                <VIcon icon="tabler-check" size="38" />
                            </VBtn>
                            <h1 class="text-h4 mb-4">{{ successTitle }}</h1>
                            <p>{{ successMessage }}</p>
                            <VBtn color="success" @click="handlePageReload">OK</VBtn>
                        </VCardText>
                    </VCard>
                </VDialog>

                <!-- Error Dialog -->
                <VDialog v-model="isErrorDialogVisible" max-width="500">
                    <VCard>
                        <VCardText class="text-center px-10 py-6">
                            <VBtn icon variant="outlined" color="error" class="my-4"
                                style="block-size: 88px; inline-size: 88px; pointer-events: none;">
                                <span class="text-5xl font-weight-light">X</span>
                            </VBtn>
                            <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
                            <p>{{ errorMessage }}</p>
                            <VBtn color="error" @click="isErrorDialogVisible = false">OK</VBtn>
                        </VCardText>
                    </VCard>
                </VDialog>
            </VCard>
        </PerfectScrollbar>
    </VNavigationDrawer>
</template>
