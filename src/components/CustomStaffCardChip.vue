<script setup>
const props = defineProps({
  rm_id: {
    type: [String, Number],
    required: true,
  },
  rm_name: {
    type: String,
    required: true,
  },
  rm_email: {
    type: String,
  },
})

// Computed property to format the rm_name
const formattedName = computed(() => {
  return props.rm_name?.length > 10 ? props.rm_name.slice(0, 10) + '...' : props.rm_name
})
</script>

<template>
  <VList class="card-list">
    <RouterLink v-if="hasAccess('view_staff_details_page')" :to="`/staff/staff-${props.rm_id}-home-null-details`">
      <VListItem>
        <template #prepend>
          <VAvatar
            rounded
            color="secondary"
            icon="tabler-user-circle"
            variant="outlined"
            size="30"
          />
        </template>
        <VListItemTitle class="font-weight-medium text-gray-800">
          {{ formattedName }}
        </VListItemTitle>
        <VListItemSubtitle>
          {{ rm_email }}
        </VListItemSubtitle>
      </VListItem>
    </RouterLink>
    <div v-else>
      <VListItem>
        <template #prepend>
          <VAvatar
            rounded
            color="secondary"
            icon="tabler-user-circle"
            variant="outlined"
            size="30"
          />
        </template>
        <VListItemTitle class="font-weight-medium text-gray-800">
          {{ formattedName }}
        </VListItemTitle>
        <VListItemSubtitle>
          {{ rm_email }}
        </VListItemSubtitle>
      </VListItem>
    </div>
  </VList>
</template>
