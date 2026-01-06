<script setup lang="ts">
import {type HTMLAttributes, ref} from "vue"

import {
  IconCheck,
  IconInnerShadowTop
} from '@tabler/icons-vue'
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import router from "@/router";
import {useAuthStore} from "@/stores/auth.ts";

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const username = ref('')
const validUsername = ref(true)
const email = ref('')
const validEmail = ref(true)
const password = ref('')
const confirmPassword = ref('')
const validPassword = ref(true)
const isLoading = ref(false)
const authStore = useAuthStore()
const serverError = ref('')

async function signup() {
  validateUsername()
  validateEmail()
  validatePassword()

  if (!validUsername.value || !validEmail.value || !validPassword.value) {
    return
  }

  isLoading.value = true
  serverError.value = ''

  try {
    await authStore.signup(username.value, email.value, password.value)
    await router.push('/dashboard')
  } catch (error: any) {
    serverError.value = error.message || 'Signup failed'
  } finally {
    isLoading.value = false
  }
}

function validateUsername() {
  if (username.value.length < 2 || username.value.length > 50) {
    validUsername.value = false
    return
  }
  if (!/^[a-zA-Z\s]+$/.test(username.value)) {
    validUsername.value = false
    return
  }
  validUsername.value = true
}

function validateEmail() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    validEmail.value = false
    return
  }
  validEmail.value = true
}

function validatePassword() {
  if (password.value.length < 8) {
    validPassword.value = false
    return
  }
  if (!/[A-Z]/.test(password.value) || !/[a-z]/.test(password.value) || !/\d/.test(password.value)) {
    validPassword.value = false
    return
  }
  if (password.value !== confirmPassword.value) {
    validPassword.value = false
    return
  }
  validPassword.value = true
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <form @submit.prevent="signup">
      <FieldGroup>
        <div class="flex flex-col items-center gap-2 text-center">
          <router-link
            to="#"
            class="flex flex-col items-center gap-2 font-medium"
          >
            <div class="flex size-8 items-center justify-center rounded-md">
              <IconInnerShadowTop class="size-6" />
            </div>
            <span class="sr-only">Project Manager</span>
          </router-link>
          <h1 class="text-xl font-bold">
            Welcome to Project Manager
          </h1>
          <FieldDescription>
            Already have an account?
            <router-link to="/auth/login">
              Sign in
            </router-link>
          </FieldDescription>
        </div>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" type="text" placeholder="Creamy Duck" required v-model="username" />
          <FieldDescription v-if="validUsername === false" class="text-destructive">
            Username must be between 2 and 50 characters and can only contain letters and spaces
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="email">
            Email
          </FieldLabel>
          <Input
              id="email"
              type="email"
              placeholder="creamy_duck2000@dmail.com"
              required
              v-model="email"
          />
          <FieldDescription v-if="validEmail === false" class="text-destructive">
            Email must be a valid format
          </FieldDescription>
        </Field>
        <Field>
          <Field class="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel for="password">
                Password
              </FieldLabel>
              <Input id="password" type="password" v-model="password" required />
            </Field>
            <Field>
              <FieldLabel for="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" required v-model="confirmPassword" />
            </Field>
          </Field>
          <FieldDescription class="flex flex-col gap-0.5">
            <div class="flex flex-row gap-1 items-center" :class="{ 'text-primary': password.length >= 8}">
              <IconCheck class="size-5 shrink-0"/>
              At least 8 characters long
            </div>
            <div class="flex flex-row gap-1 items-center" :class="{ 'text-primary': password.match(/[A-Z]/) && password.match(/[a-z]/) && password.match(/[0-9]/) }">
              <IconCheck class="size-5 shrink-0"/>
              Contains at least one uppercase letter, one lowercase letter, and one number
            </div>
            <div class="flex flex-row gap-1 items-center" :class="{ 'text-primary': password === confirmPassword && password.length >= 8}">
              <IconCheck class="size-5 shrink-0"/>
              Passwords match
            </div>
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" :disabled="isLoading">
            Create Account
          </Button>
          <FieldDescription v-if="serverError" class="text-destructive">
            {{ serverError }}
          </FieldDescription>
        </Field>
        <FieldSeparator>Or</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
              <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z"/>
            </svg>
            Continue with GitHub
          </Button>
        </Field>
      </FieldGroup>
    </form>
    <FieldDescription class="px-6 text-center">
      By clicking continue, you agree to our <router-link to="#">Terms of Service</router-link>
      and <router-link to="#">Privacy Policy</router-link>.
    </FieldDescription>
  </div>
</template>
