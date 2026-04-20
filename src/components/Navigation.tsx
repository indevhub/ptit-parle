"use client"

import Link from 'next/link';
import { Home, Trophy, Gamepad2, BookOpen, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { TranslatedText } from '@/components/TranslatedText';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Accueil', enLabel: 'Home' },
    { href: '/learning', icon: BookOpen, label: 'Mots', enLabel: 'Words' },
    { href: '/phrases', icon: MessageSquare, label: 'Phrases', enLabel: 'Phrases' },
    { href: '/games', icon: Gamepad2, label: 'Jeux', enLabel: 'Games' },
    { href: '/achievements', icon: Trophy, label: 'Score', enLabel: 'Score' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t h-20 px-2 md:px-8 z-50">
      <div className="max-w-screen-md mx-auto h-full flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all px-2 md:px-4 py-2 rounded-2xl ${
                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Icon className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-center">
                <TranslatedText fr={item.label} en={item.enLabel} inline />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
