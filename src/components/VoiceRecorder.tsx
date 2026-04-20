
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, Square, Loader2, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TranslatedText } from '@/components/TranslatedText';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  targetPhrase: string;
  onSuccess?: () => void;
}

interface WordStatus {
  word: string;
  isCorrect: boolean | null;
}

export function VoiceRecorder({ targetPhrase, onSuccess }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wordStatuses, setWordStatuses] = useState<WordStatus[]>([]);
  const [overallSuccess, setOverallSuccess] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize word statuses from targetPhrase
  const targetWords = useMemo(() => {
    return targetPhrase.split(/\s+/).map(word => ({
      original: word,
      clean: word.toLowerCase().replace(/[.,!?;:]/g, "").trim()
    }));
  }, [targetPhrase]);

  useEffect(() => {
    setWordStatuses(targetWords.map(w => ({ word: w.original, isCorrect: null })));
    setOverallSuccess(null);
    setTranscript('');
  }, [targetWords]);

  const playWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        setIsProcessing(true);
        try {
          const userTranscript = event.results[0][0].transcript;
          setTranscript(userTranscript);
          const transcriptWords = userTranscript.toLowerCase().replace(/[.,!?;:]/g, "").split(/\s+/);

          const newStatuses = targetWords.map(target => {
            // Check if the cleaned target word exists in the transcript words
            const isMatch = transcriptWords.some(tw => tw === target.clean || tw.includes(target.clean) || target.clean.includes(tw));
            return {
              word: target.original,
              isCorrect: isMatch
            };
          });

          const allCorrect = newStatuses.every(s => s.isCorrect);
          setWordStatuses(newStatuses);
          setOverallSuccess(allCorrect);

          if (allCorrect) {
            onSuccess?.();
            toast({
              title: <TranslatedText fr="Parfait !" en="Perfect!" inline />,
              description: <TranslatedText fr="Tu as bien prononcé chaque mot." en="You pronounced every word correctly." inline />,
            });
          } else {
            toast({
              title: <TranslatedText fr="Presque !" en="Almost!" inline />,
              description: <TranslatedText fr="Certains mots ont besoin d'encore un peu de magie." en="Some words need a bit more magic." inline />,
              variant: "destructive",
            });
          }
        } catch (err) {
          // Errors handled by central emitter
        } finally {
          setIsProcessing(false);
          setIsRecording(false);
        }
      };

      recognition.onerror = (event: any) => {
        setIsProcessing(false);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast({
            title: <TranslatedText fr="Micro bloqué" en="Mic blocked" inline />,
            description: <TranslatedText fr="Merci d'autoriser l'accès au micro." en="Please allow mic access." inline />,
            variant: "destructive",
          });
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [targetWords, onSuccess, toast, isRecording]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({ 
        title: <TranslatedText fr="Désolé" en="Sorry" inline />, 
        description: <TranslatedText fr="La reconnaissance vocale n'est pas supportée." en="Voice recognition not supported." inline /> 
      });
      return;
    }
    setOverallSuccess(null);
    setWordStatuses(targetWords.map(w => ({ word: w.original, isCorrect: null })));
    setIsProcessing(false);
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (e) {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full py-4">
      {/* Target Phrase Display with Clickable Words */}
      <div className="flex flex-wrap justify-center gap-3 max-w-lg">
        {wordStatuses.map((item, idx) => (
          <button
            key={idx}
            onClick={() => playWord(item.word)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xl md:text-2xl font-black transition-all transform hover:scale-110 active:scale-95 shadow-sm border-b-4",
              item.isCorrect === true ? "bg-green-100 text-green-700 border-green-500" :
              item.isCorrect === false ? "bg-orange-100 text-orange-700 border-orange-500" :
              "bg-white text-primary border-primary/20 hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-2">
              {item.word}
              <Volume2 className="h-4 w-4 opacity-30" />
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={isProcessing}
            size="lg"
            className="rounded-full h-24 w-24 bg-primary hover:bg-primary/90 child-button p-0 shadow-2xl border-4 border-white"
          >
            {isProcessing ? <Loader2 className="h-12 w-12 animate-spin" /> : <Mic className="h-12 w-12" />}
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            size="lg"
            className="rounded-full h-24 w-24 bg-destructive hover:bg-destructive/90 child-button animate-pulse p-0 shadow-2xl border-4 border-white"
          >
            <Square className="h-12 w-12" />
          </Button>
        )}
      </div>

      {(isRecording || overallSuccess !== null || isProcessing) && (
        <div className="text-center min-h-[8rem] animate-in zoom-in duration-300 px-6 w-full max-w-md">
          {isRecording && (
            <div className="text-2xl font-black text-destructive animate-pulse uppercase tracking-widest bg-destructive/10 py-6 rounded-3xl border-2 border-destructive/20 shadow-inner">
              <TranslatedText fr="On t'écoute..." en="Listening..." inline />
            </div>
          )}
          
          {isProcessing && (
            <div className="text-2xl font-black text-primary uppercase tracking-widest flex items-center justify-center gap-4 py-6">
              <Loader2 className="h-8 w-8 animate-spin" />
              <TranslatedText fr="Analyse magique..." en="Magic analyzing..." inline />
            </div>
          )}

          {overallSuccess !== null && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className={cn(
                "flex flex-col items-center gap-3",
                overallSuccess ? "text-green-600" : "text-orange-600"
              )}>
                {overallSuccess ? (
                   <CheckCircle2 className="h-16 w-16 animate-bounce" />
                ) : (
                   <XCircle className="h-16 w-16" />
                )}
                <div className="text-3xl font-black tracking-tight leading-none text-center">
                  <TranslatedText 
                    fr={overallSuccess ? "Magnifique ! Tout est correct." : "Presque parfait !"} 
                    en={overallSuccess ? "Magnificent! Everything is correct." : "Almost perfect!"} 
                  />
                </div>
              </div>
              
              {transcript && (
                <div className="bg-white p-6 rounded-[2.5rem] border-4 border-dashed border-primary/10 shadow-xl transform -rotate-1">
                  <div className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">
                    <TranslatedText fr="J'ai entendu :" en="I heard:" inline />
                  </div>
                  <div className="text-2xl font-black text-primary italic">
                    "{transcript}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
