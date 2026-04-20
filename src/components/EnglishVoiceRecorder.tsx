"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TranslatedText } from '@/components/TranslatedText';

interface EnglishVoiceRecorderProps {
  onFinished: (text: string) => void;
}

export function EnglishVoiceRecorder({ onFinished }: EnglishVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
       toast({ 
         title: <TranslatedText fr="Désolé" en="Sorry" inline />, 
         description: <TranslatedText fr="Ton navigateur ne supporte pas la dictée vocale." en="Your browser doesn't support voice dictation." inline /> 
       });
       return;
    }

    if (isRecording) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onFinished(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast({
            variant: "destructive",
            title: <TranslatedText fr="Micro bloqué" en="Mic blocked" inline />,
            description: <TranslatedText fr="Merci d'autoriser l'accès." en="Please allow access." inline />,
          });
        }
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          size="lg"
          className="rounded-full h-20 w-20 bg-accent hover:bg-accent/90 child-button shadow-xl border-4 border-white"
        >
          <Mic className="h-10 w-10 text-white" />
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          size="lg"
          className="rounded-full h-20 w-20 bg-destructive hover:bg-destructive/90 child-button animate-pulse shadow-2xl border-4 border-white relative"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
          <Square className="h-10 w-10 text-white relative z-10" />
        </Button>
      )}
      <div className="text-center">
        <div className="font-black text-accent uppercase tracking-widest text-sm">
          {isRecording ? (
            <TranslatedText fr="Parle en anglais..." en="Speak in English..." inline />
          ) : (
            <TranslatedText fr="Appuie pour traduire" en="Press to translate" inline />
          )}
        </div>
      </div>
    </div>
  );
}
