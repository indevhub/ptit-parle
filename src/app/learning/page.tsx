"use client"

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { VOCABULARY } from '@/app/data/lessons';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/context/TranslationContext';

export default function LearningListPage() {
  const { showEnglish } = useTranslation();

  const getImageUrl = (id: string) => {
    return PlaceHolderImages.find(img => img.id === id)?.imageUrl || 'https://picsum.photos/seed/default/400/300';
  };

  return (
    <div className="pb-24 min-h-screen">
      <header className="p-10 bg-white card-shadow rounded-b-[3rem]">
        <div className="max-w-screen-md mx-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <h1 className="text-3xl font-bold text-primary mb-4 flex items-center gap-3 cursor-help">
                 <BookOpen className="h-8 w-8" />
                 Tes Mots
              </h1>
            </TooltipTrigger>
            <TooltipContent>Your Words</TooltipContent>
          </Tooltip>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input className="pl-10 h-12 rounded-2xl bg-muted border-none" placeholder="Chercher un mot..." />
          </div>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {VOCABULARY.map((word) => (
            <Link key={word.id} href={`/learning/${word.id}`}>
              <Card className="rounded-[2rem] border-none card-shadow bg-white overflow-hidden child-button cursor-pointer">
                <div className="relative h-32 w-full">
                  <Image
                    src={getImageUrl(word.imageId)}
                    alt={word.english}
                    fill
                    className="object-cover"
                    data-ai-hint={word.english}
                  />
                </div>
                <CardContent className="p-4 text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="font-bold text-lg text-primary cursor-help">{word.french}</h3>
                    </TooltipTrigger>
                    <TooltipContent>{word.english}</TooltipContent>
                  </Tooltip>
                  {showEnglish ? (
                    <p className="text-sm font-bold text-accent mt-1">{word.english}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground font-medium uppercase">{word.english}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <Navigation />
    </div>
  );
}
