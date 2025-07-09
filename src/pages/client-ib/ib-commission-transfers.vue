<script setup>
// import * as XLSX from 'xlsx';
const page=ref(null);
const ibTransferList=ref(null);
const ibWithdrawList=ref(null);
const isShowApproveDialog=ref(false);
const isShowRejectDialog=ref(false);
const adjustment_id=ref(null);
const isApproveBtnLoading = ref(false);
const isConfirmDialogVisible = ref(false);
const isErrorDialogVisible = ref(false);
const isSuccessDialogVisible = ref(false);
let errorTitle = ref('')
let errorMessage = ref('')
let successTitle = ref('')
let successMessage = ref('')
const status=ref('');

onMounted(async () => {
  await fetchIbWithdraw();
});
const fetchIbWithdraw = async () => {
  page.value=1
  try {
        const res = await $api(`/getIbwithdrawList?page=/${page.value}`, {
          method: 'GET',
          onResponseError({ response }) {
            console.error('Error response:', response);
          },
        });

        if (res ) {
          ibTransferList.value = res;
          ibWithdrawList.value=ibTransferList.value.withdraw_lists.data;
        } else {
          console.error('Failed to fetch group list or empty response');
        }
      } catch (err) {
        console.error('Error fetching group list:', err);
      }
    };
  
  function openRequestApproveModal(withdraw){
    adjustment_id.value=withdraw.id;
    status.value=1;
    isShowApproveDialog.value=true;

  }
