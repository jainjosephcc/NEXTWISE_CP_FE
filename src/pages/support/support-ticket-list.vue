<script setup>
import { onMounted, ref } from 'vue';

const support_tickets = ref([]); // Initialize as an empty array

// Function to fetch data from the API ClientSupportTickets
const fetchClientSupticket = async () => {
    try {
        const res = await $api('/getClientSupportTickets', {
            method: 'POST',
        });
        if (res && res.client_tickets && res.client_tickets.data) {
            support_tickets.value = res.client_tickets.data; // Access the 'data' array from the response
        } else {
            console.warn('Client tickets data not found:', res);
        }
    } catch (err) {
        console.error('Error fetching Support Ticket list:', err);
    }
}


// Calling functions
onMounted(() => {
    fetchClientSupticket();
});

const fetchTicketdetails = async (ticket_id) => {
    try {
        console.log(ticket_id);
        const res = await $api(`/getClientTicketMessages/${ticket_id}`, {
            method: 'GET',
            onResponseError({ response }) {
                console.error('Error response:', response);
            },
        });
        if (res) {
            console.log(res);
        }
    } catch (err) {
        console.error('Error fetching Support Ticket list:', err);
    }
}
</script>

<template>
    <section>
        <!-- 👉 Widgets -->
        <div class="d-flex mb-6">
            <VRow>
                <VCol cols="12">
                    <VCard>
                        <VCardText>
                            Support Ticket
                        </VCardText>
                    </VCard>
                </VCol>
            </VRow>
        </div>
    </section>
    <VCard class="mb-6">
        <VCardText>
            <VRow>
                <!-- 👉 Select ENTITY -->
                <VCol cols="12" sm="2">
                    <AppSelect label="Entity" v-model="selectedEntity" placeholder="Entity" :items="entity_list"
                        clearable clear-icon="tabler-x" />
                </VCol>
                <!-- 👉 Select SUBJECT -->
                <VCol cols="12" sm="2">
                    <AppSelect v-model="selectedSubject" label="Subject" placeholder="Subject" :items="subject_list"
                        clearable clear-icon="tabler-x" />
                </VCol>
                <!-- 👉 Select STATUS -->
                <VCol cols="12" sm="2">
                    <AppSelect v-model="selectedStatus" label="Status" placeholder="Status" :items="status_list"
                        clearable clear-icon="tabler-x" />
                </VCol>

                <!-- 👉 Select Ticket Created From -->
                <VCol cols="12" sm="2">
                    <AppDateTimePicker v-model="selectedFromDate" label="Ticket Created From" placeholder="Select date"
                        clearable clear-icon="tabler-x" />
                </VCol>
                <!-- 👉 Select Ticket Created To -->
                <VCol cols="12" sm="2">
                    <AppDateTimePicker v-model="selectedToDate" label="Ticket Created To" placeholder="Select date"
                        clearable clear-icon="tabler-x" />
                </VCol>
            </VRow>
        </VCardText>

        <VDivider />

    </VCard>
    <VCard class="custom-card">
        <VCardItem>
            <VCardTitle>INBOX</VCardTitle>
            <VCardSubtitle>
                Messages
            </VCardSubtitle>
        </VCardItem>
        <VCardText>
            <VList class="card-list">
                <VListItem v-for="item in support_tickets" :key="item.ticket_id">
                    <!--profile pic-->
                    <template #prepend>
                        <VAvatar rounded size="34" color="secondary" variant="tonal" class="me-1">
                            <VIcon size="22" />
                        </VAvatar>
                    </template>
                    <VListItemTitle class="font-weight-medium me-2">
                        {{ item.client_name }}
                    </VListItemTitle>
                    <VListItemSubtitle class="font-weight-medium me-2">
                        {{ item.email }}
                    </VListItemSubtitle>
                    <template #append>
                        <VAvatar size="38" color="secondary" variant="tonal" class="me-1" rounded>
                            <VChip size="x-small" label="Ticket ID">
                                {{ item.ticket_id }}
                            </VChip>
                        </VAvatar>
                        <span>
                            <VBtn icon="tabler-user-plus" variant="outlined" color="success"
                                @click="fetchTicketdetails(item.ticket_id)" />
                        </span>
                    </template>
                </VListItem>
            </VList>
        </VCardText>
    </VCard>
</template>

<style lang="scss" scoped>
.custom-card {
    max-width: 400px;
    /* Adjust the max width as needed */
}

.card-list {
    --v-card-list-gap: 1.5rem;
}
</style>
