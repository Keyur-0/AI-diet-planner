export const languages = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
  },
  hi: {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिंदी',
  },
  gu: {
    code: 'gu',
    label: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
  },
};

export const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES = Object.keys(languages);

export const isValidLanguage = (code) => {
  return typeof code === 'string' && SUPPORTED_LANGUAGES.includes(code);
};
