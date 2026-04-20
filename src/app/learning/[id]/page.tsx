
"use client"

import React, { use, useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { VOCABULARY } from '@/app/data/lessons';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ChevronLeft, Info, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { TranslatedText } from '@/components/TranslatedText';
import { useUser, useFirestore } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { MagicImage } from '@/components/MagicImage';

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const word = VOCABULARY.find(w => w.id === id);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const activeId = localStorage.getItem('activeProfileId');
    if (!activeId && !isUserLoading) {
      router.push('/');
    } else {
      setProfileId(activeId);
    }
  }, [router, isUserLoading]);

  if (!word) {
    return notFound();
  }

  if (isUserLoading || !profileId || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF6F8]">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  const handlePronunciationSuccess = () => {
    if (firestore && profileId && user) {
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

  return (
    <div className="pb-24 min-h-screen bg-[#FDF6F8]">
      <div className="max-w-screen-md mx-auto p-6 flex flex-col h-full">
        <header className="flex items-center justify-between mb-8">
          <Link href="/learning" className="p-3 bg-white rounded-2xl shadow-lg child-button">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Link>
          <div className="text-xl font-black text-primary uppercase tracking-widest">
            <TranslatedText fr="Leçon Magique" en="Magic Lesson" />
          </div>
          <div className="p-3 bg-white rounded-2xl shadow-lg opacity-0">
            <Info className="h-6 w-6" />
          </div>
        </header>

        <main className="flex-1 space-y-8">
          <div className="relative aspect-square w-full rounded-[3.5rem] overflow-hidden shadow-2xl bg-white border-8 border-white">
            <MagicImage
              wordId={word.id}
              defaultImageId={word.imageId}
              alt={word.french}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-0 right-0 text-center">
               <div className="text-white text-5xl md:text-7xl font-black px-4 drop-shadow-xl">
                 <TranslatedText fr={word.french} en={word.english} enClassName="text-white" />
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl space-y-12">
            <div className="flex flex-col items-center gap-10">
              <div className="flex flex-col items-center gap-4">
                <div className="font-black text-primary uppercase tracking-[0.2em] text-xs bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                  <TranslatedText fr="1. Écoute" en="1. Listen" inline />
                </div>
                <AudioPlayer text={word.french} />
              </div>

              <div className="w-full h-1 bg-gradient-to-r from-transparent via-border to-transparent max-w-[200px]" />

              <div className="flex flex-col items-center gap-4 w-full">
                <div className="font-black text-primary uppercase tracking-[0.2em] text-xs bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                  <TranslatedText fr="2. Répète" en="2. Repeat" inline />
                </div>
                <VoiceRecorder targetPhrase={word.french} onSuccess={handlePronunciationSuccess} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-6">
               <div className="bg-yellow-100 p-6 rounded-[2.5rem] flex items-center gap-4 shadow-inner border-2 border-yellow-200">
                 <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                 <span className="font-black text-yellow-700 text-lg uppercase tracking-widest">
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
