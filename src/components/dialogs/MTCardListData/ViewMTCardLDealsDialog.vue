<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

const refForm = ref();
const Mtcard_deals = ref([]);
const page = ref(1); // Initialize page as 1
const totalPages = ref(1); // Define total pages to handle pagination

const props = defineProps({
    isDrawerOpen: {
        type: Boolean,
        required: true,
    },
    mt_id: {
        type: [Number, null],  // Allow null as a valid type
        required: true,
        // default: 0,
    },
    clientId: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits([
    'update:isDrawerOpen',
    'userData',
]);

const handleDrawerModelValueUpdate = (val) => {
    emit('update:isDrawerOpen', val);
};

// Function to get MT card details
const fetchMtcardDeals = async (mt_id, page) => {
    if (!mt_id) {
        console.error('mt_id is null or undefined');
        return;
    }

    try {
        const res = await $api(`/getClientMt5Deals/${mt_id}/${page}`, {
            method: 'GET'
        });

        if (res && Array.isArray(res.deals)) {
            Mtcard_deals.value = res.deals;
            totalPages.value = res.page_count || 1; // Set totalPages based on the API response
        } else {
            console.error('Failed to fetch deal list or empty response');
        }
    } catch (err) {
        console.error('Error fetching deal list:', err);
    }
};

onMounted(() => {
    if (props.mt_id) {
        fetchMtcardDeals(props.mt_id, page.value);
    } else {
        //console.error('mt_id is not valid on mount');
    }
});

watch(() => props.mt_id, (newMtId) => {
    if (newMtId) {
        fetchMtcardDeals(newMtId, page.value);
    }
});

watch(page, (newPage) => {
    if (props.mt_id) {
        fetchMtcardDeals(props.mt_id, newPage);
    }
});

const closeNavigationDrawer = () => {
    emit('update:isDrawerOpen', false);
    nextTick(() => {
        refForm.value?.reset();
        refForm.value?.resetValidation();
    });
};

// Placeholder for the date formatting function
const formatDateToMonthShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
</script>

<template>
    <VNavigationDrawer temporary :width="400" location="end" class="scrollable-content"
        :model-value="props.isDrawerOpen" @update:model-value="handleDrawerModelValueUpdate">
        <AppDrawerHeaderSection title=" MT5 Deal Details " text-align="center" @cancel="closeNavigationDrawer" />
        <p style="font-weight: bold; text-align: center;">Login: {{ props.mt_id }}</p>

        <VDivider />

        <PerfectScrollbar :options="{ wheelPropagation: false }">
            <VCard>
                <!-- Show table if there are deals and not loading -->
                <VTable v-if="Mtcard_deals.length" height="800" class="text-no-wrap">
                    <thead>
                        <tr>

                            <th>DATE</th>
                            <th>ORDER</th>
                            <th>SYMBOL</th>
                            <th>PRICE</th>
                            <th>PROFIT</th>
                            <th>EXP.POS.</th>
                            <th>COMMENT</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="deal in Mtcard_deals" :key="deal.order">
                            <!---<td>{{ deal.login }}</td> -->
                            <td>{{ formatDateToMonthShort(deal.time) }}</td>
                            <td>{{ deal.order }}</td>
                            <td>{{ deal.symbol }}</td>
                            <td>{{ deal.price }}</td>
                            <td>{{ deal.profit }}</td>
                            <td>{{ deal.ex_position }}</td>
                            <td>{{ deal.comment }}</td>
                            <td>{{ deal.action }}</td>
                        </tr>
                    </tbody>
                </VTable>

                <!-- Show message if no deals and not loading -->
                <div v-else>
                    <p>No deals available</p>
                </div>

                <VCardText class="pt-2">
                    <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">
                        <VPagination v-model="page" :length="totalPages"
                            :total-visible="$vuetify.display.smAndDown ? 3 : 5" />
                    </div>
                </VCardText>
            </VCard>
        </PerfectScrollbar>
    </VNavigationDrawer>
</template>
