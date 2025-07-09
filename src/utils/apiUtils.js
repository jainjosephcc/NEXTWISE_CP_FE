// src/utils/apiUtils.js

import { ref } from 'vue';
export const transHeaderData = ref({});
export const currency_list = ref([]);
export const payment_method_list = ref([]);

export const withdraw_method_list = ref([]);
export const staffList = ref([]);
export const manager_list = ref([]);
export const headerData = ref(null);
export const countryList = ref([]);
export const country_list = ref([]);

export const fetchStaffList = async () => {
  const localStaffList = getWithExpiry('staff_list');

  if (localStaffList && localStaffList.length > 10 && localStaffList !== 'undefined') {
    staffList.value = JSON.parse(localStaffList);
  } else {
    const s_response = await useApi('/data/staff-list', { method: 'GET' });
    if (s_response.data.value.result) {
      staffList.value = s_response.data.value.result.staff_list;
      setWithExpiry('staff_list', JSON.stringify(staffList.value));
    }
  }

  manager_list.value = staffList.value.map(staff => ({
    title: staff.staff_name,
    value: staff.id.toString()  // Convert id to string to match your example
  }));
};

export const fetchHeaderData = async () => {
  const storedData = getWithExpiry('header_data');
  if (storedData) {
    // If data exists in local storage, parse it and set to the reactive variable
    headerData.value = storedData;
  } else {
    // Fetch new data if not in local storage
    try {
      const res = await $api('/data/header-list', {
        method: 'GET',
        onResponseError({ response }) {
        },
      });

      if (res.result) {
        headerData.value = res.result;
        setWithExpiry('header_data', res.result, 5 * 60 * 1000); // 5 minutes in milliseconds
      }
    } catch (error) {
      console.error('Error fetching header data:', error);
    }
  }
};

export const fetchFilterData = async () => {
  const storedData = getWithExpiry('transfers_filter_dd_data');
  if (storedData) {
    transHeaderData.value = storedData;
  } else {
    // Fetch new data if not in local storage
    try {
      const s_response = await useApi('/transactions/dropdown-data', { method: 'GET' });
      if (s_response.data.value.result) {
        transHeaderData.value = s_response.data.value.result;
        setWithExpiry('transfers_filter_dd_data', transHeaderData.value, 24 * 60 * 60 * 1000); // Set expiry for 24 hours
      }
    } catch (error) {
      console.error('Error fetching transaction header data:', error);
    }
  }

  currency_list.value = transHeaderData.value.currencies.map(currency => ({
    title: currency.code,
    value: currency.id.toString()  // Convert id to string to match your example
  }));

  payment_method_list.value = transHeaderData.value.payment_methods.map(pm => ({
    title: pm.payment_name,
    value: pm.id.toString()  // Convert id to string to match your example
  }));

  withdraw_method_list.value = transHeaderData.value.withdraw_methods.map(pm => ({
    title: pm.method,
    value: pm.id.toString()  // Convert id to string to match your example
  }));
};

export const fetchCountryList = async () => {
  const localCountryList = localStorage.getItem('country_list');

  if (localCountryList && localCountryList.length > 50 && localCountryList !== 'undefined') {
    countryList.value = JSON.parse(localCountryList);
  } else {
    const c_response = await useApi('/data/country-list', { method: 'GET' });
    if (c_response.data.value.result) {
      countryList.value = c_response.data.value.result.country_list;
      localStorage.setItem('country_list', JSON.stringify(countryList.value));
    }
  }

  country_list.value = countryList.value.map(country => ({
    title: country.name,
    value: country.id.toString() // Convert id to string to match your example
  }));
};

export const fetchDataWithLocalStorage = async (key, apiEndpoint, dataRef) => {
  const TTL = 60 * 60 * 1000;
  const localStorageData = getWithExpiry(key);
  if (localStorageData) {
    dataRef.value = localStorageData;
  }
  const res = await $api(apiEndpoint, {
    method: 'GET',
    onResponseError({ response }) {
      console.error(response);
    },
  });

  if (res) {
    dataRef.value = res;
    setWithExpiry(key, res, TTL);
    return res;
  }
};

export const fetchDataWithoutLocalStorage = async (apiEndpoint, dataRef) => {
  const res = await $api(apiEndpoint, {
    method: 'GET',
    onResponseError({ response }) {
      console.error(response);
    },
  });
  if (res) {
    dataRef.value = res;
    return res;
  }
};
