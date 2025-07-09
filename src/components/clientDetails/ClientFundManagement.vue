<script setup>
import { onMounted } from "vue"

const currentTab = ref('window-1')

const props = defineProps({
  mt5ListData: {
    type: Object,
    required: true,
  },
  clientId: {
    type: Number,
    required: true,
  },
})

onMounted(async () => {
  fetchFundParams()
})

const depositMethods = ref(null)
const withdrawMethods = ref(null)
const currencyList = ref(null)
const bankDetails = ref(null)


const fetchFundParams = async () => {
  const res = await $api(`fund/data-params/${props.clientId}`, {
    method: 'GET',
    onResponseError({ response }) {
      //console.log(response);
      // errors.value = response._data.message
    },
  })
  if (res) {
    depositMethods.value = res.deposit_methods
    withdrawMethods.value = res.withdraw_methods
    currencyList.value = res.currency
    bankDetails.value = res.bank_details
  }
  // console.log(mt5ListData.value);
}

</script>

<template>
  <VCard>
    <VCardText class="col-12">
      <VTabs
        v-model="currentTab"
        fixed-tabs
      >
        <VTab v-if="hasAccess('create_deposit_ticket')">
          Deposit
        </VTab>

        <VTab v-if="hasAccess('create_withdraw_ticket')">
          Withdrawal
        </VTab>

        <VTab v-if="hasAccess('process_internal_transfer')">
          Internal Transfer
        </VTab>
      </VTabs>


      <!-- <VCard c> -->
      <VCardText>
        <VWindow v-model="currentTab" class="col-12">
          <VWindowItem v-if="hasAccess('create_deposit_ticket')" value="window-1">
            <VCard>
              <h4>
                Create Deposit Ticket On behalf of Client
                <!-- <br> -->
                <!-- {{hasAccess('view_mt5_user_list') }} -->
                <!-- <br> -->
                <!-- {{hasAccess('create_deposit_ticket')}} -->
              </h4>

              <div v-if="hasAccess('create_deposit_ticket')" class="col-12">
                <DepositView v-if="mt5ListData && depositMethods" :mt5-list-data="mt5ListData"
                             :deposit-methods="depositMethods" :client-id="clientId"
                />
              </div>
              <VAlert v-else type="warning">
                Unable to create a Deposit ticket: <strong>NO PERMISSION</strong>
              </VAlert>
            </VCard>
          </VWindowItem>

          <VWindowItem v-if="hasAccess('create_withdraw_ticket')" value="window-2">
            <VCard>
              <h4>
                Create Withdraw Ticket On behalf of Client
              </h4>
              <WithdrawView :client-id="clientId" :mt5-list-data="mt5ListData"/>
            </VCard>
          </VWindowItem>

          <VWindowItem v-if="hasAccess('process_internal_transfer')" value="window-3">
            <VCard>
              <h4>
                Create Internal Transfer On behalf of Client
              </h4>
              <InternalTransferView :client-id="clientId" :mt5-list-data="mt5ListData"/>
            </VCard>
          </VWindowItem>
        </VWindow>
      </VCardText>
      <!-- </VCard> -->
    </VCardText>
  </VCard>
</template>
