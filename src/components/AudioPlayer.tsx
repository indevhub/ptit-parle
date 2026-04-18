"use client"

import React, { useState } from 'react';
import { Volume2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  text: string;
}

export function AudioPlayer({ text }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Button
      onClick={playAudio}
      disabled={isPlaying}
      size="lg"
      variant="secondary"
      className="child-button rounded-full h-16 w-16 bg-accent text-white hover:bg-accent/90"
    >
      {isPlaying ? (
        <div className="animate-pulse">
           <Volume2 className="h-8 w-8" />
        </div>
      ) : (
        <Play className="h-8 w-8 ml-1" />
      )}
    </Button>
  );
}