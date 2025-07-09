<script setup>
import { ref } from 'vue';


// State to control the visibility of the modal
const isOrderStatusUpdatesDialogVisible = ref(false);

// Method to show the modal
function showDetails() {
    isOrderStatusUpdatesDialogVisible.value = true;
}
</script>

<template>
    <VCard class="pa-6 pa-sm-12">
        <!-- SECTION Header -->
        <div
            class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
            <!-- 👉 Left Content -->
            <div>
                <div class="d-flex align-center app-logo mb-6">
                    <!-- 👉 Logo -->
                    <VImg src="/images/avatars/avatar-0.webp" size="10" style="width: 5px; padding: 5px;" />
                </div>
                <div class="mt-8 mr-10">
                    Legal Registration No:987654<br>
                    Email:bitrage.com<br>
                    Website: www.bitrage.com<br>
                    Contact No: +(01) 234 6789<br>
                </div>
            </div>
            <!-- 👉 Right Content -->
            <div class="d-flex flex-column gap-2">
                <!-- 👉 Invoice Id -->
                <div
                    class="d-flex align-start align-sm-center gap-x-4 font-weight-medium text-lg flex-column flex-sm-row">
                    <span class="text-high-emphasis text-sm-end" style="inline-size: 5.625rem ;">Invoice:</span>
                    <span>
                        <AppTextField placeholder="1002" disabled prefix="#" style="inline-size: 9.5rem;" />
                    </span>
                </div>
                <!-- 👉 Issue Date -->
                <div class="d-flex gap-x-4 align-start align-sm-center flex-column flex-sm-row">
                    <span class="text-high-emphasis text-sm-end" style="inline-size: 5.625rem;">Date Issued:</span>

                    <span style="inline-size: 9.5rem;">
                        <AppDateTimePicker placeholder="1 August 2024" :config="{ position: 'auto right' }" />
                    </span>
                </div>

                <!-- 👉 Due Date -->
                <div class="d-flex gap-x-4 align-start align-sm-center flex-column flex-sm-row">
                    <span class="text-high-emphasis text-sm-end" style="inline-size: 5.625rem;">Due Date:</span>
                    <span style="min-inline-size: 9.5rem;">
                        <AppDateTimePicker placeholder="11 August 2024" :config="{ position: 'auto right' }" />
                    </span>
                </div>
            </div>
        </div>
        <VRow class="mx-5 my-5">
            <VCol cols="3">
                ORDER ID<br>
                #10001
            </VCol>
            <VCol cols="3">
                DATE<br>
                01 August 2024
            </VCol>
            <VCol cols="3">
                PAYMENT STATUS<br>
                Paid
            </VCol>
            <VCol cols="3">
                TOTAL AMOUNT<br>
                $ 1000
            </VCol>
        </VRow>
        <VDivider class="my-3" />
        <VRow class="mx-5 my-5">
            <VCol cols="6">
                BILLING ADDRESS<br><br>
                Dinken<br>
                305 S Dinken Blvd<br>
                Phone: +(123) 456-7890<br>
                Tax: 12-3456789<br>
            </VCol>
            <VCol cols="6">
                SHIPPING ADDRESS<br><br>
                Dinken<br>
                305 S Dinken Blvd<br>
                Phone: +(123) 456-7890<br>
                Tax: 12-3456789<br>
            </VCol>
        </VRow>
        <VRow>
            <VCol class="12">
                <VTable height="200" class="text-no-wrap">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>PRODUCT IMAGE</th>
                            <th>PRODUCT DETAILS</th>
                            <th>SIZE</th>
                            <th>RATE</th>
                            <th>QUANTITY</th>
                            <th>AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="text-caption me-0 ms-0" style="padding-left: 2px;">#001</td>
                            <td></td>
                            <td>Sweatshirt for Men (Pink) Graphic Print Men & Women Sweatshirt</td>
                            <td>Large</td>
                            <td>$ 119.99</td>
                            <td>02</td>
                            <td>$ 239.98</td>
                        </tr>
                    </tbody>
                </VTable>
            </VCol>
        </VRow>
        <VDivider class="my-3" />
        <VRow>
            <VCol cols="6"></VCol>
            <VCol cols="6">
                <VTable height="800" class="text-no-wrap">
                    <tr>
                        <td>Sub Total :</td>
                        <td>$699.96</td>
                    </tr>
                    <tr>
                        <td>Estimated Tax (12.5%) :</td>
                        <td>$44.99</td>
                    </tr>
                    <tr>
                        <td>Discount (VELZON15) :</td>
                        <td>-$53.99</td>
                    </tr>
                    <tr>
                        <td>Shipping Charge :</td>
                        <td>$65.00</td>
                    </tr>
                    <tr>
                        <td>
                            <h4>Total Amount :</h4>
                        </td>
                        <td>
                            <h4>$755.96</h4>
                        </td>
                    </tr>
                    <VBtn class="me-2 mt-6">
                        <VIcon icon="tabler-printer" class="me-2" />Print
                    </VBtn>
                    <VBtn class="me-2 mt-6">
                        <VIcon icon="tabler-arrow-bar-to-down" class="me-2" />Download
                    </VBtn>
                    <VBtn class="me-2 mt-6" @click="showDetails">
                        <VIcon icon="tabler-pencil" class="me-2" />Process Order
                    </VBtn>
                </VTable>

            </VCol>
        </VRow>
    </VCard>

    <!-- Modal component -->
    <ProcessOrderStatusDialog v-model:isDialogVisible="isOrderStatusUpdatesDialogVisible" />
</template>
