<script setup>
import { ref } from "vue";

// Props
const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    selectedEvent: {
        type: Object,
        required: false,
    },
});

const emit = defineEmits([
    'submit',
    'update:isDialogVisible',
]);
// Options for select inputs
const priorityOptions = [
    { text: 'Low', value: 'LOW' },
    { text: 'Medium', value: 'MEDIUM' },
    { text: 'High', value: 'HIGH' },
];

const typeOptions = [
    { text: 'Global', value: 'GLOBAL' },
    { text: 'Personal', value: 'PERSONAL' },
];

// Modal states
const isConfirmDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isShowTitleValidation = ref(false);
const isShowLocationValidation = ref(false);
// Button state
const isSubmitBtnLoading = ref(false);
const isSubmitBtnDisable = ref(false);

// Error and success messages
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');

// Form state
const Eid = ref(null);
const Etitle = ref('');
const Edescription = ref('');
const Epriority = ref(null);
const Etype = ref(null);
const EDate = ref(null);
const Elocation = ref('');

// Watch for changes in selectedEvent prop
watch(() => props.selectedEvent, (newEvent) => {
    if (newEvent) {
        Eid.value = newEvent.id;
        Etitle.value = newEvent.title || '';
        Edescription.value = newEvent.short_description || '';
        Epriority.value = newEvent.priority || '';
        Etype.value = newEvent.type || '';
        EDate.value = newEvent.date || '';  // Assuming date is in the correct format
        Elocation.value = newEvent.location || '';  // Fixed undefined `location`
    }
}, { immediate: true });

const dialogModelValueUpdate = (val) => {
    emit('update:isDialogVisible', val);
};

const handleConfirm = async (confirmed) => {
    if (confirmed) {
        isSubmitBtnLoading.value = true;
        isSubmitBtnDisable.value = true;
        try {
            const res = await $api('schedule/update', {
                method: 'POST',
                body: {
                    id: Eid.value,
                    title: Etitle.value,
                    short_description: Edescription.value,
                    priority: Epriority.value,
                    type: Etype.value,
                    date: EDate.value,
                    location: Elocation.value,
                },
            });
            if (res) {
                successTitle.value = 'Updated!';
                successMessage.value = 'Event data updated successfully!';
                isSubmitBtnLoading.value = false;
                isSubmitBtnDisable.value = false;
                isSuccessDialogVisible.value = true;
            }
        } catch (ex) {
            errorTitle.value = 'Something went wrong!';
            errorMessage.value = ex.data?.message || 'Unknown error occurred.';
            isSubmitBtnLoading.value = false;
            isSubmitBtnDisable.value = false;
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
const updateData = async (confirmed) => {
    window.location.reload();
};

</script>
<template>
    <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
        @update:model-value="dialogModelValueUpdate">
        <!-- Dialog close btn -->
        <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

        <VCard>
            <VCardTitle class="pt-3">Update Event</VCardTitle>
            <VDivider />
            <VCardText>
                <VForm @submit.prevent="() => { }">
                    <VRow>
                        <!-- Event Title -->
                        <VCol cols="12">
                            <AppTextField v-model="Etitle" label="Event Title" />
                            <span v-if="isShowTitleValidation" class="text-error" style="font-size:12px">Only 255
                                characters are allowed</span>

                        </VCol>
                        <!-- Event Description -->
                        <VCol cols="12">
                            <AppTextarea v-model="Edescription" label="Description" />
                        </VCol>
                        <!-- Event Priority -->
                        <VCol cols="12" md="6">
                            <AppSelect v-model="Epriority" :items="priorityOptions" item-title="text" item-value="value"
                                label="Priority" single-line />
                        </VCol>
                        <!-- Event Type -->
                        <VCol cols="12" md="6">
                            <AppSelect v-model="Etype" :items="typeOptions" item-title="text" item-value="value"
                                label="Type" single-line />
                        </VCol>
                        <!-- Event Date -->
                        <VCol cols="12" md="6">
                            <AppTextField v-model="EDate" label="Date" placeholder="Enter event date" type="date" />
                        </VCol>
                        <!-- Event Location -->
                        <VCol cols="12" md="6">
                            <AppTextField v-model="Elocation" label="Location" placeholder="Enter event location" />
                            <span v-if="isShowLocationValidation" class="text-error" style="font-size:12px">Only 255
                                characters are allowed</span>
                        </VCol>
                    </VRow>
                </VForm>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
                <VBtn variant="tonal" color="secondary" @click="dialogModelValueUpdate(false)">
                    Close
                </VBtn>
                <VBtn class="me-2" color="primary" @click="isConfirmDialogVisible = true" :loading="isSubmitBtnLoading"
                    :disabled="isSubmitBtnDisable">
                    Update
                </VBtn>
            </VCardText>
        </VCard>
    </VDialog>

    <ConfirmDialog v-model:isDialogVisible="isConfirmDialogVisible" @confirm="handleConfirm"
        confirmation-question="Are you sure you want to update this Event?" cancel-title="Cancelled"
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
                <VBtn color="success" @click="updateData()">
                    OK
                </VBtn>
            </VCardText>
        </VCard>
    </VDialog>
    <VDialog v-model="isErrorDialogVisible" max-width="500">
        <VCard>
            <VCardText class="text-center px-10 py-6">
                <VBtn icon variant="outlined" color="error" class="my-4"
                    style=" block-size: 88px; inline-size: 88px; pointer-events: none;">
                    <span class="text-5xl font-weight-light">X</span>
                </VBtn>
                <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
                <p>{{ errorMessage }}</p>
                <VBtn color="success" @click="updateData">
                    Ok
                </VBtn>
            </VCardText>
        </VCard>
    </VDialog>
</template>
