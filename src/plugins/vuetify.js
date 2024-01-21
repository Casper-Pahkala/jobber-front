/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import DateFnsAdapter from '@date-io/date-fns'
import enUS from 'date-fns/locale/en-US'
import fi from 'date-fns/locale/fi'
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
  date: {
    adapter: DateFnsAdapter,
    locale: {
      en: enUS,
      fi: fi,
    },
  },
})
