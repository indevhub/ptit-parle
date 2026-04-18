"use client"

import React, { use } from 'react';
import { Navigation } from '@/components/Navigation';
import { VOCABULARY } from '@/app/data/lessons';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { AIImageGenerator } from '@/components/AIImageGenerator';
import { ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { notFound } from 'next/navigation';
import { TranslatedText } from '@/components/TranslatedText';

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const word = VOCABULARY.find(w => w.id === id);

  if (!word) {
    return notFound();
  }

  const getImageUrl = (imgId: string) => {
    return PlaceHolderImages.find(img => img.id === imgId)?.imageUrl || 'https://picsum.photos/seed/default/400/300';
  };

  return (
    <div className="pb-24 min-h-screen bg-[#FDF6F8]">
      <div className="max-w-screen-md mx-auto p-6 flex flex-col h-full">
        <header className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="p-3 bg-white rounded-2xl card-shadow child-button">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Link>
          <div className="text-xl font-bold text-primary">
            <TranslatedText fr="Leçon de Français" en="French Lesson" />
          </div>
          <div className="p-3 bg-white rounded-2xl card-shadow">
            <Info className="h-6 w-6 text-muted-foreground" />
          </div>
        </header>

        <main className="flex-1 space-y-8">
          <div className="relative aspect-square w-full rounded-[3rem] overflow-hidden card-shadow">
            <Image
              src={getImageUrl(word.imageId)}
              alt={word.french}
              fill
              className="object-cover"
              data-ai-hint={word.english}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-0 right-0 text-center">
               <div className="text-white text-5xl font-bold">
                 <TranslatedText fr={word.french} en={word.english} enClassName="text-white/80" />
               </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="font-bold text-primary uppercase tracking-widest text-sm">
                <TranslatedText fr="1. Écoute" en="1. Listen" inline />
              </div>
              <AudioPlayer text={word.french} />
            </div>

            <div className="w-full h-px bg-border max-w-[100px]" />

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="font-bold text-primary uppercase tracking-widest text-sm">
                <TranslatedText fr="2. Répète" en="2. Repeat" inline />
              </div>
              <VoiceRecorder targetPhrase={word.french} onSuccess={() => console.log('Achievement Unlocked!')} />
            </div>

            <div className="w-full h-px bg-border max-w-[100px]" />

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="font-bold text-primary uppercase tracking-widest text-sm">
                <TranslatedText fr="3. Surprise !" en="3. Surprise!" inline />
              </div>
              <AIImageGenerator word={word.english} />
            </div>
          </div>
        </main>
      </div>

      <Navigation />
    </div>
  );
}
