'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronsUpDown, Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-colors w-full cursor-pointer relative">
      <Languages className="size-4.5 shrink-0 text-muted-foreground" strokeWidth={1.9} />
      <select
        title="Select Language"
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
        className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer w-full appearance-none absolute inset-0 opacity-0"
      >
        <option value="id">{t('lang.id')}</option>
        <option value="en">{t('lang.en')}</option>
      </select>
      <span className="text-sm font-medium text-foreground pointer-events-none flex-1">
        {language === 'id' ? t('lang.id') : t('lang.en')}
      </span>
      <ChevronsUpDown className="pointer-events-none ml-auto size-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
    </div>
  );
}
