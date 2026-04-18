
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  targetPhrase: string;
  onSuccess?: () => void;
}

interface SpeechFeedback {
  feedback: string;
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
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const target = targetPhrase.toLowerCase().replace(/[.,!?;:]/g, "");
        const cleanTranscript = transcript.replace(/[.,!?;:]/g, "");

        const isMatch = cleanTranscript.includes(target) || target.includes(cleanTranscript);
        
        const result: SpeechFeedback = {
          transcript: event.results[0][0].transcript,
          isGoodPronunciation: isMatch,
          feedback: isMatch 
            ? `Excellent ! Tu as dit : "${event.results[0][0].transcript}"` 
            : `Pas tout à fait. J'ai entendu : "${event.results[0][0].transcript}". Essaie encore !`
        };

        setFeedback(result);
        if (isMatch) {
          onSuccess?.();
        }
        setIsProcessing(false);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsProcessing(false);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast({
            title: "Micro bloqué",
            description: "Merci d'autoriser l'accès au micro dans votre navigateur.",
            variant: "destructive",
          });
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [targetPhrase, onSuccess, toast]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Navigateur non compatible",
        description: "Votre navigateur ne supporte pas la reconnaissance vocale.",
        variant: "destructive",
      });
      return;
    }

    setFeedback(null);
    setIsRecording(true);
    setIsProcessing(false);
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Recognition might already be started
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsProcessing(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto p-4 rounded-3xl bg-white/50 card-shadow">
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={isProcessing}
            size="lg"
            className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 child-button"
          >
            {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Mic className="h-8 w-8" />}
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            size="lg"
            className="rounded-full h-16 w-16 bg-destructive hover:bg-destructive/90 child-button animate-pulse"
          >
            <Square className="h-8 w-8" />
          </Button>
        )}
      </div>

      {isRecording && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-destructive animate-bounce">On t'écoute...</p>
          <p className="text-xs text-muted-foreground italic">Dis "{targetPhrase}"</p>
        </div>
      )}

      {isProcessing && <p className="text-sm font-medium text-primary">Analyse en cours...</p>}

      {feedback && (
        <div className={`flex flex-col items-center text-center p-4 rounded-2xl w-full animate-in fade-in zoom-in duration-300 ${feedback.isGoodPronunciation ? 'bg-green-100' : 'bg-orange-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            {feedback.isGoodPronunciation ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-orange-600" />
            )}
            <span className={`font-bold ${feedback.isGoodPronunciation ? 'text-green-700' : 'text-orange-700'}`}>
              {feedback.isGoodPronunciation ? 'Bravo !' : 'Encore un petit effort'}
            </span>
          </div>
          <p className="text-sm text-foreground/80 mb-1">{feedback.feedback}</p>
        </div>
      )}
    </div>
  );
}
