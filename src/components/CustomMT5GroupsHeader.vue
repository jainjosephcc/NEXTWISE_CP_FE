<script setup>
const algoData = ref(null);
const totalGroupCategory=ref('');
const activeCategories=ref('');
const totalGroups=ref('');
const activeGroups=ref('');
onMounted(async () => {
  await fetchHeaderData();
});

const fetchHeaderData = async () => {
  try {
    const res = await $api('/getGroupMangementHeader', {
      method: 'GET',
    });
    if (res) {
      algoData.value = res;
      totalGroupCategory.value=algoData.value.total_group_category
      activeCategories.value=algoData.value.active_mtgroup_category
      totalGroups.value=algoData.value.total_mtgroup
      activeGroups.value=algoData.value.active_mtgroup
    }

  } catch (err) {
    console.error('Error fetching group category:', err);
    error.value = err;
  }
}
const widgetData = computed(() => [
  {
    title: 'TOTAL CATEGORIES',
    value: totalGroupCategory.value,
    desc: 'Added Categories',
    icon: 'tabler-align-box-left-bottom',
    iconColor: 'error'
  },
  {
    title: 'ACTIVE CATEGORIES',
    value: activeCategories.value,
    desc: 'Total Active Categories',
    icon: 'tabler-align-box-left-bottom',
    iconColor: 'success'
  },
  {
    title: 'TOTAL GROUPS',
    value: totalGroups.value,
    desc: 'Group Count',
    icon: 'tabler-category-2',
    iconColor: 'error'
  },
  {
    title: 'ACTIVE GROUPS',
    value: activeGroups.value,
    desc: 'Active Groups',
    icon: 'tabler-category-2',
    iconColor: 'success'
  },
]);

</script>
<template>
  <div class="d-flex mb-6">
    <VRow>
      <template v-for="(data, id) in widgetData" :key="id">
        <VCol cols="12" md="3" sm="6">
          <VCard>
            <VCardText>
              <div class="d-flex justify-space-between">
                <div class="d-flex flex-column gap-y-1">
                  <div class="text-body-1 text-high-emphasis">
                    {{ data.title }}
                  </div>
                  <div class="d-flex gap-x-2 align-center">
                    <h5 class="text-h5">
                      {{ data.value }}
                    </h5>
                    <!-- <div v-if="data.change" class="text-base" :class="data.change > 0 ? 'text-success' : 'text-error'">
                      ({{ prefixWithPlus(data.change) }}%)
                    </div> -->
                  </div>
                  <div class="text-sm">
                    {{ data.desc }}
                  </div>
                </div>
                <VAvatar :color="data.iconColor" variant="tonal" rounded size="42">
                  <VIcon :icon="data.icon" size="26" />
                </VAvatar>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </template>
    </VRow>
  </div>
</template>
