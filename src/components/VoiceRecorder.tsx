
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TranslatedText } from '@/components/TranslatedText';

interface VoiceRecorderProps {
  targetPhrase: string;
  onSuccess?: () => void;
}

interface SpeechFeedback {
  frFeedback: string;
  enFeedback: string;
  isGoodPronunciation: boolean;
  transcript: string;
}

export function VoiceRecorder({ targetPhrase, onSuccess }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<SpeechFeedback | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

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
          const transcript = event.results[0][0].transcript;
          const transcriptLower = transcript.toLowerCase().replace(/[.,!?;:]/g, "").trim();
          const targetLower = targetPhrase.toLowerCase().replace(/[.,!?;:]/g, "").trim();

          // Lenient matching for kids
          const isMatch = targetLower.length > 0 && (transcriptLower.includes(targetLower) || targetLower.includes(transcriptLower));
          
          const result: SpeechFeedback = {
            transcript: transcript,
            isGoodPronunciation: isMatch,
            frFeedback: isMatch ? `Magnifique !` : `Presque ! Essaie encore.`,
            enFeedback: isMatch ? `Magnificent!` : `Almost! Try again.`
          };

          setFeedback(result);
          if (isMatch) {
            onSuccess?.();
          }
        } catch (err) {
          console.error('Speech Recognition Error:', err);
        } finally {
          setIsProcessing(false);
          setIsRecording(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        setIsProcessing(false);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast({
            title: "Micro bloqué",
            description: "Merci d'autoriser l'accès au micro.",
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
  }, [targetPhrase, onSuccess, toast, isRecording]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({ title: "Désolé", description: "La reconnaissance vocale n'est pas supportée ici." });
      return;
    }
    setFeedback(null);
    setIsProcessing(false);
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.warn('Recognition already started or failed to start:', e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full py-4">
      <div className="flex items-center justify-center">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={isProcessing}
            size="lg"
            className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 child-button p-0 shadow-xl border-4 border-white"
          >
            {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Mic className="h-8 w-8" />}
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            size="lg"
            className="rounded-full h-16 w-16 bg-destructive hover:bg-destructive/90 child-button animate-pulse p-0 shadow-2xl border-4 border-white"
          >
            <Square className="h-8 w-8" />
          </Button>
        )}
      </div>

      {(isRecording || feedback || isProcessing) && (
        <div className="text-center min-h-[4rem] animate-in zoom-in duration-300 px-6 w-full">
          {isRecording && (
            <div className="text-xl md:text-2xl font-bold text-destructive animate-pulse uppercase tracking-widest bg-destructive/10 py-3 rounded-2xl">
              On t'écoute...
            </div>
          )}
          {isProcessing && (
            <div className="text-xl md:text-2xl font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Analyse en cours...
            </div>
          )}
          {feedback && (
            <div className="space-y-6">
              <div className={`flex flex-col items-center gap-4 ${feedback.isGoodPronunciation ? 'text-green-600' : 'text-orange-600'}`}>
                {feedback.isGoodPronunciation ? (
                   <CheckCircle2 className="h-16 w-16 animate-bounce" />
                ) : (
                   <XCircle className="h-16 w-16" />
                )}
                <div className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-none">
                  <TranslatedText fr={feedback.frFeedback} en={feedback.enFeedback} />
                </div>
              </div>
              {feedback.transcript && (
                <div className="bg-white/60 p-6 rounded-[2.5rem] border-2 border-dashed border-muted shadow-inner">
                  <div className="text-muted-foreground text-xs uppercase font-bold tracking-widest mb-2 opacity-60">
                    <TranslatedText fr="Tu as dit :" en="You said:" inline />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary italic leading-tight">
                    "{feedback.transcript}"
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
