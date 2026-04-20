
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

          // Lenient matching for kids: if it contains the word or is very close
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
  }, [targetPhrase, onSuccess, toast, isRecording]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({ 
        title: <TranslatedText fr="Désolé" en="Sorry" inline />, 
        description: <TranslatedText fr="La reconnaissance vocale n'est pas supportée." en="Voice recognition not supported." inline /> 
      });
      return;
    }
    setFeedback(null);
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
    <div className="flex flex-col items-center gap-6 w-full py-4">
      <div className="flex items-center justify-center">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={isProcessing}
            size="lg"
            className="rounded-full h-20 w-20 bg-primary hover:bg-primary/90 child-button p-0 shadow-xl border-4 border-white"
          >
            {isProcessing ? <Loader2 className="h-10 w-10 animate-spin" /> : <Mic className="h-10 w-10" />}
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            size="lg"
            className="rounded-full h-20 w-20 bg-destructive hover:bg-destructive/90 child-button animate-pulse p-0 shadow-2xl border-4 border-white"
          >
            <Square className="h-10 w-10" />
          </Button>
        )}
      </div>

      {(isRecording || feedback || isProcessing) && (
        <div className="text-center min-h-[6rem] animate-in zoom-in duration-300 px-6 w-full">
          {isRecording && (
            <div className="text-2xl md:text-3xl font-black text-destructive animate-pulse uppercase tracking-widest bg-destructive/10 py-6 rounded-3xl border-2 border-destructive/20 shadow-inner">
              <TranslatedText fr="On t'écoute..." en="Listening..." inline />
            </div>
          )}
          
          {isProcessing && (
            <div className="text-2xl md:text-3xl font-black text-primary uppercase tracking-widest flex items-center justify-center gap-4 py-6">
              <Loader2 className="h-8 w-8 animate-spin" />
              <TranslatedText fr="Analyse magique..." en="Magic analyzing..." inline />
            </div>
          )}

          {feedback && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className={`flex flex-col items-center gap-4 ${feedback.isGoodPronunciation ? 'text-green-600' : 'text-orange-600'}`}>
                {feedback.isGoodPronunciation ? (
                   <CheckCircle2 className="h-20 w-20 animate-bounce" />
                ) : (
                   <XCircle className="h-20 w-20" />
                )}
                <div className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-center">
                  <TranslatedText fr={feedback.frFeedback} en={feedback.enFeedback} />
                </div>
              </div>
              
              {feedback.transcript && (
                <div className="bg-white p-8 rounded-[3rem] border-4 border-dashed border-primary/20 shadow-xl max-w-lg mx-auto transform -rotate-1">
                  <div className="text-muted-foreground text-xs uppercase font-black tracking-widest mb-3 opacity-80">
                    <TranslatedText fr="J'ai entendu :" en="I heard:" inline />
                  </div>
                  <div className="text-3xl md:text-5xl font-black text-primary italic leading-tight">
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
