
"use client"

import React, { use } from 'react';
import { Navigation } from '@/components/Navigation';
import { VOCABULARY } from '@/app/data/lessons';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ChevronLeft, Info, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { notFound } from 'next/navigation';
import { TranslatedText } from '@/components/TranslatedText';
import { useUser, useFirestore } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const word = VOCABULARY.find(w => w.id === id);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  if (!word) {
    return notFound();
  }

  // Robust loading check: Wait for user session
  if (isUserLoading || (user === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF6F8]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  const handlePronunciationSuccess = () => {
    if (user && firestore) {
      const profileId = 'main-learner';
      const profileRef = doc(firestore, 'users', user.uid, 'learnerProfiles', profileId);
      
      updateDocumentNonBlocking(profileRef, {
        totalStarsEarned: increment(1),
        lastActiveAt: new Date().toISOString(),
      });

      const vocabProgressRef = doc(firestore, 'users', user.uid, 'learnerProfiles', profileId, 'vocabularyProgresses', word.id);
      setDocumentNonBlocking(vocabProgressRef, {
        learnerId: profileId,
        vocabularyItemId: word.id,
        isMastered: true,
        lastAttemptedAt: new Date().toISOString(),
        totalAttempts: increment(1),
        successfulAttempts: increment(1),
        bestPronunciationScore: 100
      }, { merge: true });
    }
  };

  const getPlaceholderData = (imgId: string) => {
    const placeholder = PlaceHolderImages.find(img => img.id === imgId);
    return {
      url: placeholder?.imageUrl || `https://picsum.photos/seed/${imgId}/600/600`,
      hint: placeholder?.imageHint || imgId
    };
  };

  const imgData = getPlaceholderData(word.imageId);

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
          <div className="relative aspect-square w-full rounded-[3rem] overflow-hidden card-shadow bg-white">
            <Image
              src={imgData.url}
              alt={word.french}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              data-ai-hint={imgData.hint}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-0 right-0 text-center">
               <div className="text-white text-5xl font-bold px-4">
                 <TranslatedText fr={word.french} en={word.english} enClassName="text-white/80" />
               </div>
            </div>
          </div>

          <div className="bg-white/80 rounded-[3rem] p-8 card-shadow space-y-12">
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-4">
                <div className="font-bold text-primary uppercase tracking-widest text-xs bg-primary/10 px-4 py-1 rounded-full">
                  <TranslatedText fr="1. Écoute" en="1. Listen" inline />
                </div>
                <AudioPlayer text={word.french} />
              </div>

              <div className="w-full h-px bg-border max-w-[150px]" />

              <div className="flex flex-col items-center gap-4 w-full">
                <div className="font-bold text-primary uppercase tracking-widest text-xs bg-primary/10 px-4 py-1 rounded-full">
                  <TranslatedText fr="2. Répète" en="2. Repeat" inline />
                </div>
                <VoiceRecorder targetPhrase={word.french} onSuccess={handlePronunciationSuccess} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-4">
               <div className="bg-yellow-100 p-4 rounded-3xl flex items-center gap-3">
                 <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                 <span className="font-bold text-yellow-700 text-sm">
                   <TranslatedText fr="Gagne 1 étoile !" en="Earn 1 star!" inline />
                 </span>
               </div>
            </div>
          </div>
        </main>
      </div>

      <Navigation />
    </div>
  );
}
