/**
 * `main.ts` (App Bootstrap / Entry)
 *
 * - **कशासाठी**: Vue app create करून plugins (Pinia, Router) attach करणे आणि app mount करणे.
 * - **Project मधली role**: पूर्ण frontend app सुरू होण्याचा entry point.
 * - **Logic प्रकार**: app initialization + global CSS load.
 * - **File प्रकार**: frontend entry
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

// App mount (index.html मधल्या #app मध्ये render)
app.mount('#app')
