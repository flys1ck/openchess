<template>
  <div class="flex flex-1">
    <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <h1 class="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h1>
          <p class="mt-2 text-sm leading-6 text-gray-500">
            Not a member?
            <BaseLink to="/signup" class="ml-0.5">Create your new account here</BaseLink>
          </p>
        </div>

        <div class="mt-10">
          <form class="space-y-6" @submit.prevent="onSignIn">
            <BaseInputGroup
              v-model="signInFormData.email"
              label="Email address"
              type="email"
              :schema="signInFormSchema.shape.email"
            />
            <BaseInputGroup
              v-model="signInFormData.password"
              label="Password"
              type="password"
              :schema="signInFormSchema.shape.password"
            />
            <div class="flex items-center justify-between text-sm">
              <BaseCheckbox label="Remember me" name="remember-me" />
              <BaseLink to="/">Forgot password?</BaseLink>
            </div>
            <BaseButton type="submit" class="w-full">Sign in</BaseButton>
          </form>
          <div class="mt-6">
            <div class="flex items-center">
              <span class="border-t flex-grow" aria-hidden="true" />
              <div class="relative flex justify-center text-sm font-medium leading-6">
                <span class="px-6 text-gray-900">Or continue with</span>
              </div>
              <span class="border-t flex-grow" aria-hidden="true" />
            </div>

            <div class="mt-6 grid grid-cols-2 gap-4">
              <BaseButton variant="secondary" @click="sessionStore.signInWithGoogle">Google</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="relative hidden w-0 flex-1 lg:block">
      <img
        class="absolute inset-0 h-full w-full object-cover object-left"
        src="https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        alt="Close up of white king taking down black king. Hand and fingers and chess board with vintage look."
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import BaseCheckbox from "@components/base/BaseCheckbox.vue";
import BaseInputGroup from "@components/base/BaseInputGroup.vue";
import BaseLink from "@components/base/BaseLink.vue";
import { useSession } from "@stores/useSession";
import { reactive } from "vue";
import { definePage, useRouter } from "vue-router/auto";
import { z } from "zod";

definePage({
  meta: {
    layout: "empty",
  },
});

const router = useRouter();
const signInFormSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

const signInFormData = reactive({
  email: "",
  password: "",
});

async function onSignIn() {
  const res = signInFormSchema.safeParse(signInFormData);

  if (!res.success) return;
  await sessionStore.signInWithPassword(signInFormData.email, signInFormData.password);
  router.push("/analysis");
}

const sessionStore = useSession();
</script>
