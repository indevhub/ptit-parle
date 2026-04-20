
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

/**
 * Renders bilingual text. Ensures English text matches the color and style 
 * of French text for visibility on all backgrounds.
 */
export function TranslatedText({ fr, en, className, enClassName, inline = false }: TranslatedTextProps) {
  const { showEnglish } = useTranslation();
  
  if (inline) {
    return (
      <span className={cn("inline", className)}>
        {fr} {showEnglish && <span className={cn("ml-1 font-bold italic", enClassName)}>({en})</span>}
      </span>
    );
  }

  return (
    <span className={cn("flex flex-col", className)}>
      <span className="font-bold">{fr}</span>
      {showEnglish && (
        <span className={cn("text-[0.85em] leading-tight font-bold italic animate-in fade-in slide-in-from-top-1", enClassName)}>
          {en}
        </span>
      )}
    </span>
  );
}
