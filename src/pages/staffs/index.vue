<script setup>

import { computed, onMounted, ref, watch } from "vue"


</script>

<template>
    <section>


        <div class="d-flex mb-6">
            <VRow>
                <VCol cols="12">
                    <VCard>
                        <VCardText>
                            <div class="d-flex align-center justify-space-between">
                                <div>
                                    <VCardTitle>
                                        Staff List
                                    </VCardTitle>
                                </div>
                                <div v-if="hasAccess('add_staff')">
                                    <VBtn class="me-2" @click="showAddStaffModal()"> Add Staff</VBtn>
                                </div>
                            </div>
                        </VCardText>
                    </VCard>
                </VCol>
            </VRow>
        </div>
    </section>
</template>

<style scoped lang="scss"></style>
