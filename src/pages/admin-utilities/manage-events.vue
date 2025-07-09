<script setup>
import { onMounted, ref } from 'vue';

const isAddEventDrawerVisible = ref(false); // Drawer visibility
const isEditEventModal = ref(false); // Edit tip modal visibility
const isDeleteConfirmDialog = ref(false)
const eventlist = ref([]); // Event list data
const error = ref(null); // Error handling
const selectedEvent = ref(null)
const eventId = ref(null)
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');
const successTitle = ref('');
const successMessage = ref('');
const fetchEventList = async () => {
  try {
    const res = await $api('schedule/list', {
      method: 'GET',
    });
    if (res) {
      eventlist.value = res.data;
    }
  } catch (err) {
    console.error('Error fetching event list:', err);
    error.value = err;
  }
};

// Function to show the edit modal
function showEditModal(event) {
  console.log('Editing event:', event);
  selectedEvent.value = event;
  isEditEventModal.value = true;
}

// Function to show the add event modal
function showAddEventModal() {
  isAddEventDrawerVisible.value = true;
}

function handleDelete(event) {
  eventId.value = event.id
  isDeleteConfirmDialog.value = true

}
const handleConfirm = async (confirmed) => {
  if (confirmed) {
    try {
      const res = await $api('schedule/delete', {
        method: 'POST',
        body: {
          id: eventId.value,
        },
        onResponseError({ response }) {
          errorTitle.value = 'Something Went Wrong!';
          errorMessage.value = response._data.message;
          isErrorDialogVisible.value = true;
        },
      });
      if (res) {
        successTitle.value = 'Deleted!';
        successMessage.value = 'Event Deleted Successfully!';
        isSuccessDialogVisible.value = true;
      }
    } catch (Ex) {
      errorTitle.value = 'Something Went Wrong!';
      errorMessage.value = Ex.data.message;
      isErrorDialogVisible.value = true;
    }
  }
};
const handlePageReload = async (confirmed) => {
  window.location.reload()
}

// Optionally, fetch data or perform setup operations when the component is mounted
onMounted(async () => {
  await fetchEventList();
});
</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <VCol cols="12">
          <VCard>
            <VCardText>
              <div class="d-flex align-center justify-space-between">
                <VCardTitle>
                  Manage Events
                </VCardTitle>
                <div v-if="hasAccess('add_staff')">
                  <VBtn class="me-2" @click="showAddEventModal">Add Event</VBtn>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <VCard class="mb-6">
      <VRow>
        <VCol cols="12">
          <VCard>
            <VTable height="800" fixed-header class="text-no-wrap">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TITLE</th>
                  <th>DESCRIPTION</th>
                  <th>PRIORITY</th>
                  <th>TYPE</th>
                  <th>DATE</th>
                  <th>LOCATION</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in eventlist" :key="event.id">
                  <td>{{ event.id }}</td>
                  <td>{{ event.title }}</td>
                  <td class="tip-text">{{ event.short_description }}</td>
                  <td>
                    <VChip v-if="event.priority === 'HIGH'" color="error" :label="false"> {{ event.priority }}</VChip>
                    <VChip v-if="event.priority === 'LOW'" color="info" :label="false"> {{ event.priority }}</VChip>
                    <VChip v-if="event.priority === 'MEDIUM'" color="warning" :label="false"> {{ event.priority }}
                    </VChip>



                  </td>
                  <td>
                    <VChip v-if="event.type === 'GLOBAL'" color="primary" label size="small" variant="outlined">{{
                      event.type }}</VChip>
                    <VChip v-if="event.type === 'PERSONAL'" color="info" label size="small" variant="outlined">{{
                      event.type }}</VChip>

                  </td>
                  <td>{{ event.date }}</td>
                  <td>{{ event.location }}</td>
                  <td>
                    <VIcon icon="tabler-edit" class="me-2" @click="showEditModal(event)" />
                    <VIcon icon="tabler-trash" @click="handleDelete(event)" />
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCard>
        </VCol>
      </VRow>
    </VCard>
  </section>

  <!-- Edit Tip Dialog -->
  <EditEventDialog v-model:isDialogVisible="isEditEventModal" :selectedEvent="selectedEvent" />

  <!-- Add Event Drawer -->
  <AddEventDialog v-model:isDrawerOpen="isAddEventDrawerVisible" />
  <ConfirmDialog v-model:isDialogVisible="isDeleteConfirmDialog" @confirm="handleConfirm"
    confirmation-question="Are you sure you want to delete this event?" cancel-title="Cancelled"
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
          style=" block-size: 88px; inline-size: 88px; pointer-events: none;">
          <span class="text-5xl font-weight-light">X</span>
        </VBtn>
        <h1 class="text-h4 mb-4">{{ errorTitle }}</h1>
        <p>{{ errorMessage }}</p>
        <VBtn color="success" @click="handlePageReload">
          Ok
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
<style>
.tip-text {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
