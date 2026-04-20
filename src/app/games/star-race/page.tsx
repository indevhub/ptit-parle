
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { VOCABULARY, VocabularyWord } from '@/app/data/lessons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Star, Timer, Trophy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { TranslatedText } from '@/components/TranslatedText';

export default function StarRacePage() {
  const [targetWord, setTargetWord] = useState<VocabularyWord | null>(null);
  const [options, setOptions] = useState<VocabularyWord[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const { toast } = useToast();

  const startNewRound = useCallback(() => {
    const shuffled = [...VOCABULARY].sort(() => 0.5 - Math.random());
    const selectedOptions = shuffled.slice(0, 4);
    const target = selectedOptions[Math.floor(Math.random() * 4)];
    setTargetWord(target);
    setOptions(selectedOptions);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameState('ended');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
    startNewRound();
  };

  const handleSelect = (wordId: string) => {
    if (gameState !== 'playing') return;

    if (wordId === targetWord?.id) {
      setScore(s => s + 1);
      startNewRound();
    } else {
      toast({
        variant: "destructive",
        title: <TranslatedText fr="Oups !" en="Oops!" inline />,
        duration: 1000,
      });
      setTimeLeft(prev => Math.max(0, prev - 2));
    }
  };

  const getPlaceholderData = (id: string) => {
    const placeholder = PlaceHolderImages.find(img => img.id === id);
    return {
      url: placeholder?.imageUrl || `https://picsum.photos/seed/${id}/400/400`,
      hint: placeholder?.imageHint || id
    };
  };

  if (gameState === 'idle') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6 bg-yellow-50/30">
        <div className="bg-white p-10 rounded-[3rem] card-shadow max-w-sm w-full space-y-6">
          <div className="bg-yellow-100 h-24 w-24 rounded-[2rem] flex items-center justify-center mx-auto">
            <Timer className="h-12 w-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            <TranslatedText fr="Course aux Étoiles" en="Star Race" />
          </h1>
          <p className="text-muted-foreground font-medium">
            <TranslatedText fr="Trouve le plus de mots possible en 60 secondes !" en="Find as many words as you can in 60 seconds!" />
          </p>
          <Button onClick={startGame} className="w-full rounded-full py-8 text-2xl bg-yellow-500 hover:bg-yellow-600 child-button shadow-lg">
            <TranslatedText fr="C'est parti !" en="Let's Go!" />
          </Button>
        </div>
        <Link href="/games" className="text-primary font-bold hover:underline">
          <TranslatedText fr="Retour" en="Back" />
        </Link>
      </div>
    );
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6 bg-yellow-50/30">
        <div className="bg-white p-12 rounded-[3rem] card-shadow max-w-sm w-full text-center space-y-6">
          <Trophy className="h-20 w-20 text-yellow-500 mx-auto" />
          <h1 className="text-4xl font-bold text-primary">
            <TranslatedText fr="Temps écoulé !" en="Time's Up!" />
          </h1>
          <div className="flex items-center justify-center gap-3 bg-yellow-50 py-4 rounded-3xl">
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            <span className="text-5xl font-black text-yellow-700">{score}</span>
          </div>
          <p className="font-bold text-muted-foreground">
            <TranslatedText fr="Tu as gagné beaucoup d'étoiles !" en="You earned many stars!" />
          </p>
          <Button onClick={startGame} className="w-full rounded-full py-8 text-2xl bg-primary hover:bg-primary/90 child-button">
            <TranslatedText fr="Rejouer" en="Play Again" />
          </Button>
        </div>
        <Link href="/games" className="text-primary font-bold hover:underline">
          <TranslatedText fr="Quitter" en="Exit" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen bg-yellow-50/20">
      <div className="max-w-screen-md mx-auto p-6 flex flex-col h-full">
        <header className="flex items-center justify-between mb-8">
          <div className="bg-white p-4 rounded-2xl card-shadow flex items-center gap-3">
            <Timer className={`h-6 w-6 ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-primary'}`} />
            <span className={`text-2xl font-black ${timeLeft < 10 ? 'text-destructive' : 'text-primary'}`}>
              {timeLeft}<TranslatedText fr="s" en="s" inline />
            </span>
          </div>
          <div className="bg-yellow-100 px-6 py-2 rounded-full flex items-center gap-2 border-2 border-yellow-200">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="font-black text-yellow-700 text-2xl">{score}</span>
          </div>
        </header>

        <main className="flex-1 space-y-8">
          <div className="text-center p-8 bg-white rounded-[2.5rem] card-shadow border-4 border-primary/10">
            <h2 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tight">
              {targetWord?.french}
            </h2>
            <p className="text-muted-foreground mt-2 font-bold italic">
              <TranslatedText fr="Trouve l'image !" en="Find the image!" inline />
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((word) => (
              <Card
                key={word.id}
                onClick={() => handleSelect(word.id)}
                className="rounded-[2.5rem] border-none card-shadow bg-white overflow-hidden child-button cursor-pointer h-44 relative group ring-4 ring-transparent hover:ring-primary/20 transition-all"
              >
                <Image
                  src={getPlaceholderData(word.imageId).url}
                  alt="Option"
                  fill
                  sizes="(max-width: 768px) 50vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform"
                  data-ai-hint={getPlaceholderData(word.imageId).hint}
                />
              </Card>
            ))}
          </div>
        </main>
      </div>
      <Navigation />
    </div>
  );
}
