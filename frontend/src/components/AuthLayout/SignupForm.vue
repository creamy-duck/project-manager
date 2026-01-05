<script setup lang="ts">
import type { HTMLAttributes } from "vue"

import { IconInnerShadowTop } from '@tabler/icons-vue'
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

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <form>
      <FieldGroup>
        <div class="flex flex-col items-center gap-2 text-center">
          <a
            href="#"
            class="flex flex-col items-center gap-2 font-medium"
          >
            <div class="flex size-8 items-center justify-center rounded-md">
              <IconInnerShadowTop class="size-6" />
            </div>
            <span class="sr-only">Project Manager</span>
          </a>
          <h1 class="text-xl font-bold">
            Welcome to Project Manager
          </h1>
          <FieldDescription>
            Already have an account?
            <a href="/auth/login">
              Sign in
            </a>
          </FieldDescription>
        </div>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" type="text" placeholder="Creamy Duck" required />
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
          />
        </Field>
        <Field>
          <Field class="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel for="password">
                Password
              </FieldLabel>
              <Input id="password" type="password" required />
            </Field>
            <Field>
              <FieldLabel for="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
            </Field>
          </Field>
          <!--TODO: Implement password strength check-->
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit">
            Create Account
          </Button>
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
      By clicking continue, you agree to our <a href="#">Terms of Service</a>
      and <a href="#">Privacy Policy</a>.
    </FieldDescription>
  </div>
</template>
