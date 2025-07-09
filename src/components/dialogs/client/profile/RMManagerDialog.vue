<script setup>
import { nextTick, ref } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const refForm = ref()
const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },
  managerHistory: {
    type: Array, // Changed to Array since it's a list of objects
    required: true,
  },
  managerId: {
    type: Number,
  },
  managerName: {
    type: String,
  },
  managerPic: {
    type: String,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'userData',
])

const handleDrawerModelValueUpdate = (val) => {
  emit('update:isDrawerOpen', val)
}
// Predefined list of colors
const colors = ['primary', 'warning', 'error', 'info', 'success']


// Function to format the date
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString(undefined, options)
}

// Function to get the dot color based on the index or date
const getDotColor = (index) => {
  return colors[index % colors.length] // Cycle through the colors
}

// Function to get the headline based on the date
const getHeadline = (dateStr) => {
  return `Manager Assigned on ${formatDate(dateStr)}`
}

// Sort the manager history by date before rendering (optional)
const sortedManagerHistory = computed(() => {
  return [...props.managerHistory].sort((a, b) => new Date(a.manager_assigned_on) - new Date(b.manager_assigned_on))
})

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

</script>

<template>
  <VNavigationDrawer temporary :width="400" location="end" class="scrollable-content"
                     :model-value="props.isDrawerOpen" @update:model-value="handleDrawerModelValueUpdate"
  >
    <AppDrawerHeaderSection title="RM Manager History" @cancel="closeNavigationDrawer"/>

    <VDivider/>

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard title="Managerial Timeline">
        <VCardText>
          <VTimeline side="end" align="start" line-inset="8" truncate-line="start" density="compact">
            <!-- Active Manager -->
            <VTimelineItem :dot-color="'success'" size="x-small">
              <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-2">
                                <span class="app-timeline-title">
                                    Active Manager In Charge
                                </span>
                <VChip size="small" variant="outlined" color="success">Active</VChip>
              </div>
              <div class="app-timeline-text mt-1">
                SuperVisory Information
              </div>
              <div class="d-inline-flex align-center mt-1">
                <CustomStaffCardChip :rm_id="props.managerId" :rm_name="props.managerName"/>
              </div>
            </VTimelineItem>

            <!-- Other Managers -->
            <VTimelineItem v-for="(doc, index) in sortedManagerHistory" :key="doc.id"
                           :dot-color="getDotColor(index)" size="x-small"
            >
              <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-2">
                                <span class="app-timeline-title">
                                    {{ getHeadline(doc.manager_assigned_on) }}
                                </span>
                <span class="app-timeline-meta">{{ formatTime(doc.manager_assigned_on) }}</span>
              </div>
              <div class="app-timeline-text mt-1">
                Line Manager Information
              </div>
              <div class="d-inline-flex align-center mt-1">
                <CustomStaffCardChip :rm_id="doc.rm_id" :rm_name="doc.rm_name" :rm_email="doc.email"/>
              </div>
            </VTimelineItem>
          </VTimeline>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
