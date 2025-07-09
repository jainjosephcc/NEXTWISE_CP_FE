<!-- ❗Errors in the form are set on line 60 -->
<script setup>
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import bitrageLogo from "@images/monzaee_logo.png"
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { themeConfig } from '@themeConfig'
import { VForm } from 'vuetify/components/VForm'
import AppTextField from "@core/components/app-form-elements/AppTextField.vue";

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const isPasswordVisible = ref(false)
const route = useRoute()
const router = useRouter()
const ability = useAbility()
const isSubmitLoading = ref(false)
const isSubmitDisabled = ref(false)
const isConfirmDialogVisible = ref(false)
const errors = ref({
  email: undefined,
  password: undefined,
})

const refVForm = ref()

const credentials = ref({
  email: '',
  password: '',
})

const rememberMe = ref(false)

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

    //console.log(res);

    //const { accessToken, userData, userAbilityRules } = res;


    //useCookie('userAbilityRules').value = res.result.userAbilityRules
    /* useCookie('userAbilityRules').value = [
    {
        "action": "manage",
        "subject": "all"
    }
]; */
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
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
  })
}


</script>


<template>
  <VRow no-gutters align="center" justify="center" class="bg-surface" style="height: 100vh;">
    <VCol cols="12" sm="4" md="4" lg="4">
      <VCard class="pa-4" elevation="10">
        <VCardText class="">
          <h1 class="mb-2 mt-5">Paperbot Trade Copier</h1>
          <h2 class="mb-2 mt-3 pt-3">Welcome Back! 👋🏻</h2>
          <p>Please sign in to your account</p>
        </VCardText>

        <VForm class="px-4" @submit.prevent="login">
          <VCol cols="12">
            <AppTextField
              v-model="credentials.email"
              label="Email"
              placeholder="you@example.com"
              :rules="[requiredValidator, emailValidator]"
              type="email"
              autofocus
            />
          </VCol>

          <VCol cols="12">
            <AppTextField
              v-model="credentials.password"
              label="Password"
              placeholder="········"
              :rules="[requiredValidator]"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
            />
          </VCol>

          <VCol cols="12" class="d-flex justify-space-between">
            <VCheckbox v-model="rememberMe" label="Remember me" />
            <a href="#" class="text-primary">Forgot Password?</a>
          </VCol>

          <VCol cols="12">
            <VBtn type="submit" block :loading="isSubmitLoading" color="primary">
              Sign In
            </VBtn>
          </VCol>

          <VCol cols="12" class="text-center text-body-2 mt-2">
            Need help?
            <a class="text-primary">Contact Support Team</a>
          </VCol>
        </VForm>

        <VCol cols="12" class="text-center text-caption mt-6">
          &copy; 2025 PaperBot Fintech Solutions
        </VCol>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";

.auth-card {
  max-width: 200px;
  margin: auto;
  padding: 24px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
}

</style>
