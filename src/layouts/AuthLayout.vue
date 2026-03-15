<template>
  <div class="auth-layout">
    <div class="auth-left">
      <div class="auth-left-content">
        <h1>🎓 Institute ERP</h1>
        <p>
          Smart Institute Management System to manage students, staff, fees, attendance, exams and
          reports efficiently.
        </p>
      </div>
    </div>

    <div class="auth-right">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.auth-left {
  flex: 1;
  background: linear-gradient(135deg, #4f46e5, #0ea5e9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

.auth-left::before,
.auth-left::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.35;
}

.auth-left::before {
  width: 260px;
  height: 260px;
  background: #a855f7;
  top: -40px;
  left: -40px;
}

.auth-left::after {
  width: 320px;
  height: 320px;
  background: #06b6d4;
  bottom: -80px;
  right: -80px;
}

.auth-left-content {
  position: relative;
  z-index: 2;
  max-width: 620px;
}

.auth-left h1 {
  font-size: 54px;
  margin-bottom: 20px;
  line-height: 1.1;
  font-weight: 800;
}

.auth-left p {
  font-size: 22px;
  line-height: 1.7;
  opacity: 0.96;
  max-width: 620px;
}

.auth-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

@media (max-width: 1100px) {
  .auth-layout {
    flex-direction: column;
  }

  .auth-left,
  .auth-right {
    width: 100%;
  }

  .auth-left {
    min-height: 38vh;
    padding: 40px 24px;
  }

  .auth-left h1 {
    font-size: 42px;
  }

  .auth-left p {
    font-size: 18px;
  }

  .auth-right {
    padding: 24px;
  }
}
</style>
