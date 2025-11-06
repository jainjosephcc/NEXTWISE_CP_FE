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
          <img :src="isDarkMode ? '/light_logo.svg' : '/dark_logo.svg'" alt="Copy Trader" class="logo">
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
@import "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";

// Coral Markets Brand Colors
:root {
  --coral-50: #f0fdf4;
  --coral-100: #fee2e2;
  --coral-200: #fecaca;
  --coral-300: #fca5a5;
  --coral-400: #f87171;
  --coral-500: #f16326;
  --coral-600: #e05520;
  --coral-700: #cf470d;
  --coral-800: #b83d0a;
  --coral-900: #a13308;
  --ink-50: #f8fafc;
  --ink-100: #f1f5f9;
  --ink-200: #e2e8f0;
  --ink-300: #cbd5e1;
  --ink-400: #94a3b8;
  --ink-500: #64748b;
  --ink-600: #475569;
  --ink-700: #334155;
  --ink-800: #1e293b;
  --ink-900: #0b1220;
}

// Main container
.coral-login-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 50%, #f1f5f9 100%);
  font-family: Inter, system-ui, sans-serif;
  min-block-size: 100vh;
  transition: background 0.3s ease;

  // Dark mode
  &.dark {
    background: linear-gradient(135deg, #0b1220 0%, #0b1220 50%, #0b1220 100%);

    &::before {
      position: absolute;
      background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 2%) 1px, transparent 0);
      background-size: 20px 20px;
      content: "";
      inset: 0;
      pointer-events: none;
    }
  }
}

// Background
.login-background {
  position: absolute;
  z-index: 0;
  inset: 0;
}

// Main wrapper
.login-wrapper {
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.3s ease-out;
  inline-size: 100%;
  max-inline-size: 28rem; // 448px
}

// Theme toggle
.theme-toggle-container {
  display: flex;
  justify-content: flex-end;
  margin-block-end: 1.5rem;
}

.theme-toggle-btn {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 80%);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 100%);
    transform: translateY(-1px);
  }

  &:focus {
    box-shadow: 0 0 0 2px var(--coral-500), 0 0 0 4px rgba(34, 197, 139, 10%);
    outline: none;
  }

  .theme-icon {
    color: #64748b;
  }
}

// Dark mode theme toggle
.dark .theme-toggle-btn {
  border-color: rgba(255, 255, 255, 10%);
  background: rgba(255, 255, 255, 10%);

  &:hover {
    background: rgba(255, 255, 255, 20%);
  }

  .theme-icon {
    color: #94a3b8;
  }
}

// Login card
.login-card {
  padding: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 10%), 0 4px 6px -2px rgba(0, 0, 0, 5%);
  transition: all 0.3s ease;

  @media (min-width: 640px) {
    padding: 2.5rem;
  }
}

.dark .login-card {
  border-color: rgba(255, 255, 255, 10%);
  backdrop-filter: blur(8px);
  background: rgba(15, 23, 42, 80%);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 40%);
}

// Logo
.logo-container {
  display: flex;
  justify-content: center;
  margin-block-end: 2rem;
}

.logo {
  block-size: 3rem;
  inline-size: auto;
}

// Welcome section
.welcome-section {
  margin-block-end: 2rem;
  text-align: center;
}

.welcome-title {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-block-end: 0.5rem;
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
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  margin-block-end: 0.5rem;
}

.dark .form-label {
  color: #d1d5db;
}

.form-input {
  display: block;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background: transparent;
  color: #1f2937;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  inline-size: 100%;
  outline: none;
  padding-block: 0.75rem;
  padding-inline: 1rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: #9ca3af;
    opacity: 0.6;
  }

  &:focus {
    border-color: var(--coral-500);
    box-shadow: 0 0 0 2px var(--coral-500), 0 0 0 4px rgba(34, 197, 139, 10%);
  }

  &.error {
    border-color: #ef4444;

    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 2px #ef4444, 0 0 0 4px rgba(239, 68, 68, 10%);
    }
  }
}

