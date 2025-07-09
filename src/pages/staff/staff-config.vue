<script setup>
import StaffGroupsTab from "@/components/staffConfig/StaffGroupsTab.vue";
import { ref } from "vue";
const userTab = ref(null);

const tabs = [
  {
    icon: 'tabler-users-group',
    title: 'Groups',
  },
  {
    icon: 'tabler-user-check',
    title: 'Roles',
  },
  {
    icon: 'tabler-users',
    title: 'Teams',
  },
]
</script>

<template>
  <section>
    <!-- 👉 Widgets -->

    <!--👉HEADER WIDGETS-->
    <VCol cols="12" md="12" lg="12">
      <VTabs v-model="userTab" class="v-tabs-pill">
        <VTab v-for="tab in tabs" :key="tab.icon">
          <VIcon :size="18" :icon="tab.icon" class="me-1" />
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>
      <VWindow v-model="userTab" class="mt-6 disable-tab-transition" :touch="false">
        <VWindowItem>
          <StaffGroupsTab />
        </VWindowItem>
        <VWindowItem>
          <StaffRolesTab />
        </VWindowItem>
        <VWindowItem>
          <StaffTeamsTab />
        </VWindowItem>
      </VWindow>
    </VCol>
  </section>
</template>
<style scoped lang="scss"></style>
