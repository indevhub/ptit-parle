"use client"

import Link from 'next/link';
import { Home, Trophy, Gamepad2, BookOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Accueil' },
    { href: '/learning', icon: BookOpen, label: 'Apprendre' },
    { href: '/games', icon: Gamepad2, label: 'Jeux' },
    { href: '/achievements', icon: Trophy, label: 'Médailles' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t h-20 px-4 md:px-8 z-50">
      <div className="max-w-screen-md mx-auto h-full flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors px-4 py-2 rounded-2xl ${
                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}