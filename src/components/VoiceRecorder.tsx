
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
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        setIsProcessing(true);
        const transcript = event.results[0][0].transcript.toLowerCase();
        const target = targetPhrase.toLowerCase().replace(/[.,!?;:]/g, "").trim();
        const cleanTranscript = transcript.replace(/[.,!?;:]/g, "").trim();

        const isMatch = target.length > 0 && (cleanTranscript.includes(target) || target.includes(cleanTranscript));
        
        const result: SpeechFeedback = {
          transcript: event.results[0][0].transcript,
          isGoodPronunciation: isMatch,
          frFeedback: isMatch 
            ? `Super !` 
            : `Pas tout à fait.`,
          enFeedback: isMatch
            ? `Great!`
            : `Not quite.`
        };

        setFeedback(result);
        if (isMatch) {
          onSuccess?.();
        }
        setIsProcessing(false);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
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
  }, [targetPhrase, onSuccess, toast]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({ title: "Désolé", description: "La reconnaissance vocale n'est pas supportée par ton navigateur." });
      return;
    }
    setFeedback(null);
    setIsRecording(true);
    setIsProcessing(false);
    try {
      recognitionRef.current.start();
    } catch (e) {
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center justify-center">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={isProcessing}
            size="lg"
            className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 child-button p-0"
          >
            {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Mic className="h-6 w-6" />}
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            size="lg"
            className="rounded-full h-12 w-12 bg-destructive hover:bg-destructive/90 child-button animate-pulse p-0"
          >
            <Square className="h-6 w-6" />
          </Button>
        )}
      </div>

      {(isRecording || feedback || isProcessing) && (
        <div className="text-center animate-in fade-in slide-in-from-top-1">
          {isRecording && (
            <div className="text-[10px] font-bold text-destructive animate-pulse uppercase tracking-wider">
              On t'écoute...
            </div>
          )}
          {isProcessing && (
            <div className="text-[10px] font-medium text-primary uppercase tracking-wider">
              Analyse...
            </div>
          )}
          {feedback && (
            <div className={`flex items-center gap-1 justify-center ${feedback.isGoodPronunciation ? 'text-green-600' : 'text-orange-600'}`}>
              {feedback.isGoodPronunciation ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                <TranslatedText fr={feedback.frFeedback} en={feedback.enFeedback} />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
