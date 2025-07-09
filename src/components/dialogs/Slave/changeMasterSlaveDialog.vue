<script setup>
import { ref } from "vue";

const selectedIndex = ref(0);

const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    masterList: {
        type: Object,
        required: false,
    },
})
const closeDialog = () => {
    emit('update:isDialogVisible', false);
}

const emit = defineEmits([
    'submit',
    'update:isDialogVisible',
])

const dialogModelValueUpdate = (val) => {
    emit('update:isDialogVisible', val);
}



function changeServer() {
    emit('masterChanged', props.masterList[selectedIndex.value].id);
    dialogModelValueUpdate()


}




</script>
<template>
    <section>
        <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 650" :model-value="props.isDialogVisible"
            @update:model-value="dialogModelValueUpdate">

            <!-- Dialog close btn -->
            <DialogCloseBtn @click="dialogModelValueUpdate(false)" />
            <VCard>
                <div class="sticky-card">
                    <VCardTitle class="pt-3 ">Change Master </VCardTitle>
                    <VDivider />
                </div>
                <VCardSubtitle class="pt-5 pb-5">Select Master</VCardSubtitle>
                <div v-if="masterList" class="pa-3 pa-sm-4">
                    <VRow>
                        <VCol v-for="(data, index) in masterList" :key="data.id" cols="12" sm="4" md="4">
                            <VCard class="d-flex flex-column justify-center align-center cursor-pointer rounded px-1"
                                :class="selectedIndex === index ? 'border' : 'border border-dashed'"
                                :style="selectedIndex === index ? 'border-color: rgb(var(--v-theme-primary)) !important' : ''"
                                @click="selectedIndex = index">
                                <VCardTitle class="text-center">
                                    <h6 class="text-base font-weight-medium">
                                        {{ data.mc_name }}
                                    </h6>
                                </VCardTitle>
                            </VCard>
                        </VCol>
                    </VRow>
                </div>

                <VSkeletonLoader v-else v-for="i in 3" :key="i" type="list-item-two-line" />
                <VCardText class="d-flex justify-end flex-wrap gap-3">
                    <VBtn variant="tonal" color="secondary" @click="dialogModelValueUpdate(false)">
                        Close
                    </VBtn>
                    <VBtn color="primary" @click="changeServer()">
                        Change Master
                    </VBtn>
                </VCardText>

            </VCard>
        </VDialog>

    </section>
</template>
<style scoped>
.sticky-card {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1000;
    /* background-color: white; */
}
</style>
