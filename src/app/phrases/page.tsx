"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Sparkles, Loader2, Trash2, ArrowRight, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TranslatedText } from '@/components/TranslatedText';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, increment } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { translatePhrase } from '@/ai/flows/translate-phrase';
import { EnglishVoiceRecorder } from '@/components/EnglishVoiceRecorder';
import { useToast } from '@/hooks/use-toast';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PhrasesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isTranslating, setIsTranslating] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const phrasesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'learnerProfiles', 'main-learner', 'phrases'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: phrases, isLoading } = useCollection(phrasesRef);

  const handleAddPhrase = useCallback(async (englishText: string) => {
    if (!user || !firestore || cooldown > 0) return;
    
    setIsTranslating(true);
    try {
      const result = await translatePhrase({ englishText });
      const phraseId = Math.random().toString(36).substring(7);
      const phraseRef = doc(firestore, 'users', user.uid, 'learnerProfiles', 'main-learner', 'phrases', phraseId);
      
      setDocumentNonBlocking(phraseRef, {
        id: phraseId,
        frenchText: result.frenchText,
        englishText: result.englishText,
        createdAt: new Date().toISOString(),
        isMastered: false,
      }, { merge: true });

      toast({
        title: <TranslatedText fr="Phrase ajoutée !" en="Phrase added!" inline />,
        description: <TranslatedText fr="Ta nouvelle phrase magique est prête." en="Your new magic phrase is ready." inline />,
      });
    } catch (error: any) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('limit')) {
        setCooldown(60);
        toast({
          variant: "destructive",
          title: <TranslatedText fr="Trop de magie !" en="Too much magic!" inline />,
          description: <TranslatedText fr="Attendons un peu avant de continuer." en="Let's wait a bit before continuing." inline />,
        });
      } else {
        toast({
          variant: "destructive",
          title: <TranslatedText fr="Erreur de traduction" en="Translation Error" inline />,
          description: <TranslatedText fr="Désolé, la magie n'a pas fonctionné." en="Sorry, the magic didn't work." inline />,
        });
      }
    } finally {
      setIsTranslating(false);
    }
  }, [user, firestore, cooldown, toast]);

  const handleDelete = (id: string) => {
    if (!user || !firestore) return;
    const phraseRef = doc(firestore, 'users', user.uid, 'learnerProfiles', 'main-learner', 'phrases', id);
    deleteDocumentNonBlocking(phraseRef);
  };

  const handleSuccess = (phraseId: string) => {
    if (user && firestore) {
      const profileRef = doc(firestore, 'users', user.uid, 'learnerProfiles', 'main-learner');
      updateDocumentNonBlocking(profileRef, {
        totalStarsEarned: increment(2),
        lastActiveAt: new Date().toISOString(),
      });
      const phraseRef = doc(firestore, 'users', user.uid, 'learnerProfiles', 'main-learner', 'phrases', phraseId);
      updateDocumentNonBlocking(phraseRef, { isMastered: true });
    }
  };

  return (
    <div className="pb-24 min-h-screen">
      <header className="p-10 bg-white card-shadow rounded-b-[3rem]">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-4 flex items-center gap-3">
             <Sparkles className="h-8 w-8 text-accent" />
             <TranslatedText fr="Phrases Magiques" en="Magic Phrases" />
          </h1>
          <p className="text-muted-foreground font-medium mb-6">
            <TranslatedText fr="Dis quelque chose en anglais, je le traduis !" en="Say something in English, I'll translate it!" />
          </p>
          
          <div className="bg-accent/10 p-6 rounded-[2rem] border-2 border-dashed border-accent/20 relative">
            {cooldown > 0 && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2rem] z-10 flex items-center justify-center p-6">
                <Alert className="bg-orange-50 border-orange-200 shadow-xl max-w-sm">
                  <Timer className="h-5 w-5 text-orange-600" />
                  <AlertTitle className="text-orange-950 font-black flex items-center gap-2">
                    <TranslatedText fr="Pause Magique" en="Magic Break" inline />
                    <span className="bg-orange-600 text-white px-3 py-0.5 rounded-full text-sm">{cooldown}s</span>
                  </AlertTitle>
                  <AlertDescription className="text-orange-800 font-bold">
                    <TranslatedText 
                      fr="Le traducteur magique se repose. Réessaie dans quelques secondes !" 
                      en="The magic translator is resting. Try again in a few seconds!" 
                    />
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <div className="flex flex-col items-center gap-4">
              {isTranslating ? (
                <div className="flex flex-col items-center gap-2 text-accent">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="font-bold">
                    <TranslatedText fr="Traduction magique..." en="Magic translation..." inline />
                  </span>
                </div>
              ) : (
                <EnglishVoiceRecorder onFinished={handleAddPhrase} />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : phrases && phrases.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {phrases.map((phrase) => (
              <Card key={phrase.id} className="rounded-[2rem] border-none card-shadow bg-white overflow-hidden relative group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0">
                         <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <TranslatedText 
                          fr={phrase.frenchText} 
                          en={phrase.englishText} 
                          className="text-xl font-bold text-primary leading-tight"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(phrase.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                      <Link href={`/phrases/${phrase.id}`}>
                        <Button variant="ghost" size="icon" className="text-primary">
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-muted/50 items-start">
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                         <TranslatedText fr="Écoute" en="Listen" inline />
                       </span>
                       <AudioPlayer text={phrase.frenchText} />
                    </div>
                    <div className="flex flex-col items-center gap-2 border-l border-muted/50">
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                         <TranslatedText fr="Répète" en="Repeat" inline />
                       </span>
                       <VoiceRecorder targetPhrase={phrase.frenchText} onSuccess={() => handleSuccess(phrase.id)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 p-12 rounded-[2rem] text-center border-2 border-dashed border-muted mt-8">
             <TranslatedText fr="Appuie sur le micro pour ajouter ta première phrase !" en="Press the mic to add your first phrase!" />
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
