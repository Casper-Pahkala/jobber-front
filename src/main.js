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
import './style.css';
import '@/styles/main.scss';
import i18n from '@/i18n/i18n';
const app = createApp(App)

registerPlugins(app)

app.use(VueTailwindDatepicker);

app.use(i18n).mount('#app');
