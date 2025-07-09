<script setup>
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@layouts/utils'
import { useTheme } from 'vuetify'
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

// Initialize core and config store
initCore()
initConfigStore()

const configStore = useConfigStore()
const { global } = useTheme()
const router = useRouter()

// Function to clear all cookies
const clearAllCookies = () => {
  document.cookie.split(';').forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim()
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  })
}

// Logout function
const logout = () => {
  clearAllCookies()
  localStorage.clear() // Clear local storage
  router.push('/login') // Redirect to login page
}

// Function to reset the inactivity timer
let inactivityTimeout
const resetInactivityTimer = () => {
  // Clear previous timer
  if (inactivityTimeout) clearTimeout(inactivityTimeout)

  // Set new timer for 15 minutes (15 * 60 * 1000 milliseconds)
  inactivityTimeout = setTimeout(() => {
    logout()
  }, 30 * 60 * 1000)
}

// Initialize event listeners for user activity
const initInactivityListeners = () => {
  // List of events that should reset the timer
  const events = ['mousemove', 'keydown', 'scroll', 'click']

  // Add event listeners for each event
  events.forEach(event => {
    window.addEventListener(event, resetInactivityTimer)
  })
}

// Cleanup event listeners when component is unmounted
const removeInactivityListeners = () => {
  const events = ['mousemove', 'keydown', 'scroll', 'click']
  events.forEach(event => {
    window.removeEventListener(event, resetInactivityTimer)
  })
}

// Initialize on component mount and cleanup on unmount
onMounted(() => {
  initInactivityListeners()
  resetInactivityTimer() // Start the timer on initial load
})

onBeforeUnmount(() => {
  removeInactivityListeners()
  if (inactivityTimeout) clearTimeout(inactivityTimeout)
})
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView/>
      <!-- <BuyNow /> -->
      <ScrollToTop/>
    </VApp>
  </VLocaleProvider>
</template>
