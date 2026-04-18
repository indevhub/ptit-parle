
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, ImageIcon, AlertCircle, Sparkles, Key, Info, ExternalLink } from 'lucide-react';
import { generateWordImage } from '@/ai/flows/generate-image';
import Image from 'next/image';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

interface AIImageGeneratorProps {
  word: string;
}

export function AIImageGenerator({ word }: AIImageGeneratorProps) {
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setIsDemoMode(false);
    
    try {
      const url = await generateWordImage({ word });
      if (url) {
        setGeneratedUrl(url);
      } else {
        throw new Error('No image returned');
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      
      const errorMessage = err.message || '';
      // Detect common API key issues
      const isAuthError = 
        errorMessage.includes('API key') || 
        errorMessage.includes('400') || 
        errorMessage.includes('invalid') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('permission');
      
      if (isAuthError) {
        setIsDemoMode(true);
        // High quality placeholder for demo
        const fallbackUrl = `https://picsum.photos/seed/${word}/600/600`;
        setGeneratedUrl(fallbackUrl);
        
        toast({
          title: 'Mode Démo Activé',
          description: "Utilisation d'une image de secours en attendant ta clé API.",
        });
      } else {
        setError('Échec de la génération');
        toast({
          variant: 'destructive',
          title: 'Erreur Magique',
          description: 'Désolé, le dessin magique n\'a pas fonctionné.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 p-6 bg-white/80 rounded-[2rem] card-shadow border-2 border-dashed border-accent/20">
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
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden animate-in zoom-in duration-500 ring-4 ring-accent/10">
          <Image
            src={generatedUrl}
            alt={`Illustration of ${word}`}
            fill
            className="object-cover"
          />
          {isDemoMode && (
            <div className="absolute top-2 left-2 right-2 bg-yellow-500/95 backdrop-blur-md text-white text-[10px] font-bold px-3 py-2 rounded-full flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-1.5">
                <Key className="h-3 w-3" />
                CLÉ API REQUISE
              </div>
              <Sparkles className="h-3 w-3 animate-pulse" />
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setGeneratedUrl(null);
              setIsDemoMode(false);
            }}
            className="absolute bottom-2 right-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md"
          >
            <TranslatedText fr="Effacer" en="Clear" />
          </Button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 child-button text-lg font-bold shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
            ) : (
              <ImageIcon className="h-6 w-6 mr-2" />
            )}
            <TranslatedText fr="Générer l'Image" en="Generate Image" />
          </Button>
          
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-[11px] text-blue-700 leading-normal">
                <p className="font-bold mb-1 underline">Solution pour Seattle / US :</p>
                <p>Si AI Studio redirige, utilisez la Console Cloud :</p>
              </div>
            </div>
            
            <ol className="text-[10px] text-blue-600/80 space-y-1.5 list-decimal pl-4">
              <li>
                Allez sur <a href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com" target="_blank" className="font-bold underline inline-flex items-center gap-0.5">Console Cloud <ExternalLink className="h-2 w-2" /></a>
              </li>
              <li>Activez <strong>Generative Language API</strong>.</li>
              <li>Créez une <strong>Clé API</strong> dans "Identifiants".</li>
              <li>Dans "Restrictions API", cherchez et cochez <strong>Generative Language API</strong>.</li>
              <li>Collez la clé dans le fichier <code className="bg-white px-1 rounded font-bold">.env</code>.</li>
            </ol>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs justify-center bg-destructive/10 p-2 rounded-xl animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
