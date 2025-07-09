<script setup>
import { ref } from "vue";

const selectedIndex = ref(0);

const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    serverDetails: {
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
    emit('serverChanged', props.serverDetails[selectedIndex.value].id);
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
                    <VCardTitle class="pt-3 ">Change Server </VCardTitle>
                    <VDivider />
                </div>
                <VCardSubtitle class="pt-5 pb-5">Select Server</VCardSubtitle>
                <div v-if="serverDetails" class="pa-3 pa-sm-4">
                    <VSlideGroup v-model="selectedIndex" show-arrows>
                        <VSlideGroupItem v-for="(data, index) in serverDetails" :key="data.id"
                            v-slot="{ isSelected, toggle }" :value="index">
                            <div style="block-size: 50px; inline-size: 200px;"
                                :style="isSelected ? 'border-color: rgb(var(--v-theme-primary)) !important' : ''"
                                :class="isSelected ? 'border' : 'border border-dashed'"
                                class="d-flex flex-column justify-center align-center cursor-pointer rounded py-6 px-2"
                                @click="toggle">
                                <h6 class="text-base font-weight-medium mx-2">
                                    {{ data.server_name }}
                                </h6>
                            </div>
                        </VSlideGroupItem>
                    </VSlideGroup>
                </div>
                <VSkeletonLoader v-else v-for="i in 3" :key="i" type="list-item-two-line" />
                <VCardText class="d-flex justify-end flex-wrap gap-3">
                    <VBtn variant="tonal" color="secondary" @click="dialogModelValueUpdate(false)">
                        Close
                    </VBtn>
                    <VBtn color="primary" @click="changeServer()">
                        Change Server
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
