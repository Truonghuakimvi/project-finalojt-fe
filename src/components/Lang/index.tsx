import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./lang.css";

type Language = {
  code: string;
  lang: string;
};

const languages: Language[] = [
  { code: "en", lang: "EN" },
  { code: "vi", lang: "VN" },
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <div className="btn-container">
      {languages.map((lng) => (
        <button
          className={lng.code === i18n.language ? "selected" : ""}
          key={lng.code}
          onClick={() => changeLanguage(lng.code)}
        >
          {lng.lang}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
