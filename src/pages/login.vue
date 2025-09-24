<script setup>
import { useAbility } from '@casl/vue'
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const route = useRoute()
const router = useRouter()
const ability = useAbility()

// Form state
const credentials = ref({
  email: '',
  password: '',
})
const rememberMe = ref(false)
const isPasswordVisible = ref(false)
const isSubmitLoading = ref(false)
const isSubmitDisabled = ref(false)
const errors = ref({
  email: '',
  password: '',
})

// Theme state
const isDarkMode = ref(false)

// API login function
const login = async () => {
  isSubmitLoading.value = true
  isSubmitDisabled.value = true

  try {
    const res = await $api('/login', {
      method: 'POST',
      body: {
        email: credentials.value.email,
        password: credentials.value.password,
      },
      onResponseError({ response }) {
        console.log(response)
        if (response._data.error) {
          errors.value.password = response._data.error
        } else if (response._data.message) {
          errors.value.password = response._data.message
        }
        isSubmitLoading.value = false
        isSubmitDisabled.value = false
      },
    })

    useCookie('userAbilityRules').value = res.abilityRules
    ability.update(res.abilityRules)
    useCookie('userData').value = res.user
    useCookie('accessToken').value = res.token

    await nextTick(() => {
      isSubmitLoading.value = false
      isSubmitDisabled.value = false
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  } catch (err) {
    console.error(err)
    isSubmitLoading.value = false
    isSubmitDisabled.value = false
  }
}

// Form validation
const validateEmail = () => {
  const email = credentials.value.email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    errors.value.email = 'Email is required'
    return false
  } else if (!emailRegex.test(email)) {
    errors.value.email = 'Please enter a valid email address'
    return false
  } else {
    errors.value.email = ''
    return true
  }
}

const validatePassword = () => {
  const password = credentials.value.password

  if (!password) {
    errors.value.password = 'Password is required'
    return false
  } else if (password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    return false
  } else {
    errors.value.password = ''
    return true
  }
}

const handleSubmit = async (e) => {
  e.preventDefault()

  if (isSubmitLoading.value) return

  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (!isEmailValid || !isPasswordValid) {
    return
  }

  await login()
}

// Theme management
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light')

  isDarkMode.value = theme === 'dark'
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

onMounted(() => {
  initTheme()
})
</script>


<template>
  <div class="coral-login-container" :class="{ 'dark': isDarkMode }">
    <!-- Background with gradient -->
    <div class="login-background"></div>

    <!-- Main login wrapper -->
    <div class="login-wrapper">
      <!-- Theme Toggle -->
      <div class="theme-toggle-container">
        <button @click="toggleTheme" type="button" class="theme-toggle-btn"
          :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
          <VIcon :icon="isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'" size="20" class="theme-icon" />
        </button>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <!-- Logo -->
        <div class="logo-container">
          <img :src="isDarkMode ? '/logo_light.png' : '/logo_dark.png'" alt="Copy Trader" class="logo">
        </div>

        <!-- Welcome Message -->
        <div class="welcome-section">
          <h1 class="welcome-title">
            Welcome back 👋
          </h1>
          <p class="welcome-subtitle">
            Sign in to your Copy Trader account
          </p>
        </div>

        <!-- Login Form -->
        <form @submit="handleSubmit" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">
              Email address
            </label>
            <input id="email" v-model="credentials.email" type="email" autocomplete="email" required class="form-input"
              :class="{ 'error': errors.email }" placeholder="Enter your email" @blur="validateEmail"
              @input="errors.email = ''">
            <div v-if="errors.email" class="error-message">
              {{ errors.email }}
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">
              Password
            </label>
            <div class="password-input-wrapper">
              <input id="password" v-model="credentials.password" :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="current-password" required class="form-input" :class="{ 'error': errors.password }"
                placeholder="Enter your password" @blur="validatePassword" @input="errors.password = ''">
              <button type="button" @click="isPasswordVisible = !isPasswordVisible" class="password-toggle-btn"
                :aria-pressed="isPasswordVisible" :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'">
                <VIcon :icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'" size="20" />
              </button>
            </div>
            <div v-if="errors.password" class="error-message">
              {{ errors.password }}
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <div class="remember-me">
              <VCheckbox v-model="rememberMe" id="remember-me" class="remember-checkbox" hide-details />
              <label for="remember-me" class="remember-label">
                Remember me
              </label>
            </div>
            <div class="forgot-password">
              <a href="#" class="forgot-link">
                Forgot password?
              </a>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="submit-container">
            <VBtn type="submit" :loading="isSubmitLoading" :disabled="isSubmitDisabled" class="submit-btn" size="large"
              block>
              <template v-if="isSubmitLoading">
                <VIcon icon="mdi-loading" class="mr-2" />
                Signing in...
              </template>
              <template v-else>
                Sign in
              </template>
            </VBtn>
          </div>
        </form>

        <!-- Support Line -->
        <div class="support-section">
          <p class="support-text">
            Need help?
            <a href="#" class="support-link">
              Contact Support Team
            </a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          © {{ new Date().getFullYear() }} Paperbot / Copy Trader
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Import Inter font
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

// Coral Markets Brand Colors
:root {
  --coral-50: #f0fdf4;
  --coral-100: #dcfce7;
  --coral-200: #bbf7d0;
  --coral-300: #86efac;
  --coral-400: #4ade80;
  --coral-500: #22C58B;
  --coral-600: #18A873;
  --coral-700: #129164;
  --coral-800: #166534;
  --coral-900: #14532d;

  --ink-50: #f8fafc;
  --ink-100: #f1f5f9;
  --ink-200: #e2e8f0;
  --ink-300: #cbd5e1;
  --ink-400: #94a3b8;
  --ink-500: #64748b;
  --ink-600: #475569;
  --ink-700: #334155;
  --ink-800: #1e293b;
  --ink-900: #0B1220;
}

// Main container
.coral-login-container {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
  transition: background 0.3s ease;

  // Dark mode
  &.dark {
    background: linear-gradient(135deg, #0B1220 0%, #0B1220 50%, #0B1220 100%);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.02) 1px, transparent 0);
      background-size: 20px 20px;
      pointer-events: none;
    }
  }
}

// Background
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

// Main wrapper
.login-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 28rem; // 448px
  animation: fadeInUp 0.3s ease-out;
}

