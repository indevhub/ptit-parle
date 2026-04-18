
"use client"

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Sparkles, Languages, Loader2 } from 'lucide-react';
import { VOCABULARY } from '@/app/data/lessons';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/context/TranslationContext';
import { TranslatedText } from '@/components/TranslatedText';
import { useUser, useFirestore, useAuth, useCollection, useMemoFirebase, initiateAnonymousSignIn } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toggleEnglish } = useTranslation();

  const profilesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'learnerProfiles');
  }, [firestore, user]);

  const { data: profiles, isLoading: isProfilesLoading } = useCollection(profilesRef);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  useEffect(() => {
    if (user && profiles && profiles.length === 0 && firestore) {
      const profileId = 'main-learner';
      const profileRef = doc(firestore, 'users', user.uid, 'learnerProfiles', profileId);
      setDocumentNonBlocking(profileRef, {
        id: profileId,
        name: 'Explorateur',
        totalStarsEarned: 0,
        currentTheme: 'Default',
        lastActiveAt: new Date().toISOString(),
      }, { merge: true });
    }
  }, [user, profiles, firestore]);

  const activeProfile = profiles?.[0];
  const learnedCount = 3; 

  const getPlaceholderData = (id: string) => {
    const placeholder = PlaceHolderImages.find(img => img.id === id);
    return {
      url: placeholder?.imageUrl || `https://picsum.photos/seed/${id}/400/300`,
      hint: placeholder?.imageHint || id
    };
  };

  if (isUserLoading || isProfilesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen">
      <header className="p-6 md:p-10 bg-white card-shadow rounded-b-[3rem]">
        <div className="max-w-screen-md mx-auto flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary mb-1">
              <TranslatedText fr={`Salut, ${activeProfile?.name || 'Explorateur'} ! 👋`} en={`Hi, ${activeProfile?.name || 'Explorer'}! 👋`} />
            </h1>
            <div className="text-muted-foreground font-medium">
              <TranslatedText fr="Prêt pour une nouvelle aventure ?" en="Ready for a new adventure?" />
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleEnglish}
                className="rounded-full border-2 border-muted text-muted-foreground"
              >
                <Languages className="h-5 w-5" />
              </Button>
            <div className="bg-primary/10 px-4 py-2 rounded-full flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-primary text-xl">{activeProfile?.totalStarsEarned || 0}</span>
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
              {learnedCount}/{VOCABULARY.length} <TranslatedText fr="mots" en="words" inline />
            </span>
          </div>
          <Card className="rounded-[2rem] border-none card-shadow bg-white overflow-hidden">
            <CardContent className="p-6">
              <Progress value={(learnedCount / VOCABULARY.length) * 100} className="h-4 bg-muted" />
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">
            <TranslatedText fr="Continuer l'Apprentissage" en="Continue Learning" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VOCABULARY.slice(3, 5).map((word) => {
              const imgData = getPlaceholderData(word.imageId);
              return (
                <Link key={word.id} href={`/learning/${word.id}`}>
                  <Card className="rounded-[2rem] border-none card-shadow bg-white overflow-hidden child-button cursor-pointer group">
                    <div className="relative h-40 w-full">
                      <Image
                        src={imgData.url}
                        alt={word.english}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        data-ai-hint={imgData.hint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="text-white text-2xl font-bold">
                          <TranslatedText fr={word.french} en={word.english} enClassName="text-white/80" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
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
              <div className="text-sm text-foreground/70">
                <TranslatedText fr="Apprends 3 nouveaux mots aujourd'hui pour gagner un badge spécial." en="Learn 3 new words today to earn a special badge." />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
