import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ht from './locales/ht.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ht: { translation: ht }
    },
    lng: localStorage.getItem('i18nextLng') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
