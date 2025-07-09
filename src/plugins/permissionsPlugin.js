
/**
 * Custom function to check if a permission exists
 */
export const hasPermission = (permission) => {
  const accessList = useCookie('access_list').value || [];
  return accessList.includes(permission);
};

/**
 * Function to load the permissions plugin
 */
export function loadPermissionsPlugin(app) {
  app.config.globalProperties.$hasPermission = hasPermission;
}

/**
 * Default export to load the permissions plugin
 */
export default function (app) {
  loadPermissionsPlugin(app);
}
