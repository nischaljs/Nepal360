import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isNepali = i18n.language === 'ne';

  const toggle = () => {
    i18n.changeLanguage(isNepali ? 'en' : 'ne');
  };

  return (
    <button
      onClick={toggle}
      className="px-2.5 py-1 text-sm font-bold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700"
      title={isNepali ? 'Switch to English' : 'नेपालीमा बदल्नुहोस्'}
    >
      {isNepali ? 'EN' : 'ने'}
    </button>
  );
};

export default LanguageSwitcher;
