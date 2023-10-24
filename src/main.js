/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import VueTailwindDatepicker from "vue-tailwind-datepicker";
import './style.css'
const app = createApp(App)

registerPlugins(app)

app.use(VueTailwindDatepicker);

app.mount('#app')
