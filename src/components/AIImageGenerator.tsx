'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, ImageIcon } from 'lucide-react';
import { generateWordImage } from '@/ai/flows/generate-image';
import Image from 'next/image';
import { TranslatedText } from '@/components/TranslatedText';

interface AIImageGeneratorProps {
  word: string;
}

export function AIImageGenerator({ word }: AIImageGeneratorProps) {
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const url = await generateWordImage({ word });
      if (url) {
        setGeneratedUrl(url);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 p-6 bg-white/80 rounded-[2rem] card-shadow">
      <div className="flex flex-col items-center text-center gap-2 mb-2">
        <h3 className="font-bold text-primary flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-accent" />
          <TranslatedText fr="Dessin Magique" en="Magic Drawing" />
        </h3>
        <p className="text-xs text-muted-foreground">
          <TranslatedText fr="Crée une image spéciale pour ce mot !" en="Create a special image for this word!" />
        </p>
      </div>

      {generatedUrl ? (
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden animate-in zoom-in duration-500">
          <Image
            src={generatedUrl}
            alt={`AI illustration of ${word}`}
            fill
            className="object-cover"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setGeneratedUrl(null)}
            className="absolute bottom-2 right-2 rounded-full bg-white/90 backdrop-blur-sm"
          >
            <TranslatedText fr="Effacer" en="Clear" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 child-button text-lg font-bold"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
          ) : (
            <ImageIcon className="h-6 w-6 mr-2" />
          )}
          <TranslatedText fr="Générer l'Image" en="Generate Image" />
        </Button>
      )}
    </div>
  );
}
