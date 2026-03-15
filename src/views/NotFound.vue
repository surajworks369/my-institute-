<template>
  <div class="h-screen flex flex-col items-center justify-center bg-gray-100">
    <h1 class="text-6xl font-bold text-indigo-600">404</h1>
    <p class="mt-4 text-xl text-gray-700">Page Not Found</p>

    <router-link
      to="/dashboard"
      class="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
    >
      Go Back to Dashboard
    </router-link>
  </div>
</template>

<script setup lang="ts"></script>
