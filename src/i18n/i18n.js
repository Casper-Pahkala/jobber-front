// i18n.js
import { createI18n } from 'vue-i18n';
import enMessages from '@/i18n/en';
import svMessages from '@/i18n/sv';

const i18n = createI18n({
  locale: (navigator.language || navigator.userLanguage) ?? 'en',
  fallbackLocale: 'fi',
  messages: {
    fi: {},
    en: enMessages,
    sv: svMessages
  },
});


export default i18n;
