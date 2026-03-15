<template>
  <div class="landing-wrapper">
    <!-- Animated Background Shapes -->
    <div class="floating-shape shape1"></div>
    <div class="floating-shape shape2"></div>
    <div class="floating-shape shape3"></div>

    <!-- NAVBAR -->
    <header class="navbar">
      <div class="logo"></div>

      <nav class="nav-links">
        <router-link to="/auth/login" class="nav-btn primary">Login</router-link>
      </nav>
    </header>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-left">
        <h1>
          Institute Management
          <span class="highlight-text">ERP System</span>
        </h1>

        <p>
          Smart digital ecosystem for managing Students, Teachers, Fees, Attendance, Exams &
          Analytics — all inside one elegant dashboard.
        </p>

        <div class="cta-buttons">
          <router-link to="/auth/login" class="btn primary-btn">Get Started</router-link>

          <router-link to="/auth/register" class="btn ghost-btn">Create Account</router-link>
        </div>
      </div>

      <div class="hero-right">
        <div class="glass-card">
          <h3>Why Choose Our ERP?</h3>
          <ul>
            <li>✔ Smart Student Management</li>
            <li>✔ Real-time Attendance Tracking</li>
            <li>✔ Automated Fees Handling</li>
            <li>✔ Exam & Result Dashboard</li>
            <li>✔ Advanced Reports & Insights</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.landing-wrapper {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  background: radial-gradient(circle at top left, #4f46e5, #0ea5e9, #9333ea);
  padding: 40px 80px;
  box-sizing: border-box;
  color: white;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 15s infinite ease-in-out alternate;
}

.shape1 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  top: -100px;
  left: -100px;
}

.shape2 {
  width: 400px;
  height: 400px;
  background: #06b6d4;
  bottom: -150px;
  right: -150px;
}

.shape3 {
  width: 250px;
  height: 250px;
  background: #a855f7;
  top: 50%;
  left: 60%;
}

@keyframes float {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(40px);
  }
}

.navbar {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 80px;
  padding: 18px 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.nav-links {
  display: flex;
  gap: 14px;
  align-items: center;
}

.nav-btn {
  padding: 12px 28px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary {
  background: linear-gradient(135deg, #4f46e5, #0ea5e9);
  color: white;
  box-shadow: 0 10px 24px rgba(79, 70, 229, 0.28);
}

.primary:hover {
  transform: translateY(-3px);
  background: linear-gradient(135deg, #4338ca, #0284c7);
  box-shadow:
    0 16px 32px rgba(79, 70, 229, 0.32),
    0 0 22px rgba(14, 165, 233, 0.22);
}

.hero {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 60px;
  flex-wrap: wrap;
}

.hero-left {
  flex: 1;
  max-width: 600px;
}

.hero-left h1 {
  font-size: 54px;
  line-height: 1.2;
  margin-bottom: 20px;
}

.highlight-text {
  color: #ffffff;
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.6),
    0 0 20px rgba(255, 255, 255, 0.4),
    0 0 30px rgba(255, 255, 255, 0.2);
}

.hero-left p {
  font-size: 18px;
  line-height: 1.7;
  margin-bottom: 40px;
  opacity: 0.95;
}

.cta-buttons {
  display: flex;
  gap: 20px;
}

.btn {
  padding: 14px 32px;
  border-radius: 40px;
  font-weight: 600;
  text-decoration: none;
  transition: 0.3s ease;
}

.primary-btn {
  background: white;
  color: #4f46e5;
}

.primary-btn:hover {
  transform: scale(1.07);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
}

.ghost-btn {
  border: 2px solid white;
  color: white;
}

.ghost-btn:hover {
  background: white;
  color: #4f46e5;
}

.hero-right {
  flex: 1;
  display: flex;
  justify-content: center;
}

.glass-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(25px);
  padding: 45px;
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: transform 0.4s ease;
}

.glass-card:hover {
  transform: translateY(-10px);
}

.glass-card h3 {
  margin-bottom: 20px;
  font-size: 22px;
}

.glass-card ul {
  padding-left: 0;
  list-style: none;
}

.glass-card li {
  margin-bottom: 12px;
  font-size: 16px;
}

@media (max-width: 900px) {
  .landing-wrapper {
    padding: 24px;
  }

  .hero {
    flex-direction: column;
    text-align: center;
  }

  .cta-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .navbar {
    justify-content: center;
    padding: 20px;
  }

  .hero-left h1 {
    font-size: 42px;
  }
}
</style>
