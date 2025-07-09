<script setup>
import { country_list, fetchCountryList } from '@/utils/apiUtils';
import { computed, nextTick, onMounted, ref } from 'vue';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';

const desserts = [
  {
    dessert: 'Frozen Yogurt',
    calories: 159,
    fat: 6,
    carbs: 24,
    protein: 4,
  },
  {
    dessert: 'Ice cream sandwich',
    calories: 237,
    fat: 6,
    carbs: 24,
    protein: 4,
  },
  {
    dessert: 'Eclair',
    calories: 262,
    fat: 6,
    carbs: 24,
    protein: 4,
  },
  {
    dessert: 'Cupcake',
    calories: 305,
    fat: 6,
    carbs: 24,
    protein: 4,
  },
  {
    dessert: 'Gingerbread',
    calories: 356,
    fat: 6,
    carbs: 24,
    protein: 4,
  },
]

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  mtList: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'userData',
])

const filteredMtList = computed(() => {
  return props.mtList.filter(item => item.is_wallet === 0);
});

const handleDrawerModelValueUpdate = (val) => {
  emit('update:isDrawerOpen', val)
}

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
}

</script>

<template>
  <VNavigationDrawer temporary :width="400" location="end" class="scrollable-content" :model-value="props.isDrawerOpen"
                     @update:model-value="handleDrawerModelValueUpdate">
    <!-- 👉 Title -->
    <AppDrawerHeaderSection title="MT5 Accounts Under IB" @cancel="closeNavigationDrawer" />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VTable class="text-no-wrap">
          <thead>
          <tr>
            <th>
              CLIENT
            </th>
            <th>
              MT5 ID
            </th>
            <th>
              GROUP
            </th>
          </tr>
          </thead>

          <tbody v-if="props.mtList">
          <tr
            v-for="item in filteredMtList"
            :key="item.mt5_id"
          >
            <td>
              <CustomClientCardChip :email="item.email" :client_name="item.client_name" :client_id="item.c_id"/>
            </td>
            <td>
              <VChip class="ps-2 pe-2 pt-0 pb-0">{{ item.mt5_id }}</VChip>
            </td>
            <td>
              <VChip size="x-small" variant="outlined" class="ps-2 pe-2 pt-0 pb-0">
                <h6 class="text-body-2">{{ item.mt_group_name }}</h6>
              </VChip>
            </td>
          </tr>
          </tbody>
        </VTable>
      </VCard>

    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

