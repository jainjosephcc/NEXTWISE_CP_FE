<script setup>
const selectedIds=ref([]);
const allSelect=ref([]);

</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            Client Order
          </VCardTitle>
        </VCard>
      </VCol>
    </VRow>
    <VCard class="mb-6">
      <VTable height="800" class="text-no-wrap">
        <thead>
          <tr>
            <th>
              <VCheckbox v-model="allSelect" />
                       <!-- @change="toggleSelectAll" -->
            </th>
            <th>
              ORDER ID
            </th>
            <th>
              CLIENT NAME
            </th>
            <th>
              REQUESTED ON
            </th>
            <th>
              PRODUCT NAME
            </th>
            <th>
              NO. OF PRODUCTS
            </th>
            <th>
              SIZE
            </th>
            <th>
              STATUS
            </th>
            <th>
              Action
              </th>
          </tr>
          <tr class="">
            <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
                <VCheckbox v-model="selectedIds"/>
            </td>
            <td class="text-caption me-0 ms-0" style="padding-left: 2px;">
              <VChip size="x-small">
                #1002
              </VChip>
            </td>
            <td>
              Lesly Joy
              <!-- <VList class="card-list">
                <RouterLink :to="`/client/client-${user.id}-home-null-details`">
                  <VListItem>
                    <VListItemTitle class="font-weight-medium">
                      <CustomClientCardChip :client_name="user.client_name" :client_id="user.id" :email="user.email"
                        :client_pic="user.client_pic"></CustomClientCardChip>
                    </VListItemTitle>
                  </VListItem>
                </RouterLink>
              </VList> -->
            </td>
            <td>
              Aug 1
            </td>
            <td>
              Sweatshirt
            </td>
            <td>
              5
            </td>
            <td>
              Large
            </td>
            <td > 
            <VChip :label="false" color="warning">
              Requested
            </VChip>                     
          </td>
          <td>
            <RouterLink :to="`/rewards/clientorder-25-home-null-details`">
            <VIcon icon="tabler-eye"/>
            </RouterLink>
          </td>
          </tr>

        </thead>
      </VTable>
    </VCard>
  </section>
</template>

<style scoped lang="scss">

</style>
