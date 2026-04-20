
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
 * Renders bilingual text. English text strictly matches the color and style 
 * of French text for visibility on all backgrounds.
 */
export function TranslatedText({ fr, en, className, enClassName, inline = false }: TranslatedTextProps) {
  const { showEnglish } = useTranslation();
  
  // We ensure the English text inherits the exact same color as the French text
  // by using text-inherit and bold styling. No grey/muted colors are allowed.
  const englishStyle = cn(
    "font-bold italic animate-in fade-in slide-in-from-top-1 text-inherit",
    inline ? "ml-1" : "text-[0.85em] leading-tight mt-1",
    enClassName
  );

  if (inline) {
    return (
      <span className={cn("inline", className)}>
        <span>{fr}</span>
        {showEnglish && (
          <span className={englishStyle}>({en})</span>
        )}
      </span>
    );
  }

  return (
    <span className={cn("flex flex-col", className)}>
      <span className="font-bold">{fr}</span>
      {showEnglish && (
        <span className={englishStyle}>
          {en}
        </span>
      )}
    </span>
  );
}
