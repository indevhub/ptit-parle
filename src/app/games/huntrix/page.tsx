
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, MicOff, Info } from 'lucide-react';
import Link from 'next/link';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/TranslationContext';

type Direction = 'left' | 'right' | 'up' | 'down' | 'idle';

export default function HuntrixPage() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [direction, setDirection] = useState<Direction>('idle');
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { showEnglish } = useTranslation();

  const moveSpeed = 5;

  const handleCommand = useCallback((command: string) => {
    const cmd = command.toLowerCase();
    setLastCommand(command);

    if (cmd.includes('left') || cmd.includes('gauche')) {
      setDirection('left');
      setPos(prev => ({ ...prev, x: Math.max(0, prev.x - moveSpeed) }));
    } else if (cmd.includes('right') || cmd.includes('droite')) {
      setDirection('right');
      setPos(prev => ({ ...prev, x: Math.min(90, prev.x + moveSpeed) }));
    } else if (cmd.includes('up') || cmd.includes('haut') || cmd.includes('forward') || cmd.includes('devant')) {
      setDirection('up');
      setPos(prev => ({ ...prev, y: Math.max(0, prev.y - moveSpeed) }));
    } else if (cmd.includes('down') || cmd.includes('bas') || cmd.includes('backward') || cmd.includes('derrière')) {
      setDirection('down');
      setPos(prev => ({ ...prev, y: Math.min(90, prev.y + moveSpeed) }));
    }
    
    // Reset direction to idle after a short delay
    setTimeout(() => setDirection('idle'), 500);
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR'; 

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        handleCommand(transcript);
      };

      recognition.onerror = (event: any) => {
        // Removed console.error to prevent Next.js error overlays for non-fatal errors like 'no-speech'
        if (event.error === 'not-allowed') {
          toast({
            variant: "destructive",
            title: showEnglish ? "Micro bloqué (Mic blocked)" : "Micro bloqué",
            description: showEnglish ? "Autorise le micro pour jouer à Huntrix ! (Allow mic to play Huntrix!)" : "Autorise le micro pour jouer à Huntrix !",
          });
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start(); 
        }
      };

      recognitionRef.current = recognition;
    }
  }, [handleCommand, isListening, toast, showEnglish]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({ 
        title: showEnglish ? "Désolé (Sorry)" : "Désolé", 
        description: showEnglish ? "Ton navigateur ne supporte pas Huntrix. (Your browser doesn't support Huntrix.)" : "Ton navigateur ne supporte pas Huntrix." 
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: showEnglish ? "Huntrix Activé ! (Huntrix On!)" : "Huntrix Activé !",
        description: showEnglish ? "Dis 'Gauche', 'Droite', 'Haut' ou 'Bas' pour bouger ! (Say 'Left', 'Right', 'Up' or 'Down' to move!)" : "Dis 'Gauche', 'Droite', 'Haut' ou 'Bas' pour bouger !",
      });
    }
  };

  const getSpriteClass = () => {
    switch (direction) {
      case 'left': return 'scale-x-[-1] animate-walk';
      case 'right': return 'animate-walk';
      case 'up': return 'animate-back';
      case 'down': return 'animate-front';
      default: return 'animate-idle';
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-indigo-50/30 overflow-hidden flex flex-col">
      <header className="p-6 max-w-screen-md mx-auto w-full flex items-center justify-between z-10">
        <Link href="/games" className="p-3 bg-white rounded-2xl card-shadow child-button">
          <ChevronLeft className="h-6 w-6 text-indigo-600" />
        </Link>
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-indigo-100 flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-bold text-indigo-600 text-sm">
            {isListening ? (
              <TranslatedText fr="Micro ouvert" en="Mic On" inline />
            ) : (
              <TranslatedText fr="Micro fermé" en="Mic Off" inline />
            )}
          </span>
        </div>
        <Button onClick={toggleListening} className={`rounded-full h-12 w-12 p-0 shadow-lg ${isListening ? 'bg-destructive' : 'bg-indigo-600'}`}>
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
      </header>

      <main className="flex-1 relative p-6">
        <div className="absolute inset-4 rounded-[3rem] border-4 border-dashed border-indigo-200 bg-white/50 card-shadow flex items-center justify-center">
          {!isListening && (
            <div className="text-center p-8 space-y-4 max-w-xs bg-white rounded-[2rem] card-shadow">
              <div className="bg-indigo-100 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                <Mic className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-indigo-900">
                <TranslatedText fr="Prêt pour Huntrix ?" en="Ready for Huntrix?" />
              </h2>
              <p className="text-sm text-muted-foreground">
                <TranslatedText fr="Clique sur le micro et dirige ton personnage avec ta voix !" en="Click the mic and guide your character with your voice!" />
              </p>
              <Button onClick={toggleListening} className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700">
                 <TranslatedText fr="Démarrer" en="Start Game" />
              </Button>
            </div>
          )}

          {isListening && (
            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
              <div className="bg-white/90 px-4 py-2 rounded-2xl text-xs font-bold text-indigo-600 shadow-sm border border-indigo-50">
                <TranslatedText fr="Commandes: Gauche, Droite, Haut, Bas" en="Commands: Left, Right, Up, Down" inline />
              </div>
              {lastCommand && (
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl text-xs font-black animate-bounce shadow-lg">
                  {lastCommand.toUpperCase()}
                </div>
              )}
            </div>
          )}

          <div 
            className="absolute transition-all duration-300 ease-out"
            style={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`relative w-24 h-24 ${getSpriteClass()}`}>
              <div 
                className="w-full h-full bg-[url('https://picsum.photos/seed/huntrix/800/400')] bg-no-repeat bg-[length:800%_400%]"
                style={{ 
                  imageRendering: 'pixelated',
                  backgroundPosition: direction === 'left' || direction === 'right' ? '0% 0%' : direction === 'up' ? '0% 100%' : '0% 75%'
                }}
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/10 rounded-full blur-[2px]" />
            </div>
          </div>
        </div>
      </main>

      <div className="max-w-screen-md mx-auto w-full px-6 py-4">
        <div className="bg-indigo-900 text-white p-4 rounded-[2rem] flex items-center gap-4 shadow-xl">
          <div className="bg-white/20 p-2 rounded-xl">
            <Info className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold opacity-80">
              <TranslatedText fr="Astuce Magique" en="Magic Tip" inline />
            </p>
            <p>
              <TranslatedText 
                fr="Parle clairement pour que ton personnage t'écoute bien !" 
                en="Speak clearly so your character listens well!" 
                inline 
              />
            </p>
          </div>
        </div>
      </div>

      <Navigation />

      <style jsx global>{`
        @keyframes walk {
          from { background-position-x: 0%; }
          to { background-position-x: 100%; }
        }
        .animate-walk {
          animation: walk 0.8s steps(8) infinite;
        }
        @keyframes front {
          from { background-position-x: 0%; }
          to { background-position-x: 50%; }
        }
        .animate-front {
          animation: front 0.6s steps(4) infinite;
        }
        @keyframes back {
          from { background-position-x: 50%; }
          to { background-position-x: 100%; }
        }
        .animate-back {
          animation: back 0.6s steps(4) infinite;
        }
        .animate-idle {
          background-position-x: 0%;
        }
      `}</style>
    </div>
  );
}
