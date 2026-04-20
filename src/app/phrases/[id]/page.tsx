"use client"

import React, { use, useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ChevronLeft, Info, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { TranslatedText } from '@/components/TranslatedText';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { notFound, useRouter } from 'next/navigation';

export default function PhraseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
  }, [isUserLoading, router]);

  const phraseRef = useMemoFirebase(() => {
    if (!firestore || !user || !profileId) return null;
    return doc(firestore, 'users', user.uid, 'learnerProfiles', profileId, 'phrases', id);
  }, [firestore, user, profileId, id]);

  const { data: phrase, isLoading } = useDoc(phraseRef);

  if (isUserLoading || isLoading || !phraseRef || !profileId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FD]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
          <div className="text-xl font-black text-primary animate-pulse tracking-widest uppercase">
            <TranslatedText fr="Magie en cours..." en="Magic working..." inline />
          </div>
        </div>
      </div>
    );
  }

  if (!phrase) {
    return notFound();
  }

  const handlePronunciationSuccess = () => {
    if (user && firestore && profileId) {
      const profileRef = doc(firestore, 'users', user.uid, 'learnerProfiles', profileId);
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
          <Link href="/phrases" className="p-3 bg-white rounded-2xl shadow-lg child-button">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Link>
          <div className="text-xl font-black text-primary uppercase tracking-widest">
            <TranslatedText fr="Pratique Magique" en="Magic Practice" />
          </div>
          <div className="p-3 bg-white rounded-2xl shadow-lg opacity-0">
            <Info className="h-6 w-6" />
          </div>
        </header>

        <main className="flex-1 space-y-8">
          <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl text-center border-b-8 border-primary/5">
             <TranslatedText 
               fr={phrase.frenchText} 
               en={phrase.englishText} 
               className="text-4xl md:text-6xl font-black text-primary leading-tight"
               enClassName="text-2xl italic mt-4"
             />
          </div>

          <div className="bg-white/90 rounded-[3.5rem] p-10 shadow-2xl space-y-12 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-10">
              <div className="flex flex-col items-center gap-4">
                <div className="font-black text-primary uppercase tracking-[0.2em] text-xs bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                  <TranslatedText fr="1. Écoute la Phrase" en="1. Listen to Phrase" inline />
                </div>
                <AudioPlayer text={phrase.frenchText} />
              </div>

              <div className="w-full h-1 bg-gradient-to-r from-transparent via-border to-transparent max-w-[200px]" />

              <div className="flex flex-col items-center gap-4 w-full">
                <div className="font-black text-primary uppercase tracking-[0.2em] text-xs bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                  <TranslatedText fr="2. Répète" en="2. Repeat" inline />
                </div>
                <VoiceRecorder targetPhrase={phrase.frenchText} onSuccess={handlePronunciationSuccess} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-6">
               <div className="bg-yellow-100 p-6 rounded-[2.5rem] flex items-center gap-4 shadow-inner border-2 border-yellow-200">
                 <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                 <span className="font-black text-yellow-700 text-lg uppercase tracking-widest">
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
