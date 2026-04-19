/**
 * `main.ts` (App Bootstrap / Entry)
 *
 * - **Purpose**: Create the Vue app, attach plugins (Pinia, Router), and mount the app.
 * - **Role in project**: Entry point for the entire frontend application.
 * - **Logic type**: App initialization + global CSS load.
 * - **File type**: Frontend entry
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Global CSS (app-wide styles / resets / layout helpers)
import './assets/css/global.css'
import './assets/css/reset.css'
import './assets/css/layout.css'
import './assets/css/components.css'

// Root Vue app instance
const app = createApp(App)

// Pinia store setup (global state management)
const pinia = createPinia()
app.use(pinia)

// Router setup (navigation + route views)
app.use(router)

// App mount (render into `#app` from index.html)
app.mount('#app')
