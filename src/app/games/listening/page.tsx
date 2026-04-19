
"use client"

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { VOCABULARY, VocabularyWord } from '@/app/data/lessons';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslation } from '@/context/TranslationContext';

export default function ListeningGamePage() {
  const [targetWord, setTargetWord] = useState<VocabularyWord | null>(null);
  const [options, setOptions] = useState<VocabularyWord[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const { toast } = useToast();
  const { showEnglish } = useTranslation();

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
        title: showEnglish ? "Magnifique ! (Magnificent!)" : "Magnifique !",
        description: showEnglish ? "Tu as trouvé le bon mot ! (You found the right word!)" : "Tu as trouvé le bon mot !",
      });
      if (score >= 4) {
        setGameState('won');
      } else {
        startNewRound();
      }
    } else {
      toast({
        title: showEnglish ? "Oups ! (Oops!)" : "Oups !",
        description: showEnglish ? "Essaie encore, tu peux le faire ! (Try again, you can do it!)" : "Essaie encore, tu peux le faire !",
        variant: "destructive",
      });
    }
  };

  const getPlaceholderData = (id: string) => {
    const placeholder = PlaceHolderImages.find(img => img.id === id);
    return {
      url: placeholder?.imageUrl || `https://picsum.photos/seed/${id}/400/300`,
      hint: placeholder?.imageHint || id
    };
  };

  if (gameState === 'won') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6">
        <div className="bg-primary/20 p-8 rounded-[3rem] card-shadow">
          <PartyPopper className="h-20 w-20 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-primary mb-2">
            <TranslatedText fr="Félicitations !" en="Congratulations!" />
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            <TranslatedText fr="Tu as terminé le défi d'écoute avec brio." en="You finished the listening challenge brilliantly." />
          </p>
          <Button onClick={() => { setScore(0); setGameState('playing'); startNewRound(); }} className="rounded-full px-8 py-6 h-auto text-xl bg-primary hover:bg-primary/90 child-button">
            <TranslatedText fr="Rejouer" en="Play Again" />
          </Button>
        </div>
        <Link href="/dashboard" className="text-primary font-bold hover:underline">
          <TranslatedText fr="Retour à l'accueil" en="Back to Home" />
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
          <div className="bg-primary/10 px-4 py-2 rounded-full flex items-center gap-2">
            <span className="font-bold text-primary uppercase text-sm">Score: {score}</span>
          </div>
          <button onClick={startNewRound} className="p-3 bg-white rounded-2xl card-shadow child-button">
            <RotateCcw className="h-6 w-6 text-muted-foreground" />
          </button>
        </header>

        <main className="flex-1 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">
              <TranslatedText fr="Écoute et choisis l'image !" en="Listen and choose the image!" />
            </h2>
            {targetWord && <AudioPlayer text={targetWord.french} />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((word) => {
              const imgData = getPlaceholderData(word.imageId);
              return (
                <Card
                  key={word.id}
                  onClick={() => handleSelect(word.id)}
                  className="rounded-[2rem] border-none card-shadow bg-white overflow-hidden child-button cursor-pointer group h-48 relative"
                >
                  <Image
                    src={imgData.url}
                    alt={word.english}
                    fill
                    sizes="(max-width: 768px) 50vw, 400px"
                    className="object-cover group-hover:scale-105 transition-transform"
                    data-ai-hint={imgData.hint}
                  />
                </Card>
              );
            })}
          </div>
        </main>
      </div>
      <Navigation />
    </div>
  );
}
