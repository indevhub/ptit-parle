"use client"

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { ACHIEVEMENTS } from '@/app/data/lessons';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AchievementsPage() {
  // Mock earned status
  const earnedIds = ['first_word'];

  return (
    <div className="pb-24 min-h-screen">
      <header className="p-10 bg-white card-shadow rounded-b-[3rem]">
        <div className="max-w-screen-md mx-auto text-center">
          <div className="bg-yellow-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-12 w-12 text-yellow-600" />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <h1 className="text-3xl font-bold text-primary mb-2 cursor-help">Tes Médailles</h1>
            </TooltipTrigger>
            <TooltipContent>Your Medals</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-muted-foreground font-medium cursor-help">Collectionne-les toutes !</p>
            </TooltipTrigger>
            <TooltipContent>Collect them all!</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const isEarned = earnedIds.includes(achievement.id);
            return (
              <Card key={achievement.id} className={`rounded-[2rem] border-none card-shadow bg-white overflow-hidden ${!isEarned ? 'opacity-60' : ''}`}>
                <CardContent className="p-6 flex items-center gap-6">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl ${isEarned ? 'bg-yellow-100' : 'bg-muted'}`}>
                    {isEarned ? achievement.icon : <Lock className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  {isEarned && (
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <section className="bg-white p-8 rounded-[2rem] card-shadow text-center">
           <Tooltip>
             <TooltipTrigger asChild>
               <h3 className="font-bold text-primary mb-4 cursor-help">Statistiques</h3>
             </TooltipTrigger>
             <TooltipContent>Statistics</TooltipContent>
           </Tooltip>
           <div className="flex justify-around">
             <div>
               <p className="text-3xl font-bold text-primary">1</p>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <p className="text-xs text-muted-foreground uppercase font-bold cursor-help">Médailles</p>
                 </TooltipTrigger>
                 <TooltipContent>Medals</TooltipContent>
               </Tooltip>
             </div>
             <div className="w-px bg-border" />
             <div>
               <p className="text-3xl font-bold text-primary">12</p>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <p className="text-xs text-muted-foreground uppercase font-bold cursor-help">Étoiles</p>
                 </TooltipTrigger>
                 <TooltipContent>Stars</TooltipContent>
               </Tooltip>
             </div>
             <div className="w-px bg-border" />
             <div>
               <p className="text-3xl font-bold text-primary">3</p>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <p className="text-xs text-muted-foreground uppercase font-bold cursor-help">Mots</p>
                 </TooltipTrigger>
                 <TooltipContent>Words</TooltipContent>
               </Tooltip>
             </div>
           </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
