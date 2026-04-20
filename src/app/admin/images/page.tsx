
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { VOCABULARY } from '@/app/data/lessons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wand2, Upload, Sparkles, Loader2, Trash2, Timer, Zap, Bug } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, deleteDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateWordImage } from '@/ai/flows/generate-image';
import { listAvailableModels } from '@/ai/flows/debug-models';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const MAX_MAGIC_ENERGY = 10;

export default function ImageGalleryPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [magicEnergy, setMagicEnergy] = useState<number>(MAX_MAGIC_ENERGY);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  
  // Debug State
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [debugModels, setDebugModels] = useState<any[]>([]);
  const [isDebugLoading, setIsDebugLoading] = useState(false);

  useEffect(() => {
    const savedEnergy = localStorage.getItem('magic_energy');
    const lastReset = localStorage.getItem('magic_energy_reset');
    const now = Date.now();

    if (savedEnergy && lastReset) {
      if (now - parseInt(lastReset) > 3600000) {
        setMagicEnergy(MAX_MAGIC_ENERGY);
        localStorage.setItem('magic_energy', MAX_MAGIC_ENERGY.toString());
        localStorage.setItem('magic_energy_reset', now.toString());
      } else {
        setMagicEnergy(parseInt(savedEnergy));
      }
    } else {
      localStorage.setItem('magic_energy', MAX_MAGIC_ENERGY.toString());
      localStorage.setItem('magic_energy_reset', now.toString());
    }
  }, []);

  const updateEnergy = (newVal: number) => {
    setMagicEnergy(newVal);
    localStorage.setItem('magic_energy', newVal.toString());
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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
    if (!firestore || !user || cooldown > 0 || magicEnergy <= 0) {
      if (magicEnergy <= 0) {
        toast({
          variant: "destructive",
          title: <TranslatedText fr="Plus d'énergie !" en="No energy left!" inline noAudio />,
          description: <TranslatedText fr="Attendons un peu que le cristal se recharge." en="Let's wait for the crystal to recharge." inline noAudio />,
        });
      }
      return;
    }
    
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

        updateEnergy(magicEnergy - 1);
        toast({
          title: <TranslatedText fr="Magie réussie !" en="Magic success!" inline noAudio />,
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown magic error';
      console.error('Image Gallery Error:', error);
      
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('exhausted')) {
        setCooldown(60);
        updateEnergy(0);
        toast({
          variant: "destructive",
          title: <TranslatedText fr="Trop de magie !" en="Too much magic!" inline noAudio />,
          description: <TranslatedText fr="L'artiste se repose (Limite API). Réessaye dans une minute." en="The artist is resting (API Limit). Try again in a minute." inline noAudio />,
        });
      } else {
        toast({
          variant: "destructive",
          title: <TranslatedText fr="La magie a échoué" en="Magic failed" inline noAudio />,
          description: errorMsg,
        });
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleDebug = async () => {
    setIsDebugLoading(true);
    setIsDebugOpen(true);
    try {
      const models = await listAvailableModels();
      setDebugModels(models);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Debug Error",
        description: err.message,
      });
    } finally {
      setIsDebugLoading(false);
    }
  };

  const handleUploadClick = (wordId: string) => {
    setActiveWordId(wordId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeWordId) {
      processFile(file, activeWordId);
    }
    if (e.target) e.target.value = '';
  };

  const processFile = (file: File, wordId: string) => {
    if (firestore && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const docRef = doc(firestore, 'users', user.uid, 'customImages', wordId);
        setDocumentNonBlocking(docRef, {
          id: wordId,
          url: base64String,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        toast({
          title: <TranslatedText fr="Image enregistrée !" en="Image saved!" inline noAudio />,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file, id);
    } else if (file) {
      toast({
        variant: "destructive",
        title: <TranslatedText fr="Oups !" en="Oops!" inline noAudio />,
        description: <TranslatedText fr="Merci de déposer uniquement des images." en="Please drop images only." inline noAudio />,
      });
    }
  };

  const handleDeleteCustom = (wordId: string) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, 'users', user.uid, 'customImages', wordId);
    deleteDoc(docRef);
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
            <div className="flex items-center justify-center gap-2">
               <div className="bg-primary/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-primary/20">
                 <Zap className={cn("h-4 w-4", magicEnergy > 0 ? "text-primary fill-primary" : "text-muted-foreground")} />
                 <span className="text-xs font-black text-primary uppercase tracking-widest">
                   {magicEnergy}/{MAX_MAGIC_ENERGY} <TranslatedText fr="Énergies" en="Energies" inline noAudio />
                 </span>
               </div>
               <Button variant="ghost" size="icon" onClick={handleDebug} className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary">
                 <Bug className="h-4 w-4" />
               </Button>
            </div>
          </div>
          <div className="w-12 h-12" />
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-6">
        {cooldown > 0 && (
          <Alert className="mb-6 bg-orange-50 border-orange-200 rounded-[2rem] shadow-lg animate-in slide-in-from-top-4 duration-500">
            <Timer className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-950 font-black flex items-center gap-2">
              <TranslatedText fr="Pause Magique" en="Magic Break" inline noAudio />
              <span className="bg-orange-600 text-white px-3 py-0.5 rounded-full text-sm">{cooldown}s</span>
            </AlertTitle>
            <AlertDescription className="text-orange-800 font-bold">
              <TranslatedText 
                fr="L'artiste magique se repose un peu. On revient dans un instant !" 
                en="The magic artist is taking a short rest. We'll be back in a moment!" 
              />
            </AlertDescription>
          </Alert>
        )}

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        
        <div className="grid grid-cols-1 gap-6">
          {VOCABULARY.map((word) => {
            const customUrl = getCustomImage(word.id);
            const imgData = getPlaceholderData(word.imageId);
            const isProcessing = processingId === word.id;
            const isDragging = dragOverId === word.id;

            return (
              <Card 
                key={word.id} 
                className={cn(
                  "rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden transition-all duration-300",
                  isDragging && "ring-4 ring-primary ring-offset-4 scale-[1.02]"
                )}
                onDragOver={(e) => handleDragOver(e, word.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, word.id)}
              >
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
                      {isDragging && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center text-primary font-black animate-pulse p-4 text-center">
                          <Upload className="h-12 w-12 mb-2" />
                          <TranslatedText fr="Dépose l'image ici !" en="Drop image here!" inline noAudio />
                        </div>
                      )}
                      {customUrl && (
                        <div className="absolute top-2 right-2">
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
                          disabled={isProcessing || cooldown > 0 || magicEnergy <= 0}
                          className="rounded-2xl h-14 bg-accent hover:bg-accent/90 text-white font-bold shadow-lg gap-2"
                        >
                          <Wand2 className="h-5 w-5" />
                          <TranslatedText fr="Générer" en="Generate" inline noAudio />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleUploadClick(word.id)}
                          className={cn(
                            "rounded-2xl h-14 border-2 border-muted hover:bg-muted font-bold gap-2 transition-all",
                            isDragging && "bg-primary text-white border-primary"
                          )}
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

      <Dialog open={isDebugOpen} onOpenChange={setIsDebugOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary flex items-center gap-3">
              <Bug className="h-6 w-6" />
              Available Models List
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isDebugLoading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="font-bold text-muted-foreground">Checking magic archives...</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] rounded-2xl border-2 border-muted p-4 bg-muted/30">
                <div className="space-y-4">
                  {debugModels.length === 0 ? (
                    <p className="text-center py-10 text-muted-foreground">No models found for this API key.</p>
                  ) : (
                    debugModels.map((m: any, i: number) => (
                      <div key={i} className="p-4 bg-white rounded-xl shadow-sm border border-border">
                        <div className="font-black text-primary text-sm mb-1">{m.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{m.displayName}</div>
                        <div className="flex flex-wrap gap-1">
                          {m.supportedGenerationMethods?.map((method: string) => (
                            <span key={method} className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
                              {method}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 text-[9px] text-foreground/60 leading-relaxed">
                          {m.description}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsDebugOpen(false)} className="rounded-full px-8 font-bold">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
