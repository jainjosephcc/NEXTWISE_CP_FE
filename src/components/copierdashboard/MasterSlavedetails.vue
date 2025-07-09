<template>
    <VCard>
        <VCardText>
            <div class="d-flex align-center justify-space-between">
                <div class="text-body-1">
                    Master-Slave Overview
                </div>
                <div class="text-success font-weight-medium">

                </div>
            </div>
            <h4 class="text-h4">
                Relationship Overview
            </h4>
        </VCardText>

        <VCardText>
            <VRow no-gutters>
                <VCol cols="5">
                    <div class="py-2">
                        <div class="d-flex align-center mb-3">
                            <VAvatar color="info" variant="tonal" size="38" rounded class="me-2">
                                <VIcon size="30" icon="tabler-user-shield" />
                            </VAvatar>
                            <span>Total Master</span>
                        </div>
                        <h5 class="text-h5">
                            5
                        </h5>
                        <!-- <div class="text-body-2 text-disabled">
                            Slave 1, Slave 2, Slave 3
                        </div> -->
                    </div>
                </VCol>

                <VCol cols="2">
                    <div class="d-flex flex-column align-center justify-center h-100">
                        <VDivider vertical class="mx-auto" />

                        <!-- <VAvatar size="24" color="rgba(var(--v-theme-on-surface), var(--v-hover-opacity))" class="my-2">
                            <div class="text-overline text-disabled">
                                VS
                            </div>
                        </VAvatar> -->

                        <VDivider vertical class="mx-auto" />
                    </div>
                </VCol>

                <VCol cols="5" class="text-end">
                    <div class="py-2">
                        <div class="d-flex align-center justify-end mb-3">
                            <span class="me-2">Total Slave</span>
                            <VAvatar color="primary" variant="tonal" size="38" rounded>
                                <VIcon size="30" icon="tabler-users-group" />
                            </VAvatar>
                        </div>
                        <h5 class="text-h5">
                            10
                        </h5>
                        <div class="text-body-2 text-disabled">
                            <!-- 10 -->
                        </div>
                    </div>
                </VCol>
            </VRow>

            <div class="mt-6">
                <VProgressLinear model-value="50" color="#FF5252" height="10" bg-color="primary" :rounded-bar="false"
                    rounded />
            </div>
        </VCardText>
    </VCard>
</template>

<style scoped>
/* Additional styling can be added if needed */
</style>
