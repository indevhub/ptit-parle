"use client"

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Sparkles, Languages } from 'lucide-react';
import { VOCABULARY } from '@/app/data/lessons';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/context/TranslationContext';

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
            <Tooltip>
              <TooltipTrigger asChild>
                <h1 className="text-3xl font-bold text-primary mb-1 cursor-help">Salut, Explorateur ! 👋</h1>
              </TooltipTrigger>
              <TooltipContent>Hi, Explorer!</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-muted-foreground font-medium cursor-help">Prêt pour une nouvelle aventure ?</p>
              </TooltipTrigger>
              <TooltipContent>Ready for a new adventure?</TooltipContent>
            </Tooltip>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <h2 className="text-xl font-bold flex items-center gap-2 cursor-help">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Ton Progrès
                </h2>
              </TooltipTrigger>
              <TooltipContent>Your Progress</TooltipContent>
            </Tooltip>
            <span className="text-sm font-bold text-muted-foreground">{progress.learned}/{progress.total} mots</span>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <h2 className="text-xl font-bold mb-4 cursor-help">Continuer l'Apprentissage</h2>
            </TooltipTrigger>
            <TooltipContent>Continue Learning</TooltipContent>
          </Tooltip>
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
                      <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">{word.english}</p>
                      <div className="flex flex-col">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3 className="text-white text-2xl font-bold cursor-help">{word.french}</h3>
                          </TooltipTrigger>
                          <TooltipContent>{word.english}</TooltipContent>
                        </Tooltip>
                        {showEnglish && <p className="text-white/80 text-sm font-medium">{word.english}</p>}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-accent/10 p-6 rounded-[2rem] flex items-center gap-6 cursor-help">
                <div className="bg-accent h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0">
                   <Trophy className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-accent">Défi du jour !</h3>
                  <p className="text-sm text-foreground/70">Apprends 3 nouveaux mots aujourd'hui pour gagner un badge spécial.</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-center">
              Daily Challenge! Learn 3 new words today to earn a special badge.
            </TooltipContent>
          </Tooltip>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
