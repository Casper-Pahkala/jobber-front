// i18n.js
import { createI18n } from 'vue-i18n';
import enMessages from '@/i18n/en';
import svMessages from '@/i18n/sv';


const supportedLocales = ['sv', 'et', 'fi'];

// Function to get the initial locale
function getInitialLocale() {
  // Check if a locale is stored in localStorage
  const storedLocale = localStorage.getItem('locale');
  if (storedLocale) return storedLocale;
  // Get browser's locale
  const browserLocale = navigator.language || navigator.userLanguage;
  // If the browser's locale is one of the supported locales, use it
  if (supportedLocales.includes(browserLocale)) {
    return browserLocale;
  }
  // Default to English
  return 'en';
}

const i18n = createI18n({
  // legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'fi',
  messages: {
    fi: {},
    en: enMessages,
    sv: svMessages
  },
});


export default i18n;
