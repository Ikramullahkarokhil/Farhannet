import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import da from "./da.json";
import pa from "./pa.json";

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    da: { translation: da },
    pa: { translation: pa },
  },
  lng: "da",
  fallbackLng: "da",
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
