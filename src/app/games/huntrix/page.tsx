
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, MicOff, Sparkles, Wand2, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

type Direction = 'left' | 'right' | 'up' | 'down' | 'idle';

export default function HuntrixPage() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [direction, setDirection] = useState<Direction>('idle');
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const moveSpeed = 10;

  const playCommandAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCommand = useCallback((command: string) => {
    const cmd = command.toLowerCase();
    setLastCommand(command);

    if (cmd.includes('left') || cmd.includes('gauche')) {
      setDirection('left');
      setPos(prev => ({ ...prev, x: Math.max(10, prev.x - moveSpeed) }));
    } else if (cmd.includes('right') || cmd.includes('droite')) {
      setDirection('right');
      setPos(prev => ({ ...prev, x: Math.min(90, prev.x + moveSpeed) }));
    } else if (cmd.includes('up') || cmd.includes('haut') || cmd.includes('forward') || cmd.includes('devant')) {
      setDirection('up');
      setPos(prev => ({ ...prev, y: Math.max(10, prev.y - moveSpeed) }));
    } else if (cmd.includes('down') || cmd.includes('bas') || cmd.includes('backward') || cmd.includes('derrière')) {
      setDirection('down');
      setPos(prev => ({ ...prev, y: Math.min(90, prev.y + moveSpeed) }));
    }
    
    setTimeout(() => setDirection('idle'), 1200);
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR'; 

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        handleCommand(transcript);
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
  }, [handleCommand, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({ 
        title: <TranslatedText fr="Désolé" en="Sorry" inline />, 
        description: <TranslatedText fr="Ton navigateur ne supporte pas Huntrix." en="Browser doesn't support Huntrix." inline /> 
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
          title: <TranslatedText fr="Huntrix Activé !" en="Huntrix Active!" inline />,
          description: <TranslatedText fr="Dis 'Gauche', 'Droite', 'Haut' ou 'Bas' !" en="Say 'Left', 'Right', 'Up' or 'Down'!" inline />,
        });
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const getAnimationClass = () => {
    switch (direction) {
      case 'left': return 'animate-walk scale-x-[-1]';
      case 'right': return 'animate-walk';
      case 'up': return 'animate-back';
      case 'down': return 'animate-front';
      default: return 'animate-idle';
    }
  };

  const commandButtons = [
    { fr: 'Haut', en: 'Up', cmd: 'haut' },
    { fr: 'Bas', en: 'Down', cmd: 'bas' },
    { fr: 'Gauche', en: 'Left', cmd: 'gauche' },
    { fr: 'Droite', en: 'Right', cmd: 'droite' },
  ];

  return (
    <div className="pb-32 min-h-screen bg-indigo-50/30 overflow-hidden flex flex-col">
      <header className="p-6 max-w-screen-md mx-auto w-full flex items-center justify-between z-20">
        <Link href="/games" className="p-3 bg-white rounded-2xl shadow-xl child-button">
          <ChevronLeft className="h-6 w-6 text-indigo-600" />
        </Link>
        <div className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-full border-2 border-indigo-100 flex items-center gap-3 shadow-lg">
          <div className={`h-4 w-4 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-black text-indigo-900 uppercase tracking-widest text-sm">
            <TranslatedText fr={isListening ? "Micro Activé" : "Micro Coupé"} en={isListening ? "Mic On" : "Mic Off"} inline />
          </span>
        </div>
        <Button onClick={toggleListening} className={`rounded-full h-14 w-14 p-0 shadow-2xl border-4 border-white ${isListening ? 'bg-destructive' : 'bg-indigo-600'}`}>
          {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
        </Button>
      </header>

      <main className="flex-1 relative p-6">
        <div className="absolute inset-4 md:inset-10 rounded-[4rem] border-8 border-dashed border-indigo-200 bg-white/40 shadow-inner flex items-center justify-center overflow-hidden">
          
          {!isListening && (
            <div className="text-center p-12 space-y-8 max-w-md bg-white rounded-[3.5rem] shadow-2xl z-30 border-4 border-indigo-50 transform -rotate-1">
              <div className="bg-indigo-600 h-24 w-24 rounded-[2.5rem] flex items-center justify-center mx-auto text-white shadow-lg">
                <Wand2 className="h-12 w-12 animate-pulse" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-indigo-950 tracking-tight">
                  <TranslatedText fr="Huntrix Magique" en="Magic Huntrix" />
                </h2>
                <p className="text-xl text-muted-foreground font-bold leading-tight">
                  <TranslatedText fr="Dirige ton héros avec ta voix ! C'est magique !" en="Move your hero with your voice! It's magic!" />
                </p>
              </div>
              <Button onClick={toggleListening} className="w-full h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 text-2xl font-black shadow-2xl child-button text-white">
                 <TranslatedText fr="Jouer maintenant !" en="Play Now!" />
              </Button>
            </div>
          )}

          {isListening && lastCommand && (
            <div className="absolute top-12 left-0 right-0 flex flex-col items-center pointer-events-none z-30 animate-in slide-in-from-top-10 duration-500">
               <div className="bg-indigo-600 text-white px-12 py-6 rounded-[3rem] text-4xl md:text-5xl font-black shadow-2xl border-8 border-white flex flex-col items-center">
                  <span className="text-xs uppercase tracking-[0.3em] font-black opacity-80 mb-2">
                    <TranslatedText fr="HUNTRIX A ENTENDU :" en="HUNTRIX HEARD:" inline />
                  </span>
                  {lastCommand.toUpperCase()}
               </div>
            </div>
          )}

          <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-6 grid-rows-6">
             {Array.from({length: 36}).map((_, i) => (
               <div key={i} className="flex items-center justify-center">
                 <Sparkles key={i} className="h-8 w-8 text-indigo-400" />
               </div>
             ))}
          </div>

          <div 
            className="absolute transition-all duration-700 ease-out z-20"
            style={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`absolute inset-0 bg-indigo-400/40 rounded-full blur-[40px] transition-opacity duration-300 ${direction !== 'idle' ? 'opacity-100' : 'opacity-0'}`} />
            
            <div className={`relative w-40 h-40 ${getAnimationClass()}`}>
              <div 
                className="w-full h-full bg-no-repeat bg-[length:800%_400%] bg-center"
                style={{ 
                  backgroundImage: "url('/huntrix-sprite.png')",
                  imageRendering: 'pixelated',
                  backgroundPositionY: direction === 'up' ? '100%' : direction === 'down' ? '75%' : direction === 'idle' ? '75%' : '0%'
                }}
              >
                <div className="w-full h-full flex flex-col items-center justify-center text-8xl transition-all duration-500 hover:scale-110">
                   {/* Fallback Wizard Emoji if sprite fails to load */}
                   <span className="sr-only">Character</span>
                   🧙‍♂️
                </div>
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/20 rounded-full blur-sm" />
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-24 left-0 right-0 z-40 px-6">
        <div className="max-w-screen-md mx-auto bg-white/80 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl border-t-4 border-indigo-100">
          <div className="text-center mb-3">
             <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
               <TranslatedText fr="CLIQUE POUR ENTENDRE LES COMMANDES :" en="CLICK TO HEAR COMMANDS:" inline />
             </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {commandButtons.map((btn) => (
              <Button
                key={btn.fr}
                onClick={() => playCommandAudio(btn.fr)}
                variant="outline"
                className="h-16 rounded-2xl flex flex-col items-center justify-center border-2 border-indigo-50 hover:bg-indigo-600 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-1 mb-1">
                  <Volume2 className="h-3 w-3 group-hover:animate-pulse" />
                  <span className="font-black text-xs uppercase">{btn.fr}</span>
                </div>
                <div className="text-[9px] font-bold opacity-60">
                   <TranslatedText fr="" en={btn.en} inline />
                </div>
              </Button>
            ))}
          </div>
        </div>
      </footer>

      <Navigation />

      <style jsx global>{`
        @keyframes walk-anim {
          from { background-position-x: 0%; }
          to { background-position-x: 100%; }
        }
        .animate-walk {
          animation: walk-anim 0.8s steps(8) infinite;
        }
        @keyframes front-anim {
          from { background-position-x: 0%; }
          to { background-position-x: 50%; }
        }
        .animate-front {
          animation: front-anim 0.6s steps(4) infinite;
        }
        @keyframes back-anim {
          from { background-position-x: 50%; }
          to { background-position-x: 100%; }
        }
        .animate-back {
          animation: back-anim 0.6s steps(4) infinite;
        }
        .animate-idle {
          background-position-x: 0%;
        }
      `}</style>
    </div>
  );
}
