"use client"

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pronunciationFeedback, PronunciationFeedbackOutput } from '@/ai/flows/pronunciation-feedback';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  targetPhrase: string;
  onSuccess?: () => void;
}

export function VoiceRecorder({ targetPhrase, onSuccess }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedbackOutput | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await handleProcess(base64Audio);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch (err) {
      toast({
        title: "Erreur de micro",
        description: "Nous n'avons pas pu accéder à votre micro.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleProcess = async (audioDataUri: string) => {
    setIsProcessing(true);
    try {
      const result = await pronunciationFeedback({
        recordedAudioDataUri: audioDataUri,
        targetPhrase: targetPhrase,
      });
      setFeedback(result);
      if (result.isGoodPronunciation) {
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Désolé !",
        description: "Une erreur est survenue lors de l'analyse.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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

      {isRecording && <p className="text-sm font-medium text-destructive animate-bounce">On t'écoute...</p>}

      {feedback && (
        <div className={`flex flex-col items-center text-center p-4 rounded-2xl w-full ${feedback.isGoodPronunciation ? 'bg-green-100' : 'bg-orange-100'}`}>
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
          <p className="text-sm text-foreground/80">{feedback.feedback}</p>
        </div>
      )}
    </div>
  );
}