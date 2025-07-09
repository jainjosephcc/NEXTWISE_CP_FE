<script setup>
import { toRefs, computed } from 'vue';
import { RouterLink } from "vue-router"

const props = defineProps({
  client_id: {
    type: [String, Number],
    required: true
  },
  client_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  client_pic: {
    type: String,
    default: null
  }
});

const { client_id, client_name, email, client_pic } = toRefs(props);

const clientId = client_id.value;
const clientName = client_name.value;
const clientPic = client_pic.value;

const getClientPicUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_S3_BASE_URL;
  return clientPic ? `${baseUrl}/client/profileImage/${clientId}/${clientPic}` : null;
});
</script>

<template>
  <VList class="card-list">
    <component :is="hasAccess('view_client_profile') ? RouterLink : 'div'" :to="hasAccess('view_client_profile') ? `/client/client-${clientId}-home-null-details` : null">
      <VListItem>
        <template #prepend>
          <VAvatar
            v-if="getClientPicUrl"
            :image="getClientPicUrl"
            rounded="sm"
          />
          <VAvatar
            v-else
            color="secondary"
            variant="tonal"
            class=""
            rounded
            icon="tabler-user-square-rounded"
          />
        </template>
        <VListItemTitle class="font-weight-medium">
          {{ clientName }}
        </VListItemTitle>
        <VListItemSubtitle>
          {{ hasAccess('view_client_email')?email:''}}
        </VListItemSubtitle>
      </VListItem>
    </component>
  </VList>
</template>

<style scoped>
/* Add any additional styling here */
</style>
