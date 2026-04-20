
"use client"

import React, { useState } from 'react';
import { VOCABULARY } from '@/app/data/lessons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wand2, Upload, ImageIcon, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

export default function ImageGalleryPage() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const getPlaceholderData = (id: string) => {
    const placeholder = PlaceHolderImages.find(img => img.id === id);
    return {
      url: placeholder?.imageUrl || `https://picsum.photos/seed/${id}/400/300`,
      hint: placeholder?.imageHint || id
    };
  };

  const handleGenerate = (wordId: string) => {
    setProcessingId(wordId);
    // Mocking generation for now
    setTimeout(() => {
      setProcessingId(null);
      toast({
        title: <TranslatedText fr="Image générée !" en="Image generated!" inline noAudio />,
        description: <TranslatedText fr="L'IA a créé un nouveau dessin magique." en="AI created a new magic drawing." inline noAudio />,
      });
    }, 2000);
  };

  const handleUpload = (wordId: string) => {
    toast({
      title: <TranslatedText fr="Bientôt disponible" en="Coming soon" inline noAudio />,
      description: <TranslatedText fr="Le téléchargement d'images sera bientôt prêt." en="Image upload will be ready soon." inline noAudio />,
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
              <TranslatedText fr="Gère les dessins de tes mots" en="Manage your word drawings" />
            </p>
          </div>
          <div className="w-12 h-12" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          {VOCABULARY.map((word) => {
            const imgData = getPlaceholderData(word.imageId);
            const isProcessing = processingId === word.id;

            return (
              <Card key={word.id} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative h-48 w-full md:w-64 rounded-[2rem] overflow-hidden shadow-inner bg-muted shrink-0">
                      <Image
                        src={imgData.url}
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
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
                            {word.category}
                          </span>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
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
                          onClick={() => handleGenerate(word.id)}
                          disabled={isProcessing}
                          className="rounded-2xl h-14 bg-accent hover:bg-accent/90 text-white font-bold shadow-lg gap-2"
                        >
                          <Wand2 className="h-5 w-5" />
                          <TranslatedText fr="Générer" en="Generate" inline noAudio />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleUpload(word.id)}
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