.dark .form-input {
  border-color: rgba(255, 255, 255, 10%);
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
  display: flex;
  align-items: center;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  inset-block: 0;
  inset-inline-end: 0;
  padding-inline-end: 1rem;
  transition: color 0.2s ease;

  &:hover {
    color: #6b7280;
  }

  &:focus {
    color: var(--coral-500);
    outline: none;
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
  color: #ef4444;
  font-size: 0.75rem;
  margin-block-start: 0.25rem;
}

// Form options
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block: 0.5rem;
  margin-inline: 0;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remember-checkbox {
  :deep(.v-selection-control) {
    min-block-size: auto;
  }

  :deep(.v-checkbox .v-selection-control__input) {
    block-size: 1rem;
    inline-size: 1rem;
  }
}

.remember-label {
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
}

.dark .remember-label {
  color: #d1d5db;
}

.forgot-link {
  color: var(--coral-500);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--coral-600);
    text-decoration: underline;
  }

  &:focus {
    border-radius: 0.25rem;
    box-shadow: 0 0 0 2px var(--coral-500), 0 0 0 4px rgba(34, 197, 139, 10%);
    outline: none;
  }
}

// Submit button
.submit-container {
  margin-block-start: 1rem;
}

.submit-btn {
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 0.75rem;

  // Light mode gradient
  background: linear-gradient(135deg, #f16326 0%, #e05520 50%, #cf470d 100%) !important;
  box-shadow: 0 4px 15px rgba(241, 99, 38, 30%), 0 2px 8px rgba(241, 99, 38, 20%);
  color: #fff !important;
  font-weight: 600;
  inline-size: 100%;
  padding-block: 0.75rem;
  padding-inline: 1rem;
  transition: all 0.3s ease;

  // Hover effect with enhanced gradient
  &:hover {
    background: linear-gradient(135deg, #e05520 0%, #cf470d 50%, #b83d0a 100%) !important;
    box-shadow: 0 8px 25px rgba(241, 99, 38, 40%), 0 4px 12px rgba(241, 99, 38, 30%);
    transform: translateY(-2px);
  }

  // Active state
  &:active {
    box-shadow: 0 4px 15px rgba(241, 99, 38, 30%), 0 2px 8px rgba(241, 99, 38, 20%);
    transform: scale(0.98) translateY(-1px);
  }

  // Focus state
  &:focus {
    box-shadow: 0 0 0 3px rgba(241, 99, 38, 30%), 0 4px 15px rgba(241, 99, 38, 30%), 0 2px 8px rgba(241, 99, 38, 20%);
    outline: none;
  }

  // Disabled state
  &:disabled {
    background: linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%) !important;
    box-shadow: 0 2px 8px rgba(148, 163, 184, 20%);
    color: #f8fafc !important;
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  // Shimmer effect on hover
  &::before {
    position: absolute;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 20%), transparent);
    block-size: 100%;
    content: "";
    inline-size: 100%;
    inset-block-start: 0;
    inset-inline-start: -100%;
    transition: inset-inline-start 0.5s ease;
  }

  &:hover::before {
    inset-inline-start: 100%;
  }
}

// Dark mode button adjustments
.dark .submit-btn {
  // Dark mode gradient - more vibrant for better contrast
  background: linear-gradient(135deg, #f16326 0%, #e05520 50%, #cf470d 100%) !important;
  box-shadow: 0 4px 15px rgba(241, 99, 38, 40%), 0 2px 8px rgba(241, 99, 38, 30%);
  color: #fff !important;

  &:hover {
    background: linear-gradient(135deg, #ff7a3d 0%, #f16326 50%, #e05520 100%) !important;
    box-shadow: 0 8px 25px rgba(241, 99, 38, 50%), 0 4px 12px rgba(241, 99, 38, 40%);
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(241, 99, 38, 40%), 0 4px 15px rgba(241, 99, 38, 40%), 0 2px 8px rgba(241, 99, 38, 30%);
  }

  &:disabled {
    background: linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%) !important;
    box-shadow: 0 2px 8px rgba(55, 65, 81, 30%);
    color: #9ca3af !important;
  }
}

// Support section
.support-section {
  margin-block-start: 2rem;
  text-align: center;
}

.support-text {
  color: #6b7280;
  font-size: 0.75rem;
}

.dark .support-text {
  color: #9ca3af;
}

.support-link {
  color: var(--coral-500);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--coral-600);
    text-decoration: underline;
  }

  &:focus {
    border-radius: 0.25rem;
    box-shadow: 0 0 0 2px var(--coral-500), 0 0 0 4px rgba(34, 197, 139, 10%);
    outline: none;
  }
}

// Footer
.footer {
  margin-block-start: 2rem;
  text-align: center;
}

.footer-text {
  color: #6b7280;
  font-size: 0.75rem;
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
    max-inline-size: 32rem; // 512px
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