// Theme toggle
.theme-toggle-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.theme-toggle-btn {
  padding: 0.5rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--coral-500), 0 0 0 4px rgba(34, 197, 139, 0.1);
  }

  .theme-icon {
    color: #64748b;
  }
}

// Dark mode theme toggle
.dark .theme-toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .theme-icon {
    color: #94a3b8;
  }
}

// Login card
.login-card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  @media (min-width: 640px) {
    padding: 2.5rem;
  }
}

.dark .login-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
}

// Logo
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.logo {
  height: 3rem;
  width: auto;
}

// Welcome section
.welcome-section {
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.dark .welcome-title {
  color: #f1f5f9;
}

.welcome-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
}

.dark .welcome-subtitle {
  color: #94a3b8;
}

// Form
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dark .form-label {
  color: #d1d5db;
}

.form-input {
  display: block;
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  background: transparent;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #1f2937;
  outline: none;
  transition: all 0.2s ease;
  font-variant-numeric: tabular-nums;

  &::placeholder {
    color: #9ca3af;
    opacity: 0.6;
  }

  &:focus {
    border-color: var(--coral-500);
    box-shadow: 0 0 0 2px var(--coral-500), 0 0 0 4px rgba(34, 197, 139, 0.1);
  }

  &.error {
    border-color: #ef4444;

    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 2px #ef4444, 0 0 0 4px rgba(239, 68, 68, 0.1);
    }
  }
}

.dark .form-input {
  border-color: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: var(--coral-500);
  }
}

// Password input wrapper
.password-input-wrapper {
  position: relative;
}

.password-toggle-btn {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding-right: 1rem;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #6b7280;
  }

  &:focus {
    outline: none;
    color: var(--coral-500);
  }
}

