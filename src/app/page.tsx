"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Globe2, Music } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero')?.imageUrl || 'https://picsum.photos/seed/kids/1200/800';

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <main className="flex-1 relative flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute top-10 left-10 animate-bounce opacity-20">
          <Sparkles className="h-20 w-20 text-accent" />
        </div>
        <div className="absolute bottom-20 right-10 animate-pulse opacity-20">
          <Music className="h-16 w-16 text-primary" />
        </div>

        <div className="z-10 space-y-8 max-w-2xl">
          <div className="inline-block bg-white/80 backdrop-blur-sm p-2 rounded-3xl shadow-sm mb-4">
             <Globe2 className="h-12 w-12 text-primary" />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight">
              P&apos;tit Parlé
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-lg mx-auto">
              L&apos;aventure magique pour apprendre le français en s&apos;amusant !
            </p>
          </div>

          <div className="relative h-64 w-full max-w-md mx-auto rounded-[3rem] overflow-hidden card-shadow transform rotate-3 hover:rotate-0 transition-transform duration-500">
             <Image
                src={heroImage}
                alt="Enfants qui apprennent"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 450px"
                className="object-cover"
                data-ai-hint="kids learning"
             />
          </div>

          <div className="pt-8">
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full px-12 py-8 h-auto text-2xl bg-primary hover:bg-primary/90 shadow-xl child-button">
                Commencer l&apos;Aventure
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground text-sm font-medium">
        © 2024 P&apos;tit Parlé - Créé avec amour pour les petits explorateurs
      </footer>
    </div>
  );
}
