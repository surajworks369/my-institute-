import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Global CSS Import
import './assets/css/global.css'
import './assets/css/reset.css'
import './assets/css/layout.css'
import './assets/css/components.css'

const app = createApp(App)

// Pinia Setup
const pinia = createPinia()
app.use(pinia)

app.use(router)

app.mount('#app')
