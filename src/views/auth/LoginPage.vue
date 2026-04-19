<template>
  <!-- Login page: form shown in the auth layout right panel -->
  <div class="center-page">
    <div class="auth-card fade-in">
      <!-- Page heading / guidance -->
      <div class="card-head">
        <h2>Login to ERP</h2>
        <p>Welcome back. Enter your credentials to continue.</p>
      </div>

      <!-- Login form submit: store login + redirect -->
      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="login-email">Email</label>
          <input
            id="login-email"
            v-model.trim="email"
            type="email"
            class="form-control"
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="login-password">Password</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" class="submit-btn">Login</button>
      </form>

      <!-- Register navigation link -->
      <p class="bottom-text">
        Don't have an account?
        <router-link class="auth-link" to="/auth/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * `views/auth/LoginPage.vue` (Login Page)
 *
 * - **Purpose**: Login form and redirect to the dashboard after success.
 * - **Role in project**: Entry point for auth at `/auth/login`.
 * - **Logic type**: Form state (refs), submit handler, `authStore.login`, router navigation.
 * - **File type**: View (frontend)
 *
 * Note: Login currently checks localStorage demo users; replace with a backend API call later.
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Navigation
const router = useRouter()
// Auth store: login + session state
const authStore = useAuthStore()

// Form state
const email = ref<string>('')
const password = ref<string>('')

// On load: initialize store; if already logged in, go straight to the dashboard
onMounted(() => {
  authStore.initialize()

  // Already authenticated — skip login
  if (authStore.isAuthenticated) {
    router.replace('/dashboard')
  }
})

// Form submit handler: basic validation + login attempt + redirect
const handleLogin = (): void => {
  if (!email.value || !password.value) {
    alert('Please enter email and password')
    return
  }

  const success: boolean = authStore.login(email.value, password.value)

  if (success) {
    // Use replace so the back button does not return to login
    router.replace('/dashboard')
  } else {
    alert('Invalid email or password')
  }
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 30px 26px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.card-head {
  text-align: center;
  margin-bottom: 20px;
}

.card-head h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
}

.card-head p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
}

.form-control {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border-radius: 14px;
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
  margin-top: 6px;
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  box-shadow: 0 14px 28px rgba(59, 130, 246, 0.2);
  transition: all 0.25s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(79, 70, 229, 0.24);
}

.bottom-text {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
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
    padding: 24px 18px;
    border-radius: 20px;
  }

  .card-head h2 {
    font-size: 24px;
  }
}
</style>
