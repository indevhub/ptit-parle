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
      <span className={className}>
        {fr} {showEnglish && <span className={cn("text-muted-foreground ml-1 font-normal opacity-70 italic", enClassName)}>({en})</span>}
      </span>
    );
  }

  return (
    <span className={cn("flex flex-col", className)}>
      <span>{fr}</span>
      {showEnglish && (
        <span className={cn("text-[0.8em] leading-tight font-medium text-muted-foreground animate-in fade-in slide-in-from-top-1", enClassName)}>
          {en}
        </span>
      )}
    </span>
  );
}
