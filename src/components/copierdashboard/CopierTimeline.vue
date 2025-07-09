<template>
    <VCard class="pa-4 tree-card">
        <VCardText>
            <!-- Root Node (Master Account) -->
            <VRow justify="center" class="mb-4">
                <VCol cols="12" md="4" class="text-center">
                    <VCard outlined class="pa-4 card-master">
                        <VAvatar size="80" color="grey lighten-4" class="mb-4">
                            <VIcon large>mdi-account-circle</VIcon>
                        </VAvatar>
                        <h3 class="text-h5 mb-1">Tessa Miller</h3>
                        <p class="text-subtitle-2 grey--text">CFO</p>
                        <p class="text-body-2">Email: tessa.miller@company.com</p>
                    </VCard>
                </VCol>
            </VRow>

            <!-- Connecting Line from Root to Horizontal Line for Child Nodes -->
            <div class="vertical-line-root"></div>
            <div class="horizontal-line"></div>

            <!-- Child Nodes (Slave Accounts) -->
            <VRow justify="space-around" class="mt-4 position-relative">
                <VCol cols="12" md="3" class="text-center">
                    <VCard outlined class="pa-3 card-child">
                        <VAvatar size="64" color="grey lighten-4" class="mb-4">
                            <VIcon large>mdi-account-circle</VIcon>
                        </VAvatar>
                        <h3 class="text-h6 mb-1">Edward Morrison</h3>
                        <p class="text-subtitle-2 grey--text">Brand Manager</p>
                        <p class="text-body-2">Email: edward.morrison@company.com</p>
                        <div class="vertical-line-child"></div>
                        <div class="arrow-down"></div>
                    </VCard>
                </VCol>

                <VCol cols="12" md="3" class="text-center">
                    <VCard outlined class="pa-3 card-child">
                        <VAvatar size="64" color="grey lighten-4" class="mb-4">
                            <VIcon large>mdi-account-circle</VIcon>
                        </VAvatar>
                        <h3 class="text-h6 mb-1">Evan Valet</h3>
                        <p class="text-subtitle-2 grey--text">HR Director</p>
                        <p class="text-body-2">Email: evan.valet@company.com</p>
                        <div class="vertical-line-child"></div>
                        <div class="arrow-down"></div>
                    </VCard>
                </VCol>

                <VCol cols="12" md="3" class="text-center">
                    <VCard outlined class="pa-3 card-child">
                        <VAvatar size="64" color="grey lighten-4" class="mb-4">
                            <VIcon large>mdi-account-circle</VIcon>
                        </VAvatar>
                        <h3 class="text-h6 mb-1">Alison Donovan</h3>
                        <p class="text-subtitle-2 grey--text">System Admin</p>
                        <p class="text-body-2">Email: alison.donovan@company.com</p>
                        <div class="vertical-line-child"></div>
                        <div class="arrow-down"></div>
                    </VCard>
                </VCol>
            </VRow>
        </VCardText>
    </VCard>
</template>

<script setup>
import { VAvatar, VCard, VCardText, VCol, VIcon, VRow } from 'vuetify/components';
</script>

<style scoped>
/* Root node vertical line */
.vertical-line-root {
    width: 2px;
    height: 30px;
    /* Reduced height */
    background-color: black;
    margin: 0 auto;
}

/* Horizontal line connecting to child nodes */
.horizontal-line {
    width: 60%;
    height: 2px;
    background-color: black;
    margin: 0 auto;
    position: relative;
}

/* Vertical lines for each child node */
.vertical-line-child {
    width: 2px;
    height: 30px;
    /* Reduced height */
    background-color: black;
    position: absolute;
    bottom: 70px;
    /* Adjust the bottom position to align with the card */
}

/* Arrows pointing downwards from the child nodes */
.arrow-down {
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid black;
    /* Change to the desired arrow color */
    position: absolute;
    left: 50%;
    /* Center it under the column */
    transform: translateX(-50%);
    /* Adjust to center properly */
    bottom: 60px;
    /* Adjust to align with the child cards */
}

/* Card size adjustments */
.card-master {
    max-width: 250px;
    /* Reduced size of the master card */
}

.card-child {
    max-width: 200px;
    /* Reduced size of child cards */
}

/* Position adjustments for vertical lines */
.vertical-line-child:nth-child(1) {
    left: calc(25% - 1px);
    /* Adjust position based on card width */
}

.vertical-line-child:nth-child(2) {
    left: calc(50% - 1px);
    /* Adjust position based on card width */
}

.vertical-line-child:nth-child(3) {
    left: calc(75% - 1px);
    /* Adjust position based on card width */
}
</style>
