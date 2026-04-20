
"use client"

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { VOCABULARY, VocabularyWord } from '@/app/data/lessons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { TranslatedText } from '@/components/TranslatedText';

export default function MysteryWordsPage() {
  const [targetWord, setTargetWord] = useState<VocabularyWord | null>(null);
  const [options, setOptions] = useState<VocabularyWord[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const { toast } = useToast();

  const startNewRound = () => {
    const shuffled = [...VOCABULARY].sort(() => 0.5 - Math.random());
    const selectedOptions = shuffled.slice(0, 4);
    const target = selectedOptions[Math.floor(Math.random() * 4)];
    setTargetWord(target);
    setOptions(selectedOptions);
  };

  useEffect(() => {
    startNewRound();
  }, []);

  const handleSelect = (wordId: string) => {
    if (wordId === targetWord?.id) {
      setScore(s => s + 1);
      toast({
        title: <TranslatedText fr="Gagné !" en="You won!" inline />,
        description: <TranslatedText fr="C'est le bon mot !" en="That's the right word!" inline />,
      });
      if (score >= 4) {
        setGameState('won');
      } else {
        startNewRound();
      }
    } else {
      toast({
        variant: "destructive",
        title: <TranslatedText fr="Oups !" en="Oops!" inline />,
        description: <TranslatedText fr="Essaie encore !" en="Try again!" inline />,
      });
    }
  };

  const getPlaceholderData = (id: string) => {
    const placeholder = PlaceHolderImages.find(img => img.id === id);
    return {
      url: placeholder?.imageUrl || `https://picsum.photos/seed/${id}/600/600`,
      hint: placeholder?.imageHint || id
    };
  };

  if (gameState === 'won') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6 bg-accent/5">
        <div className="bg-white p-12 rounded-[3rem] card-shadow max-w-sm w-full">
          <PartyPopper className="h-24 w-24 text-accent mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-primary mb-4">
            <TranslatedText fr="Incroyable !" en="Amazing!" />
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            <TranslatedText fr="Tu connais très bien tes mots !" en="You know your words very well!" />
          </p>
          <Button onClick={() => { setScore(0); setGameState('playing'); startNewRound(); }} className="w-full rounded-full py-8 text-2xl bg-accent hover:bg-accent/90 child-button">
            <TranslatedText fr="Rejouer" en="Play Again" />
          </Button>
        </div>
        <Link href="/games" className="text-primary font-bold hover:underline">
          <TranslatedText fr="Retour aux jeux" en="Back to games" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen">
      <div className="max-w-screen-md mx-auto p-6 flex flex-col h-full">
        <header className="flex items-center justify-between mb-8">
          <Link href="/games" className="p-3 bg-white rounded-2xl card-shadow child-button">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Link>
          <div className="bg-accent/10 px-6 py-2 rounded-full flex items-center gap-2">
            <span className="font-bold text-accent text-lg">
              <TranslatedText fr={`Score: ${score}/5`} en={`Score: ${score}/5`} inline />
            </span>
          </div>
          <button onClick={startNewRound} className="p-3 bg-white rounded-2xl card-shadow child-button">
            <RotateCcw className="h-6 w-6 text-muted-foreground" />
          </button>
        </header>

        <main className="flex-1 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              <TranslatedText fr="Quel est ce mot ?" en="What is this word?" />
            </h2>
          </div>

          {targetWord && (
            <div className="relative aspect-square w-full max-w-sm mx-auto rounded-[3rem] overflow-hidden card-shadow bg-white ring-8 ring-white">
              <Image
                src={getPlaceholderData(targetWord.imageId).url}
                alt="Mystery Image"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                data-ai-hint={getPlaceholderData(targetWord.imageId).hint}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4">
            {options.map((word) => (
              <Button
                key={word.id}
                onClick={() => handleSelect(word.id)}
                variant="outline"
                className="h-20 rounded-[1.5rem] text-xl font-bold border-2 hover:bg-accent hover:text-white hover:border-accent child-button card-shadow"
              >
                <TranslatedText fr={word.french} en={word.english} />
              </Button>
            ))}
          </div>
        </main>
      </div>
      <Navigation />
    </div>
  );
}