.dark .password-toggle-btn {
  color: #9ca3af;

  &:hover {
    color: #d1d5db;
  }
}

// Error message
.error-message {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
}

// Form options
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.5rem 0;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remember-checkbox {
  :deep(.v-selection-control) {
    min-height: auto;
  }

  :deep(.v-checkbox .v-selection-control__input) {
    width: 1rem;
    height: 1rem;
  }
}

.remember-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.dark .remember-label {
  color: #d1d5db;
}

.forgot-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--coral-500);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--coral-600);
    text-decoration: underline;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--coral-500), 0 0 0 4px rgba(34, 197, 139, 0.1);
    border-radius: 0.25rem;
  }
}

// Submit button
.submit-container {
  margin-top: 1rem;
}

.submit-btn {
  width: 100%;
  border-radius: 0.75rem;
  border: none;
  font-weight: 600;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  // Light mode gradient
  background: linear-gradient(135deg, #22C58B 0%, #18A873 50%, #129164 100%) !important;
  color: #0B1220 !important;
  box-shadow: 0 4px 15px rgba(34, 197, 139, 0.3), 0 2px 8px rgba(34, 197, 139, 0.2);

  // Hover effect with enhanced gradient
  &:hover {
    background: linear-gradient(135deg, #18A873 0%, #129164 50%, #0F7A5A 100%) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(34, 197, 139, 0.4), 0 4px 12px rgba(34, 197, 139, 0.3);
  }

  // Active state
  &:active {
    transform: scale(0.98) translateY(-1px);
    box-shadow: 0 4px 15px rgba(34, 197, 139, 0.3), 0 2px 8px rgba(34, 197, 139, 0.2);
  }

  // Focus state
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(34, 197, 139, 0.3), 0 4px 15px rgba(34, 197, 139, 0.3), 0 2px 8px rgba(34, 197, 139, 0.2);
  }

  // Disabled state
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%) !important;
    color: #f8fafc !important;
    box-shadow: 0 2px 8px rgba(148, 163, 184, 0.2);
  }

  // Shimmer effect on hover
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
}

// Dark mode button adjustments
.dark .submit-btn {
  // Dark mode gradient - more vibrant for better contrast
  background: linear-gradient(135deg, #22C58B 0%, #18A873 50%, #129164 100%) !important;
  color: #0B1220 !important;
  box-shadow: 0 4px 15px rgba(34, 197, 139, 0.4), 0 2px 8px rgba(34, 197, 139, 0.3);

  &:hover {
    background: linear-gradient(135deg, #2DD4BF 0%, #22C58B 50%, #18A873 100%) !important;
    box-shadow: 0 8px 25px rgba(34, 197, 139, 0.5), 0 4px 12px rgba(34, 197, 139, 0.4);
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(34, 197, 139, 0.4), 0 4px 15px rgba(34, 197, 139, 0.4), 0 2px 8px rgba(34, 197, 139, 0.3);
  }

  &:disabled {
    background: linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%) !important;
    color: #9ca3af !important;
    box-shadow: 0 2px 8px rgba(55, 65, 81, 0.3);
  }
}

// Support section
.support-section {
  margin-top: 2rem;
  text-align: center;
}

.support-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .support-text {
  color: #9ca3af;
}

.support-link {
  font-weight: 500;
  color: var(--coral-500);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--coral-600);
    text-decoration: underline;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--coral-500), 0 0 0 4px rgba(34, 197, 139, 0.1);
    border-radius: 0.25rem;
  }
}

// Footer
.footer {
  margin-top: 2rem;
  text-align: center;
}

.footer-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .footer-text {
  color: #9ca3af;
}

// Animations
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive design
@media (max-width: 640px) {
  .coral-login-container {
    padding: 0.75rem;
  }

  .login-card {
    padding: 1.5rem;
  }

  .welcome-title {
    font-size: 1.25rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

@media (min-width: 768px) {
  .login-wrapper {
    max-width: 32rem; // 512px
  }

  .login-card {
    padding: 3rem;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .form-input {
    border-width: 2px;
  }

  .submit-btn {
    border: 2px solid var(--coral-700);
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
