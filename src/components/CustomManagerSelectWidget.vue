<template>
  <VCol v-if="managerList && managerList.length > 2" cols="12" sm="2">
    <AppSelect
      v-model="internalSelectedManager"
      label="Assigned Manager"
      placeholder="Assigned Manager"
      :items="managerList"
      clearable
      clear-icon="tabler-x"
    />
  </VCol>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { fetchStaffList, staffList } from '@/utils/apiUtils';
import { toRefs, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: null
  }
});
const emit = defineEmits(['update:modelValue']);

const internalSelectedManager = ref(props.modelValue);
const staffListResponse = ref([]);
const managerList = ref([]);

const fetchAllStaffList = () => fetchDataWithLocalStorage('staff_list', 'data/staff-list', staffListResponse);

watch(staffListResponse, (newValue) => {
  if(newValue){
    managerList.value = newValue.result.staff_list.map(staff => ({
      title: staff.staff_name,
      value: staff.id.toString() // Convert id to string to match your example
    }));
  }
});


onMounted(async () => {
  await fetchAllStaffList();
});

watch(internalSelectedManager, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped>
/* Add any additional styling here */
</style>
