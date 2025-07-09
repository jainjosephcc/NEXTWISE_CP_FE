<script setup>
import aeIcon from '@images/icons/payments/ae-icon.png'
import mastercardIcon from '@images/icons/payments/mastercard-icon.png'
import visaIcon from '@images/icons/payments/visa-icon.png'
import { onMounted } from "vue"
import { fetchPermissions } from "@/utils/permission.js"

const lastTransitions = [
  {
    cardImg: visaIcon,
    lastDigit: '*4230',
    cardType: 'Credit',
    sentDate: '17 Mar 2022',
    status: 'Verified',
    trend: '+$1,678',
  },
  {
    cardImg: mastercardIcon,
    lastDigit: '*5578',
    cardType: 'Credit',
    sentDate: '12 Feb 2022',
    status: 'Rejected',
    trend: '-$839',
  },
  {
    cardImg: aeIcon,
    lastDigit: '*4567',
    cardType: 'Credit',
    sentDate: '28 Feb 2022',
    status: 'Verified',
    trend: '+$435',
  },
  {
    cardImg: visaIcon,
    lastDigit: '*5699',
    cardType: 'Credit',
    sentDate: '8 Jan 2022',
    status: 'Pending',
    trend: '+$2,345',
  },
  {
    cardImg: visaIcon,
    lastDigit: '*5699',
    cardType: 'Credit',
    sentDate: '8 Jan 2022',
    status: 'Rejected',
    trend: '-$234',
  },
]

const resolveStatus = {
  Verified: 'success',
  Rejected: 'error',
  Pending: 'secondary',
}

const moreList = [
  {
    title: 'Refresh',
    value: 'refresh',
  },
  {
    title: 'Download',
    value: 'Download',
  },
  {
    title: 'View All',
    value: 'View All',
  },
]

const getPaddingStyle = index => index ? 'padding-block-end: 1.25rem;' : 'padding-block: 1.25rem;'
const currentTab = ref('Deposits')

const items = [
  'Deposits',
  'Withdrawals',
]

const transactionData = ref(null);

const fetchTransactionData = () => fetchDataWithLocalStorage('transactionData', 'admin/dashboard/transaction-data', transactionData);


onMounted(async () => {
  await fetchTransactionData();
});



const tabItemText = 'hortbread chocolate bar marshmallow bear claw tiramisu chocolate cookie wafer.'

</script>

<template>
  <VCard title="Latest Transaction">
    <template #append>
      <div class="me-n2">
        <MoreBtn
          size="small"
          :menu-list="moreList"
        />
      </div>
    </template>
    <VTabs class="mb-0 pb-0 mt-0 pt-0"
      v-model="currentTab"
      grow
    >
      <VTab
        v-for="item in items"
        :key="item"
      >
        {{ item }}
      </VTab>
    </VTabs>
      <VWindow v-model="currentTab">

        <VWindowItem>
          <VTable class="text-no-wrap transaction-table mt-0 pt-0">
            <thead>
            <tr>
              <th>CLIENT</th>
              <th>MT5 ID</th>
              <th>STATUS</th>
              <th>AMOUNT</th>
            </tr>
            </thead>

            <tbody>
            <tr
              v-for="(transition, index) in transactionData.deposit_data"
              :key="index"
            >
              <td
                :style="getPaddingStyle(index)"
                style="padding-inline-end: 1.5rem;"
              >
                <CustomClientCardChip :client_id="transition.client_id" :client_name="transition.client_name" :client_pic="transition.profile_pic" :email="transition.client_mail"/>
              </td>
              <td
                :style="getPaddingStyle(index)"
                style="padding-inline-end: 1.5rem;"
              >
                <CustomMT5Chip :client_id="transition.client_id" :is_wallet="transition.is_wallet" :mt_id="transition.mt_id"/>
              </td>
              <td
                :style="getPaddingStyle(index)"
                style="padding-inline-end: 1.5rem;"
              >
                <CustomTransactionStatusChip :trans_status="transition.status"/>
              </td>
              <td
                :style="getPaddingStyle(index)"
                style="padding-inline-end: 1.5rem;"
                align="right"
              >
                <div class="text-high-emphasis text-base">
                  {{ formatCurrency(transition.req_amount) }}
                </div>
              </td>
            </tr>
            </tbody>
          </VTable>
        </VWindowItem>


        <VWindowItem>
          <VTable class="text-no-wrap transaction-table mt-0 pt-0">
            <thead>
            <tr>
              <th>CLIENT</th>
              <th>MT5 ID</th>
              <th>STATUS</th>
              <th>AMOUNT</th>
            </tr>
            </thead>

            <tbody>
            <tr
              v-for="(transition, index) in transactionData.withdraw_data"
              :key="index"
            >
              <td
                :style="getPaddingStyle(index)"
                style="padding-inline-end: 1.5rem;"
              >
                <CustomClientCardChip :client_id="transition.client_id" :client_name="transition.client_name" :client_pic="transition.profile_pic" :email="transition.client_mail"/>
              </td>
              <td
                :style="getPaddingStyle(index)"
                style="padding-inline-end: 1.5rem;"
              >
                <CustomMT5Chip :client_id="transition.client_id" :is_wallet="transition.is_wallet" :mt_id="transition.mt_id"/>
              </td>
              <td
                :style="getPaddingStyle(index)"
                style="padding-inline-end: 1.5rem;"
              >
                <CustomTransactionStatusChip :trans_status="transition.status"/>
              </td>
              <td
                :style="getPaddingStyle(index)"
                style="padding-inline-end: 1.5rem;"
                align="right"
              >
                <div class="text-high-emphasis text-base">
                  {{ formatCurrency(transition.req_amount) }}
                </div>
              </td>
            </tr>
            </tbody>
          </VTable>
        </VWindowItem>


      </VWindow>
    <VDivider />

  </VCard>
</template>

<style lang="scss">
.transaction-table {
  &.v-table .v-table__wrapper > table > tbody > tr:not(:last-child) > td,
  &.v-table .v-table__wrapper > table > tbody > tr:not(:last-child) > th {
    border-block-end: none !important;
  }
}
</style>
