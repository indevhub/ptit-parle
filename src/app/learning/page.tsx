
"use client"

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { VOCABULARY } from '@/app/data/lessons';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { TranslatedText } from '@/components/TranslatedText';
import { MagicImage } from '@/components/MagicImage';

export default function LearningListPage() {
  return (
    <div className="pb-24 min-h-screen">
      <header className="p-10 bg-white card-shadow rounded-b-[3rem]">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-4 flex items-center gap-3">
             <BookOpen className="h-8 w-8" />
             <TranslatedText fr="Tes Mots" en="Your Words" />
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input className="pl-10 h-12 rounded-2xl bg-muted border-none" placeholder="Chercher un mot..." />
          </div>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {VOCABULARY.map((word) => {
            return (
              <Link key={word.id} href={`/learning/${word.id}`}>
                <Card className="rounded-[2rem] border-none card-shadow bg-white overflow-hidden child-button cursor-pointer">
                  <div className="relative h-32 w-full">
                    <MagicImage
                      wordId={word.id}
                      defaultImageId={word.imageId}
                      alt={word.english}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold text-lg text-primary">
                      <TranslatedText fr={word.french} en={word.english} />
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      <Navigation />
    </div>
  );
}
