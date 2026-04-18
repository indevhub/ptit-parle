
"use client"

import React, { use } from 'react';
import { Navigation } from '@/components/Navigation';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ChevronLeft, Info, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { TranslatedText } from '@/components/TranslatedText';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { notFound } from 'next/navigation';

export default function PhraseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const phraseRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'learnerProfiles', 'main-learner', 'phrases', id);
  }, [firestore, user, id]);

  const { data: phrase, isLoading } = useDoc(phraseRef);

  // Robust loading check: Wait for user and then for phrase data
  // We don't 404 if user is null because anonymous sign-in is expected
  if (isUserLoading || (user === null) || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FD]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  // If we have a user and loading finished, but phrase is missing, then 404
  if (!phrase) {
    return notFound();
  }

  const handlePronunciationSuccess = () => {
    if (user && firestore) {
      const profileRef = doc(firestore, 'users', user.uid, 'learnerProfiles', 'main-learner');
      updateDocumentNonBlocking(profileRef, {
        totalStarsEarned: increment(2),
        lastActiveAt: new Date().toISOString(),
      });

      if (phraseRef) {
        updateDocumentNonBlocking(phraseRef, {
          isMastered: true,
        });
      }
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-[#F6F8FD]">
      <div className="max-w-screen-md mx-auto p-6 flex flex-col h-full">
        <header className="flex items-center justify-between mb-8">
          <Link href="/phrases" className="p-3 bg-white rounded-2xl card-shadow child-button">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Link>
          <div className="text-xl font-bold text-primary">
            <TranslatedText fr="Pratique de Phrase" en="Phrase Practice" />
          </div>
          <div className="p-3 bg-white rounded-2xl card-shadow opacity-0">
            <Info className="h-6 w-6" />
          </div>
        </header>

        <main className="flex-1 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 card-shadow text-center space-y-4">
             <div className="text-4xl md:text-5xl font-bold text-primary leading-tight">
               {phrase.frenchText}
             </div>
             <div className="text-xl text-muted-foreground italic">
               {phrase.englishText}
             </div>
          </div>

          <div className="bg-white/80 rounded-[3rem] p-8 card-shadow space-y-12">
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-4">
                <div className="font-bold text-primary uppercase tracking-widest text-xs bg-primary/10 px-4 py-1 rounded-full">
                  <TranslatedText fr="1. Écoute la Phrase" en="1. Listen to Phrase" inline />
                </div>
                <AudioPlayer text={phrase.frenchText} />
              </div>

              <div className="w-full h-px bg-border max-w-[150px]" />

              <div className="flex flex-col items-center gap-4 w-full">
                <div className="font-bold text-primary uppercase tracking-widest text-xs bg-primary/10 px-4 py-1 rounded-full">
                  <TranslatedText fr="2. Répète" en="2. Repeat" inline />
                </div>
                <VoiceRecorder targetPhrase={phrase.frenchText} onSuccess={handlePronunciationSuccess} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-4">
               <div className="bg-yellow-100 p-4 rounded-3xl flex items-center gap-3">
                 <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                 <span className="font-bold text-yellow-700 text-sm">
                   <TranslatedText fr="Gagne 2 étoiles !" en="Earn 2 stars!" inline />
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
