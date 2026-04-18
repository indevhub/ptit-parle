"use client"

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Gamepad2, Headphones, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function GamesMenuPage() {
  const games = [
    {
      title: "Écoute Magique",
      description: "Écoute le mot et trouve la bonne image.",
      icon: Headphones,
      color: "bg-primary",
      href: "/games/listening",
      level: "Facile"
    },
    {
      title: "Mots Mystères",
      description: "Devine le mot à partir de l'image.",
      icon: Gamepad2,
      color: "bg-accent",
      href: "#",
      level: "Moyen",
      comingSoon: true
    },
    {
      title: "Course aux Étoiles",
      description: "Apprends le plus de mots possible en 1 minute !",
      icon: Trophy,
      color: "bg-yellow-500",
      href: "#",
      level: "Défi",
      comingSoon: true
    }
  ];

  return (
    <div className="pb-24 min-h-screen">
      <header className="p-10 bg-white card-shadow rounded-b-[3rem]">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
             <Gamepad2 className="h-8 w-8" />
             Salle de Jeux
          </h1>
          <p className="text-muted-foreground font-medium">Amuse-toi tout en apprenant le français !</p>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-6 space-y-6">
        {games.map((game, index) => (
          <Link key={index} href={game.comingSoon ? "#" : game.href}>
            <Card className={`rounded-[2rem] border-none card-shadow bg-white mb-4 overflow-hidden child-button cursor-pointer ${game.comingSoon ? 'opacity-70 grayscale' : ''}`}>
              <CardContent className="p-6 flex items-center gap-6">
                <div className={`${game.color} h-20 w-20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 text-white`}>
                   <game.icon className="h-10 w-10" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold text-foreground">{game.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-muted px-2 py-1 rounded-full">{game.level}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                  {game.comingSoon && (
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest mt-2 inline-block">Prochainement</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        <div className="bg-white/50 p-8 rounded-[2rem] text-center border-2 border-dashed border-muted">
           <Sparkles className="h-10 w-10 text-muted mx-auto mb-2" />
           <p className="text-muted-foreground font-medium">De nouveaux jeux arrivent bientôt !</p>
        </div>
      </main>

      <Navigation />
    </div>
  );
}