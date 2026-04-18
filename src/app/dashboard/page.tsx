"use client"

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Sparkles, Languages } from 'lucide-react';
import { VOCABULARY } from '@/app/data/lessons';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/context/TranslationContext';
import { TranslatedText } from '@/components/TranslatedText';

export default function DashboardPage() {
  const [progress] = useState({ stars: 12, total: VOCABULARY.length, learned: 3 });
  const { showEnglish, toggleEnglish } = useTranslation();

  const getImageUrl = (id: string) => {
    return PlaceHolderImages.find(img => img.id === id)?.imageUrl || 'https://picsum.photos/seed/default/400/300';
  };

  return (
    <div className="pb-24 min-h-screen">
      <header className="p-6 md:p-10 bg-white card-shadow rounded-b-[3rem]">
        <div className="max-w-screen-md mx-auto flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary mb-1">
              <TranslatedText fr="Salut, Explorateur ! 👋" en="Hi, Explorer! 👋" />
            </h1>
            <p className="text-muted-foreground font-medium">
              <TranslatedText fr="Prêt pour une nouvelle aventure ?" en="Ready for a new adventure?" />
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleEnglish}
                className={`rounded-full border-2 transition-all ${showEnglish ? 'bg-primary border-primary text-white' : 'border-muted text-muted-foreground'}`}
              >
                <Languages className="h-5 w-5" />
              </Button>
            <div className="bg-primary/10 px-4 py-2 rounded-full flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-primary text-xl">{progress.stars}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-6 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <TranslatedText fr="Ton Progrès" en="Your Progress" />
            </h2>
            <span className="text-sm font-bold text-muted-foreground">
              {progress.learned}/{progress.total} <TranslatedText fr="mots" en="words" inline />
            </span>
          </div>
          <Card className="rounded-[2rem] border-none card-shadow bg-white overflow-hidden">
            <CardContent className="p-6">
              <Progress value={(progress.learned / progress.total) * 100} className="h-4 bg-muted" />
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                 {VOCABULARY.slice(0, 4).map((word) => (
                    <div key={word.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${progress.learned > Number(word.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                        {progress.learned > Number(word.id) ? '✓' : word.id}
                      </div>
                    </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">
            <TranslatedText fr="Continuer l'Apprentissage" en="Continue Learning" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VOCABULARY.slice(3, 5).map((word) => (
              <Link key={word.id} href={`/learning/${word.id}`}>
                <Card className="rounded-[2rem] border-none card-shadow bg-white overflow-hidden child-button cursor-pointer group">
                  <div className="relative h-40 w-full">
                    <Image
                      src={getImageUrl(word.imageId)}
                      alt={word.english}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      data-ai-hint={word.english}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="flex flex-col">
                        <h3 className="text-white text-2xl font-bold">
                          <TranslatedText fr={word.french} en={word.english} enClassName="text-white/80" />
                        </h3>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="bg-accent/10 p-6 rounded-[2rem] flex items-center gap-6">
            <div className="bg-accent h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0">
               <Trophy className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-accent">
                <TranslatedText fr="Défi du jour !" en="Daily Challenge!" />
              </h3>
              <p className="text-sm text-foreground/70">
                <TranslatedText fr="Apprends 3 nouveaux mots aujourd'hui pour gagner un badge spécial." en="Learn 3 new words today to earn a special badge." />
              </p>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
