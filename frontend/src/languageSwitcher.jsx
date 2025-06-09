import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState(i18n.language);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng).then(() => {
      localStorage.setItem('i18nextLng', lng);
      window.location.reload(); // temp fix until fully reactive
    });
  };

  return (
    <div className="flex gap-2 text-sm z-10">
      <button
        onClick={() => changeLanguage('en')}
        className={selected === 'en' ? 'font-bold underline' : ''}
      >
        🇺🇸 EN
      </button>
      <button
        onClick={() => changeLanguage('fr')}
        className={selected === 'fr' ? 'font-bold underline' : ''}
      >
        🇫🇷 FR
      </button>
      <button
        onClick={() => changeLanguage('ht')}
        className={selected === 'ht' ? 'font-bold underline' : ''}
      >
        🇭🇹 HT
      </button>
    </div>
  );
}
