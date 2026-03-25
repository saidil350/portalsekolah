'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors w-full cursor-pointer relative">
      <Globe className="w-[18px] h-[18px] text-slate-500 shrink-0" strokeWidth={1.8} />
      <select
        title="Select Language"
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
        className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer w-full appearance-none absolute inset-0 opacity-0"
      >
        <option value="id">{t('lang.id')}</option>
        <option value="en">{t('lang.en')}</option>
      </select>
      <span className="text-sm font-medium text-slate-700 pointer-events-none flex-1">
        {language === 'id' ? t('lang.id') : t('lang.en')}
      </span>
      <div className="pointer-events-none w-0 h-0 border-l-4 border-r-4 border-t-[5px] border-l-transparent border-r-transparent border-t-slate-500 ml-auto shrink-0" />
    </div>
  );
}
