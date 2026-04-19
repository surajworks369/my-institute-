<template>
  <!-- Register page: form shown in the auth layout right panel -->
  <div class="center-page">
    <div class="auth-card fade-in">
      <!-- Page heading / guidance -->
      <div class="card-head">
        <h2>Create Account</h2>
        <p>Create your ERP account and start managing your institute smartly.</p>
      </div>

      <!-- Register form submit: store register + redirect -->
      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label" for="register-name">Full Name</label>
          <input
            id="register-name"
            v-model.trim="name"
            type="text"
            class="form-control"
            placeholder="Enter your full name"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="register-email">Email</label>
          <input
            id="register-email"
            v-model.trim="email"
            type="email"
            class="form-control"
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="register-password">Password</label>
          <input
            id="register-password"
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Create password"
          />
        </div>

        <button type="submit" class="submit-btn">Register</button>
      </form>

      <!-- Login navigation link -->
      <p class="bottom-text">
        Already have an account?
        <router-link class="auth-link" to="/auth/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * `views/auth/RegisterPage.vue` (Register Page)
 *
 * - **Purpose**: Form to create a new account.
 * - **Role in project**: Handles registration at `/auth/register`.
 * - **Logic type**: Form state (refs), submit handler, `authStore.register`, router navigation.
 * - **File type**: View (frontend)
 *
 * Note: Registration currently saves demo users in localStorage; replace with a backend API later.
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Navigation
const router = useRouter()
// Auth store: register + session state
const authStore = useAuthStore()

// Form state
const name = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')

// Form submit handler: basic validation + register + dashboard redirect
const handleRegister = (): void => {
  if (!name.value || !email.value || !password.value) {
    alert('Please fill all fields')
    return
  }

  authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
    role: 'admin',
  })

  // After register, enter the main app
  router.push('/dashboard')
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 390px;
  padding: 24px 22px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.card-head {
  text-align: center;
  margin-bottom: 16px;
}

.card-head h2 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 800;
  color: #1f2937;
}

.card-head p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.45;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
}

.form-control {
  width: 100%;
  height: 44px;
  padding: 0 13px;
  border-radius: 12px;
  border: 1px solid #dbe3ee;
  background: rgba(255, 255, 255, 0.94);
  color: #1f2937;
  font-size: 14px;
  transition: all 0.25s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14);
}

.submit-btn {
  margin-top: 4px;
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.2);
  transition: all 0.25s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(79, 70, 229, 0.24);
}

.bottom-text {
  margin-top: 14px;
  text-align: center;
  font-size: 13px;
  color: #475569;
}

.auth-link {
  margin-left: 6px;
  color: #4f46e5;
  font-weight: 700;
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
  color: #3730a3;
}

@media (max-width: 600px) {
  .auth-card {
    max-width: 100%;
    padding: 20px 16px;
    border-radius: 18px;
  }

  .card-head h2 {
    font-size: 22px;
  }
}
</style>
