
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, MicOff, Info, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

type Direction = 'left' | 'right' | 'up' | 'down' | 'idle';

export default function HuntrixPage() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [direction, setDirection] = useState<Direction>('idle');
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [spriteLoaded, setSpriteLoaded] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const moveSpeed = 8;

  const handleCommand = useCallback((command: string) => {
    const cmd = command.toLowerCase();
    setLastCommand(command);

    if (cmd.includes('left') || cmd.includes('gauche')) {
      setDirection('left');
      setPos(prev => ({ ...prev, x: Math.max(5, prev.x - moveSpeed) }));
    } else if (cmd.includes('right') || cmd.includes('droite')) {
      setDirection('right');
      setPos(prev => ({ ...prev, x: Math.min(95, prev.x + moveSpeed) }));
    } else if (cmd.includes('up') || cmd.includes('haut') || cmd.includes('forward') || cmd.includes('devant')) {
      setDirection('up');
      setPos(prev => ({ ...prev, y: Math.max(5, prev.y - moveSpeed) }));
    } else if (cmd.includes('down') || cmd.includes('bas') || cmd.includes('backward') || cmd.includes('derrière')) {
      setDirection('down');
      setPos(prev => ({ ...prev, y: Math.min(95, prev.y + moveSpeed) }));
    }
    
    // Return to idle after animation
    setTimeout(() => setDirection('idle'), 800);
  }, []);

  useEffect(() => {
    // Check if sprite exists
    const img = new Image();
    img.src = '/huntrix-sprite.png';
    img.onload = () => setSpriteLoaded(true);
    img.onerror = () => setSpriteLoaded(false);

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
        if (event.error === 'not-allowed') {
          toast({
            variant: "destructive",
            title: <TranslatedText fr="Micro bloqué" en="Mic blocked" inline />,
            description: <TranslatedText fr="Autorise le micro pour jouer !" en="Allow mic to play!" inline />,
          });
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start(); 
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }
  }, [handleCommand, isListening, toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({ 
        title: <TranslatedText fr="Désolé" en="Sorry" inline />, 
        description: <TranslatedText fr="Ton navigateur ne supporte pas Huntrix." en="Your browser doesn't support Huntrix." inline /> 
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: <TranslatedText fr="Huntrix Activé !" en="Huntrix On!" inline />,
          description: <TranslatedText fr="Dis 'Gauche', 'Droite', 'Haut' ou 'Bas' pour bouger !" en="Say 'Left', 'Right', 'Up' or 'Down' to move!" inline />,
        });
      } catch (e) {
        setIsListening(false);
      }
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
      <header className="p-6 max-w-screen-md mx-auto w-full flex items-center justify-between z-20">
        <Link href="/games" className="p-3 bg-white rounded-2xl card-shadow child-button">
          <ChevronLeft className="h-6 w-6 text-indigo-600" />
        </Link>
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-indigo-100 flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-bold text-indigo-600 text-sm">
            <TranslatedText fr={isListening ? "Micro ouvert" : "Micro fermé"} en={isListening ? "Mic On" : "Mic Off"} inline />
          </span>
        </div>
        <Button onClick={toggleListening} className={`rounded-full h-12 w-12 p-0 shadow-lg ${isListening ? 'bg-destructive' : 'bg-indigo-600'}`}>
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
      </header>

      <main className="flex-1 relative p-6">
        <div className="absolute inset-4 rounded-[4rem] border-8 border-dashed border-indigo-200 bg-white/50 card-shadow flex items-center justify-center">
          {!isListening && (
            <div className="text-center p-10 space-y-6 max-w-sm bg-white rounded-[3rem] card-shadow z-10 border-4 border-indigo-50">
              <div className="bg-indigo-100 h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-600">
                <Sparkles className="h-10 w-10 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-indigo-900">
                  <TranslatedText fr="Prêt pour Huntrix ?" en="Ready for Huntrix?" />
                </h2>
                <p className="text-lg text-muted-foreground font-medium">
                  <TranslatedText fr="Dirige ton personnage avec ta voix !" en="Guide your character with your voice!" />
                </p>
              </div>
              <Button onClick={toggleListening} className="w-full h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-xl font-bold shadow-xl child-button">
                 <TranslatedText fr="Démarrer la Magie" en="Start the Magic" />
              </Button>
            </div>
          )}

          {isListening && (
            <div className="absolute top-8 left-0 right-0 flex flex-col items-center pointer-events-none z-10 gap-4">
              <div className="bg-white/90 px-6 py-2 rounded-full text-sm font-bold text-indigo-600 shadow-md border border-indigo-100 backdrop-blur-sm">
                <TranslatedText fr="Commandes: Gauche, Droite, Haut, Bas" en="Commands: Left, Right, Up, Down" inline />
              </div>
              {lastCommand && (
                <div className="bg-indigo-600 text-white px-10 py-5 rounded-[2.5rem] text-4xl font-black animate-bounce shadow-2xl border-4 border-white flex flex-col items-center">
                  <span className="text-xs uppercase tracking-widest opacity-80 mb-1">
                    <TranslatedText fr="Entendu :" en="Heard:" inline />
                  </span>
                  {lastCommand.toUpperCase()}
                </div>
              )}
            </div>
          )}

          <div 
            className="absolute transition-all duration-300 ease-out z-10"
            style={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Fallback magical glow */}
            <div className="absolute inset-0 bg-indigo-400/30 rounded-full blur-2xl animate-pulse -z-10" />
            
            <div className={`relative w-32 h-32 ${getSpriteClass()}`}>
              {/* Main Sprite Layer */}
              <div 
                className="w-full h-full bg-[url('/huntrix-sprite.png')] bg-no-repeat bg-[length:800%_400%] bg-center"
                style={{ 
                  imageRendering: 'pixelated',
                  backgroundPositionY: direction === 'left' || direction === 'right' ? '0%' : direction === 'up' ? '100%' : '75%'
                }}
              >
                {/* Visual fallback if image fails to load */}
                {!spriteLoaded && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-7xl animate-bounce">
                    🧙‍♂️
                    <span className="text-xs font-bold text-indigo-400 mt-2">MAGIC</span>
                  </div>
                )}
              </div>
              
              {/* Shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/10 rounded-full blur-[3px]" />
            </div>
          </div>
        </div>
      </main>

      <div className="max-w-screen-md mx-auto w-full px-6 py-4">
        <div className="bg-indigo-900 text-white p-6 rounded-[3rem] flex items-center gap-6 shadow-2xl border-2 border-white/20">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Info className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-lg">
              <TranslatedText fr="Astuce Magique" en="Magic Tip" inline />
            </p>
            <p className="opacity-90">
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
