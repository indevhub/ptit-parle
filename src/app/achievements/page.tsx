
"use client"

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { ACHIEVEMENTS, VOCABULARY } from '@/app/data/lessons';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Lock, Loader2 } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function AchievementsPage() {
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

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user || !profileId) return null;
    return doc(firestore, 'users', user.uid, 'learnerProfiles', profileId);
  }, [firestore, user, profileId]);

  const { data: activeProfile, isLoading: isProfileLoading } = useDoc(profileRef);

  const vocabProgressRef = useMemoFirebase(() => {
    if (!firestore || !user || !profileId) return null;
    return collection(firestore, 'users', user.uid, 'learnerProfiles', profileId, 'vocabularyProgresses');
  }, [firestore, user, profileId]);

  const { data: vocabProgress, isLoading: isVocabLoading } = useCollection(vocabProgressRef);

  if (isUserLoading || isProfileLoading || isVocabLoading || !profileId || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  const learnedCount = vocabProgress?.length || 0;
  const stars = activeProfile?.totalStarsEarned || 0;

  // Achievement logic based on real progress
  const earnedIds: string[] = [];
  
  // "First Word" badge
  if (learnedCount > 0) earnedIds.push('first_word');
  
  // "Animal Lover" badge (all animals category)
  const animalWords = VOCABULARY.filter(w => w.category === 'animals');
  const learnedAnimals = vocabProgress?.filter(p => animalWords.some(aw => aw.id === p.id)) || [];
  if (animalWords.length > 0 && learnedAnimals.length >= animalWords.length) {
    earnedIds.push('animal_lover');
  }

  // "Gourmet" badge (all food category)
  const foodWords = VOCABULARY.filter(w => w.category === 'food');
  const learnedFood = vocabProgress?.filter(p => foodWords.some(fw => fw.id === p.id)) || [];
  if (foodWords.length > 0 && learnedFood.length >= foodWords.length) {
    earnedIds.push('foodie');
  }

  return (
    <div className="pb-24 min-h-screen">
      <header className="p-10 bg-white card-shadow rounded-b-[3rem]">
        <div className="max-w-screen-md mx-auto text-center">
          <div className="bg-yellow-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-12 w-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            <TranslatedText fr="Tes Médailles" en="Your Medals" />
          </h1>
          <div className="text-muted-foreground font-medium">
            <TranslatedText fr="Collectionne-les toutes !" en="Collect them all!" />
          </div>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const isEarned = earnedIds.includes(achievement.id);
            return (
              <Card key={achievement.id} className={`rounded-[2rem] border-none card-shadow bg-white overflow-hidden ${!isEarned ? 'opacity-60' : ''}`}>
                <CardContent className="p-6 flex items-center gap-6">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl ${isEarned ? 'bg-yellow-100' : 'bg-muted'}`}>
                    {isEarned ? achievement.icon : <Lock className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold text-lg ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <TranslatedText fr={achievement.title} en={achievement.title} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <TranslatedText fr={achievement.description} en={achievement.description} />
                    </div>
                  </div>
                  {isEarned && (
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <section className="bg-white p-8 rounded-[2rem] card-shadow text-center">
           <h3 className="font-bold text-primary mb-4">
             <TranslatedText fr="Statistiques" en="Statistics" />
           </h3>
           <div className="flex justify-around">
             <div>
               <p className="text-3xl font-bold text-primary">{earnedIds.length}</p>
               <div className="text-xs text-muted-foreground uppercase font-bold">
                 <TranslatedText fr="Médailles" en="Medals" />
               </div>
             </div>
             <div className="w-px bg-border" />
             <div>
               <p className="text-3xl font-bold text-primary">{stars}</p>
               <div className="text-xs text-muted-foreground uppercase font-bold">
                 <TranslatedText fr="Étoiles" en="Stars" />
               </div>
             </div>
             <div className="w-px bg-border" />
             <div>
               <p className="text-3xl font-bold text-primary">{learnedCount}</p>
               <div className="text-xs text-muted-foreground uppercase font-bold">
                 <TranslatedText fr="Mots" en="Words" />
               </div>
             </div>
           </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
