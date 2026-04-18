"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onFinished(transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('English recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onFinished]);

  const startRecording = () => {
    if (!recognitionRef.current) {
       toast({ title: "Non supporté", description: "Ton navigateur ne supporte pas la dictée vocale." });
       return;
    }
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
    <div className="flex flex-col items-center gap-4">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          size="lg"
          className="rounded-full h-20 w-20 bg-accent hover:bg-accent/90 child-button shadow-lg"
        >
          <Mic className="h-10 w-10 text-white" />
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          size="lg"
          className="rounded-full h-20 w-20 bg-destructive hover:bg-destructive/90 child-button animate-pulse shadow-lg"
        >
          <Square className="h-10 w-10 text-white" />
        </Button>
      )}
      <div className="text-center">
        <div className="font-bold text-accent">
          {isRecording ? (
            <TranslatedText fr="Parle en anglais..." en="Speak in English..." />
          ) : (
            <TranslatedText fr="Appuie pour traduire" en="Press to translate" />
          )}
        </div>
      </div>
    </div>
  );
}
