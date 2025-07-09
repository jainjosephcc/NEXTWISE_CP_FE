<script setup>

const bankDetails = ref([])
const isEditBankDialogVisible = ref(false)
const bank_details = ref(null)
const isLoading = ref(true)

const props = defineProps({
  clientId: {
    type: Number,
    required: true,
  },
})

onMounted(async () => {
  fetchBankDetails()
})

const fetchBankDetails = async () => {
  const res = await $api(`/getClientBankDetails/${props.clientId}`, {
    method: 'GET',
    onResponseError({ response }) {
      //console.log(response);
      // errors.value = response._data.message
    },
  })
  if (res) {
    bankDetails.value = res.bank_details
    isLoading.value = false
    console.log(isLoading.value)
  }
  // console.log(mt5ListData.value);
}

function editBankDetails(bank) {

  bank_details.value = bank
  isEditBankDialogVisible.value = true
  console.log(bank_details.value, 'bank')

}

const isNewCardAddDialogVisible = ref(false)
const isCardAddDialogVisible = ref(false)

const paymentShow = ref([
  true,
])

function togglePaymentShow(index) {
  paymentShow.value[index] = !paymentShow.value[index]
}

</script>
<template>

  <!-- <VRow> -->
  <VCard>
    <VCardText v-if="hasAccess('view_bank_details')">
      <div class="d-flex justify-space-between mb-6 flex-wrap align-center gap-y-4 gap-x-6">
        <h5 class="text-h5">Bank Details</h5>

      </div>
      <VSkeletonLoader v-if="isLoading" v-for="i in 3" :key="i" type="article"/>
      <template v-if="bankDetails.length">

        <template v-for="(bank, index) in bankDetails" :key="index">
          <div>
            <div class="d-flex justify-space-between py-3 gap-y-2 flex-wrap align-center">
              <div class="d-flex align-center gap-x-4">
                <VIcon
                  :icon="paymentShow[index] ? 'tabler-chevron-down' : 'tabler-chevron-right'"
                  size="24"
                  class="flip-in-rtl text-high-emphasis"
                  @click="togglePaymentShow(index)"
                />
                <VIcon icon="tabler-building-bank" size="30"/>
                <div>
                  <div class="d-flex gap-x-2 mb-1">
                    <h6 class="text-h6">{{ bank.account_no }}</h6>
                  </div>
                  <div class="text-body-1">{{ bank.bank_name }}</div>
                </div>
              </div>
              <div class="ms-5">
                <IconBtn v-if="hasAccess('update_bank_details')">
                  <VIcon icon="tabler-edit" class="flip-in-rtl" @click="editBankDetails(bank)"/>
                </IconBtn>

              </div>
            </div>

            <VExpandTransition>
              <div v-show="paymentShow[index]">
                <div class="px-10 pb-3">
                  <VRow>
                    <VCol cols="12" md="6">
                      <VTable>
                        <tr>
                          <td>Name</td>
                          <td class="font-weight-medium text-high-emphasis">
                            {{ bank.holder_name }}
                          </td>
                        </tr>
                        <tr>
                          <td>Account Number</td>
                          <td class="font-weight-medium text-high-emphasis">
                            **** {{ bank.account_no.slice(-4) }}
                          </td>
                        </tr>
                        <tr>
                          <td>Bank Name</td>
                          <td class="font-weight-medium text-high-emphasis">
                            {{ bank.bank_name }}
                          </td>
                        </tr>
                        <tr>
                          <td>Added On</td>
                          <td class="font-weight-medium text-high-emphasis">
                            {{ formatDateToMonthShort(bank.created_at) }}
                            <!-- {{ bank.created_at }} -->
                          </td>
                        </tr>

                      </VTable>
                    </VCol>
                    <VCol cols="12" md="6">
                      <VTable>
                        <tr>
                          <td>IBAN</td>
                          <td class="font-weight-medium text-high-emphasis">
                            {{ bank.iban }}
                          </td>
                        </tr>
                        <tr>
                          <td>Country</td>
                          <td class="font-weight-medium text-high-emphasis">
                            {{ bank.country }}
                          </td>
                        </tr>
                        <tr>
                          <td>IFSC Code</td>
                          <td class="font-weight-medium text-high-emphasis">
                            {{ bank.ifsc_code }}
                          </td>
                        </tr>
                        <tr>
                          <td>Address</td>
                          <td class="font-weight-medium text-high-emphasis">
                            {{ bank.bank_address }}
                          </td>
                        </tr>
                      </VTable>
                    </VCol>
                  </VRow>
                </div>
              </div>
            </VExpandTransition>
            <VDivider v-if="index !== bankDetails.length - 1"/>
          </div>
        </template>
      </template>
      <!-- <VSkeletonLoader v-else v-for="i in 3" :key="i" type="article" /> -->
      <div v-else>
        <VAlert type="warning" v-if="!isLoading">
          No Data Found
        </VAlert>
      </div>

    </VCardText>
    <VCardText v-else>
      <div class="d-flex justify-space-between mb-6 flex-wrap align-center gap-y-4 gap-x-6">
        <h5 class="text-h5">Bank Details</h5>

      </div>
      <VAlert type="warning">
        You dont have enough permissions to view this data.
      </VAlert>

    </VCardText>
  </VCard>


  <!-- </VRow> -->
  <EditBankDetailsDialog v-model:isDialogVisible="isEditBankDialogVisible" :bank_details="bank_details"/>
</template>