const handleConfirm = async (confirmed) => {
    if (confirmed) {
         try {
            const res = await $api('/approveIbCommission1111', {
                method: 'POST',
                body: {
                    adjustment_id:adjustment_id.value ,
                    action: 1
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isApproveBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Approved Successfully !';
                isApproveBtnLoading.value = false;
                isSuccessDialogVisible.value = true;
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isApproveBtnLoading.value = false;
            isErrorDialogVisible.value = true;
        }
    }
}
const handlePageReload = async (confirmed) => {
  window.location.reload();
}
function openRejectApproveModal(withdraw){
    adjustment_id.value=withdraw.id;
    status.value=0;
    isShowRejectDialog.value=true;

  }
  const handleReject = async (confirmed) => {
    if (confirmed) {
         try {
            const res = await $api('/approveIbCommission1111', {
                method: 'POST',
                body: {
                    adjustment_id:adjustment_id.value ,
                    action: status.value
                },
                onResponseError({ response }) {
                    errorTitle.value = 'Something Went Wrong !';
                    errorMessage.value = response._data.message;
                    isApproveBtnLoading.value = false;
                    isErrorDialogVisible.value = true;
                },
            })
            if (res) {
                successTitle.value = 'Success !'
                successMessage.value = 'Rejected Successfully !';
                isApproveBtnLoading.value = false;
                isSuccessDialogVisible.value = true;
            }
        }
        catch (Ex) {
            errorTitle.value = 'Something Went Wrong !';
            errorMessage.value = Ex.data.message;
            isApproveBtnLoading.value = false;
            isErrorDialogVisible.value = true;
        }
    }
}

const fetchData = async () => {
  try {
    const res = await $api(`/savegetIbwithdrawList`, {
      method: 'GET',
      onResponseError({ response }) {
        console.error('Error response:', response);
      },
    });

    if (res) {
      console.log(res.withdraw_lists,'withdraw');
      const sheet = XLSX.utils.json_to_sheet(res.withdraw_lists);
      const workbook = XLSX.utils.book_new();
      const sheetName = 'Succedomarkets || Ib Withdraw List';

      // Remove existing worksheet with the same name
      const existingIndex = workbook.SheetNames.findIndex(name => name === sheetName);
      if (existingIndex !== -1) {
        workbook.SheetNames.splice(existingIndex, 1);
        delete workbook.Sheets[sheetName];
      }

      // Apply bold and capitalize to the first row
      const firstRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
      const headerCellStyle = { font: { bold: true }, alignment: { wrapText: true, horizontal: 'center' } };
      Object.keys(firstRow).forEach((key, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        if (sheet[cellAddress]) {
          sheet[cellAddress].v = firstRow[key].toUpperCase();
          sheet[cellAddress].s = headerCellStyle;
        }
      });

      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);

      // Add header and footer margins
      const header = "&C&\"Arial,Regular Bold\"&14 Succedomarkets || Ib Withdraw List";
      workbook.Sheets[sheetName]['!margins'] = { header: 0.5, footer: 0.5, top: 0.75, bottom: 0.75 };
      workbook.Sheets[sheetName]['!header'] = [header];
      workbook.Sheets[sheetName]['!footer'] = ["&C&\"Arial,Regular\"&10 Page &P of &N"];

      // Generate Excel file and download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Succedomarkets_Ib_Withdraw_List.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      console.error('Failed to fetch group list or empty response');
    }
  } catch (err) {
    console.error('Error fetching group list:', err);
  }
};



</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <VCard>
    <div class="d-flex align-center justify-space-between">
      <div>
        <VCardTitle>IB Transfer</VCardTitle>
        <VCardSubtitle class="pb-3">Manage IB Transfer</VCardSubtitle>
      </div>
    <div>
      
      <!-- <VBtn class="me-8" @click="fetchData"><VIcon start icon="tabler-arrow-big-down-filled"/>Excel</VBtn> -->
    </div>
    </div>

    <VDivider/>
    <VTable v-if="ibWithdrawList" height="800" class="text-no-wrap">
      <thead>
        <tr>
          <th>
            #ID
          </th>
          <th>
            CLIENT
          </th>
          <th>
            MANAGER
          </th>
          <th>
            MT5 ACCOUNT
          </th>
          <th>
            Total Commission<br> Earned
          </th>
          <th >
            Commission Already<br> Withdrawn
          </th>
          <th>
            Available<br> Commission
          </th>
          <th>
            Request <br>Amount
          </th>
          <th>
            Status
          </th>
          <!-- <th>
            Action
          </th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="withdraw in ibWithdrawList">
          <td class="text-caption me-0 ms-0">
            <VChip size="x-small">
              #{{withdraw.id}}
            </VChip><br>
              {{ formatDateToMonthShort(withdraw.created_at) }}
          </td>
          <td>
            <CustomStaffCardChip :rm_id="withdraw.id" :rm_name="withdraw.client_name" :rm_email="withdraw.email"/>

          </td>
          <td>
            <CustomStaffCardChip :rm_id="withdraw.id" :rm_name="withdraw.rm_name" :rm_email="withdraw.rm_email"/>
          </td>
          <td style="text-align:center">
            <CustomMT5Chip :client_id="withdraw.client_id" :mt_id="withdraw.mt_id?.toString()" :is_wallet="withdraw.is_wallet"/>                    
          </td>
          <td >
            {{ formatCurrency(withdraw.total_commission) }}                    
          </td>
          <td >
            {{ formatCurrency(withdraw.total_Ib_withdraw) }}                        
          </td>
          <td >
            {{ formatCurrency( withdraw.total_commission - withdraw.total_Ib_withdraw) }}                       
          </td>
          <td>
            {{ formatCurrency(withdraw.amount) }}                     
          </td>
          <td > 
            <VChip v-if="withdraw.status===3" :label="false" color="success">
              Approved
            </VChip>
            <VChip v-if="withdraw.status===2" :label="false" color="error">
              Rejected
            </VChip>
            <VChip v-if="withdraw.status===0" :label="false" color="warning">
              Requested
            </VChip>                     
          </td>
          <!-- <td v-if="withdraw.status===0" style="text-align:center">
            <VIcon icon="tabler-checkbox" class="me-2" color="success" @click="openRequestApproveModal(withdraw)"/>
            <VIcon icon="tabler-square-x" color="error"  @click="openRejectApproveModal(withdraw)"/>                       
          </td> -->
        </tr>
      </tbody>
    </VTable>
    <VSkeletonLoader v-else v-for="i in 3" :key="i" type="table-tbody"/>
    </VCard>
    <ConfirmDialog v-model:isDialogVisible="isShowApproveDialog" @confirm="handleConfirm"
                confirmation-question="Do you want to approve the transfer?" cancel-title="Cancelled"
                confirm-title="Cancelled!" />
    <ConfirmDialog v-model:isDialogVisible="isShowRejectDialog" @confirm="handleReject"
                confirmation-question="Do you want to reject the transfer?" cancel-title="Cancelled"
                confirm-title="Cancelled!" />

    
    <VDialog v-model="isSuccessDialogVisible" max-width="500">
      <VCard>
      <VCardText class="text-center px-10 py-6">
          <VBtn icon variant="outlined" color="success" class="my-4"
              style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
          <VIcon icon="tabler-check" size="38" />
          </VBtn>
          <h1 class="text-h4 mb-4">
          {{ successTitle }}
          </h1>
          <p>{{ successMessage }}</p>
          <VBtn color="success" @click="handlePageReload()">
          OK
          </VBtn>
      </VCardText>
      </VCard>
  </VDialog>
  <VDialog v-model="isErrorDialogVisible" max-width="500">
      <VCard>
      <VCardText class="text-center px-10 py-6">
          <VBtn icon variant="outlined" color="error" class="my-4"
              style=" block-size: 88px;inline-size: 88px; pointer-events: none;">
          <span class="text-5xl font-weight-light">X</span>
          </VBtn>
          <h1 class="text-h4 mb-4">
          {{ errorTitle }}
          </h1>
          <p>{{ errorMessage }}</p>
          <VBtn color="success" @click="handlePageReload">
          Ok
          </VBtn>
      </VCardText>
      </VCard>
  </VDialog>
  </section>
</template>

<style scoped lang="scss">

</style>
