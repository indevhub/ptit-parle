
"use client"

import React, { useState, useRef } from 'react';
import { VOCABULARY } from '@/app/data/lessons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wand2, Upload, Sparkles, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/app/lib/placeholder-images.json';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, deleteDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateWordImage } from '@/ai/flows/generate-image';

export default function ImageGalleryPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);

  // Fetch all custom images for this user
  const customImagesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'customImages');
  }, [firestore, user]);

  const { data: customImages } = useCollection(customImagesRef);

  const getCustomImage = (wordId: string) => {
    return customImages?.find(img => img.id === wordId)?.url;
  };

  const getPlaceholderData = (id: string) => {
    const placeholder = PlaceHolderImages.find(img => img.id === id);
    return {
      url: placeholder?.imageUrl || `https://picsum.photos/seed/${id}/400/300`,
      hint: placeholder?.imageHint || id
    };
  };

  const handleGenerate = async (word: any) => {
    if (!firestore || !user) return;
    setProcessingId(word.id);
    
    try {
      const url = await generateWordImage({ word: word.english });
      if (url) {
        const docRef = doc(firestore, 'users', user.uid, 'customImages', word.id);
        setDocumentNonBlocking(docRef, {
          id: word.id,
          url: url,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        toast({
          title: <TranslatedText fr="Magie réussie !" en="Magic success!" inline noAudio />,
          description: <TranslatedText fr="Ton nouveau dessin est prêt !" en="Your new drawing is ready!" inline noAudio />,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: <TranslatedText fr="Oups !" en="Oops!" inline noAudio />,
        description: <TranslatedText fr="La magie a échoué. Réessaie !" en="Magic failed. Try again!" inline noAudio />,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUploadClick = (wordId: string) => {
    setActiveWordId(wordId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeWordId && firestore && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const docRef = doc(firestore, 'users', user.uid, 'customImages', activeWordId);
        setDocumentNonBlocking(docRef, {
          id: activeWordId,
          url: base64String,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        toast({
          title: <TranslatedText fr="Image enregistrée !" en="Image saved!" inline noAudio />,
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (e.target) e.target.value = '';
  };

  const handleDeleteCustom = (wordId: string) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, 'users', user.uid, 'customImages', wordId);
    deleteDoc(docRef);
    toast({
      title: <TranslatedText fr="Image supprimée" en="Image deleted" inline noAudio />,
      description: <TranslatedText fr="Retour au dessin d'origine." en="Back to original drawing." inline noAudio />,
    });
  };

  return (
    <div className="pb-24 min-h-screen bg-background">
      <header className="p-10 bg-white shadow-xl rounded-b-[3rem]">
        <div className="max-w-screen-md mx-auto flex items-center justify-between">
          <Link href="/" className="p-3 bg-white rounded-2xl shadow-md child-button border border-muted">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-black text-primary mb-2 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-accent" />
              <TranslatedText fr="Galerie Magique" en="Magic Gallery" />
            </h1>
            <p className="text-muted-foreground font-bold">
              <TranslatedText fr="Personnalise les dessins de tes mots" en="Customize your word drawings" />
            </p>
          </div>
          <div className="w-12 h-12" />
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-6">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        
        <div className="grid grid-cols-1 gap-6">
          {VOCABULARY.map((word) => {
            const customUrl = getCustomImage(word.id);
            const imgData = getPlaceholderData(word.imageId);
            const isProcessing = processingId === word.id;

            return (
              <Card key={word.id} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative h-48 w-full md:w-64 rounded-[2rem] overflow-hidden shadow-inner bg-muted shrink-0">
                      <Image
                        src={customUrl || imgData.url}
                        alt={word.english}
                        fill
                        className="object-cover"
                        data-ai-hint={imgData.hint}
                      />
                      {isProcessing && (
                        <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center">
                          <Loader2 className="h-10 w-10 text-white animate-spin" />
                        </div>
                      )}
                      {customUrl && (
                        <div className="absolute top-2 right-2 flex gap-2">
                           <Button 
                             size="icon" 
                             variant="destructive" 
                             className="h-8 w-8 rounded-full shadow-lg"
                             onClick={() => handleDeleteCustom(word.id)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
                            {word.category}
                          </span>
                          {customUrl && (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-accent/10 text-accent px-3 py-1 rounded-full flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Custom
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-black text-primary mb-1">
                          {word.french}
                        </h3>
                        <p className="text-muted-foreground font-bold italic">
                          {word.english}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <Button
                          onClick={() => handleGenerate(word)}
                          disabled={isProcessing}
                          className="rounded-2xl h-14 bg-accent hover:bg-accent/90 text-white font-bold shadow-lg gap-2"
                        >
                          <Wand2 className="h-5 w-5" />
                          <TranslatedText fr="Générer" en="Generate" inline noAudio />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleUploadClick(word.id)}
                          className="rounded-2xl h-14 border-2 border-muted hover:bg-muted font-bold gap-2"
                        >
                          <Upload className="h-5 w-5" />
                          <TranslatedText fr="Télécharger" en="Upload" inline noAudio />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
