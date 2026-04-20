
"use client"

import { useTranslation } from '@/context/TranslationContext';
import { cn } from '@/lib/utils';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TranslatedTextProps {
  fr: string;
  en: string;
  className?: string;
  enClassName?: string;
  inline?: boolean;
}

/**
 * Renders bilingual text with built-in text-to-speech buttons for both languages.
 * English text matches the style and color of French text for high visibility.
 */
export function TranslatedText({ fr, en, className, enClassName, inline = false }: TranslatedTextProps) {
  const { showEnglish } = useTranslation();

  const playAudio = (text: string, lang: 'fr-FR' | 'en-US') => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;

      if (lang === 'en-US') {
        const voices = window.speechSynthesis.getVoices();
        // Priority list for female English voices
        const femaleVoice = voices.find(v => 
          v.lang.startsWith('en') && 
          (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google US English'))
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };
  
  const englishStyle = cn(
    "font-bold italic animate-in fade-in slide-in-from-top-1 text-inherit",
    inline ? "ml-1" : "text-[0.85em] leading-tight mt-1",
    enClassName
  );

  const PlayButton = ({ text, lang }: { text: string, lang: 'fr-FR' | 'en-US' }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-5 w-5 rounded-full hover:bg-primary/20 text-inherit p-0 ml-1 shrink-0 inline-flex items-center justify-center align-middle"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        playAudio(text, lang);
      }}
      title={`Play ${lang === 'fr-FR' ? 'French' : 'English'}`}
    >
      <Volume2 className="h-3 w-3" />
    </Button>
  );

  if (inline) {
    return (
      <span className={cn("inline-flex items-center flex-wrap align-baseline", className)}>
        <span className="inline-flex items-center">
          {fr}
          <PlayButton text={fr} lang="fr-FR" />
        </span>
        {showEnglish && (
          <span className={cn("inline-flex items-center", englishStyle)}>
            <span className="ml-1">({en})</span>
            <PlayButton text={en} lang="en-US" />
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={cn("flex flex-col", className)}>
      <span className="font-bold flex items-center">
        {fr}
        <PlayButton text={fr} lang="fr-FR" />
      </span>
      {showEnglish && (
        <span className={cn("flex items-center", englishStyle)}>
          {en}
          <PlayButton text={en} lang="en-US" />
        </span>
      )}
    </span>
  );
}
