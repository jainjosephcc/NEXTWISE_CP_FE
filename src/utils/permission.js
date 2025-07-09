// Function to fetch permissions and store them in local storage
export const fetchPermissions = async () => {
  try {
    const res = await $api('dashboard/get-permissions', {
      method: 'GET',
      onResponseError({ response }) {
        console.log('API Response Error:', response)
      },
    })
    if (res.status) {
      const accessList = res.result.access_list.map(permission => permission.cappuccino)
      localStorage.setItem('accessList', JSON.stringify(accessList))
      return accessList
    } else {
      return []
    }
  } catch (error) {
    console.error('Fetch Permissions Error:', error)
    return []
  }
}

// Synchronous function to check if a permission exists
export const hasAccess = (permission) => {
  const accessList = JSON.parse(localStorage.getItem('accessList')) || []
  return accessList.includes(permission)
}
