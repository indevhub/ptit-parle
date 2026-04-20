
"use client"

import { useTranslation } from '@/context/TranslationContext';
import { cn } from '@/lib/utils';

interface TranslatedTextProps {
  fr: string;
  en: string;
  className?: string;
  enClassName?: string;
  inline?: boolean;
}

export function TranslatedText({ fr, en, className, enClassName, inline = false }: TranslatedTextProps) {
  const { showEnglish } = useTranslation();
  
  if (inline) {
    return (
      <span className={cn("inline", className)}>
        {fr} {showEnglish && <span className={cn("ml-1 font-normal italic", enClassName)}>({en})</span>}
      </span>
    );
  }

  return (
    <span className={cn("flex flex-col", className)}>
      <span>{fr}</span>
      {showEnglish && (
        <span className={cn("text-[0.85em] leading-tight font-medium animate-in fade-in slide-in-from-top-1 opacity-100", enClassName)}>
          {en}
        </span>
      )}
    </span>
  );
}
