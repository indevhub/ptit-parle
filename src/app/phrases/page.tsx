
"use client"

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Sparkles, Languages, Loader2, Trash2, ArrowRight } from 'lucide-react';
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

export default function PhrasesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const phrasesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'learnerProfiles', 'main-learner', 'phrases'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: phrases, isLoading } = useCollection(phrasesRef);

  const handleAddPhrase = async (englishText: string) => {
    if (!user || !firestore) return;
    
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
        title: "Phrase ajoutée !",
        description: "Ta nouvelle phrase magique est prête à être apprise.",
      });
    } catch (error: any) {
      console.error('Translation Error:', error);
      toast({
        variant: "destructive",
        title: "Erreur de traduction",
        description: error.message || "Désolé, la magie n'a pas fonctionné cette fois. Vérifie ta configuration API.",
      });
    } finally {
      setIsTranslating(false);
    }
  };

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
          
          <div className="bg-accent/10 p-6 rounded-[2rem] border-2 border-dashed border-accent/20">
            <div className="flex flex-col items-center gap-4">
              {isTranslating ? (
                <div className="flex flex-col items-center gap-2 text-accent">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="font-bold">Traduction magique...</span>
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
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0">
                         <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-primary leading-tight">
                          {phrase.frenchText}
                        </h3>
                        <p className="text-sm text-muted-foreground italic">
                          {phrase.englishText}
                        </p>
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

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-muted/50">
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Écoute</span>
                       <AudioPlayer text={phrase.frenchText} />
                    </div>
                    <div className="flex flex-col items-center gap-2 border-l border-muted/50">
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Répète</span>
                       <VoiceRecorder targetPhrase={phrase.frenchText} onSuccess={() => handleSuccess(phrase.id)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 p-12 rounded-[2rem] text-center border-2 border-dashed border-muted mt-8">
             <Languages className="h-12 w-12 text-muted mx-auto mb-4" />
             <p className="text-muted-foreground font-medium">
               <TranslatedText fr="Appuie sur le micro pour ajouter ta première phrase !" en="Press the mic to add your first phrase!" />
             </p>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
