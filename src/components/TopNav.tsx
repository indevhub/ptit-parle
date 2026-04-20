
"use client"

import React, { useState, useEffect } from 'react';
import { Languages, Star, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/TranslationContext';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const UNSECURED_FAMILY_ID = "unsecured-family";

export function TopNav() {
  const { toggleEnglish, showEnglish } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    setProfileId(localStorage.getItem('activeProfileId'));
  }, [pathname]);

  const effectiveUserId = user?.uid || UNSECURED_FAMILY_ID;

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !profileId) return null;
    return doc(firestore, 'users', effectiveUserId, 'learnerProfiles', profileId);
  }, [firestore, effectiveUserId, profileId]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 10) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Hide TopNav on the landing/profile picker page
  if (pathname === '/') return null;

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b z-[60] px-4 md:px-6 transition-all duration-500 ease-in-out transform",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className="max-w-screen-md mx-auto h-full flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-primary rounded-lg p-1.5 transition-transform group-hover:rotate-12">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-primary text-lg md:text-xl tracking-tight">P'tit Parlé</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {profile && (
            <div className="bg-yellow-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-yellow-200 animate-in zoom-in duration-500">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-yellow-700 text-sm">{profile?.totalStarsEarned || 0}</span>
            </div>
          )}

          <Link href="/">
             <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
               <Users className="h-6 w-6" />
             </Button>
          </Link>

          <Button 
            variant={showEnglish ? "default" : "outline"}
            size="sm" 
            onClick={toggleEnglish}
            className="rounded-full gap-2 font-bold transition-all shadow-sm border-2"
          >
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline text-[10px] md:text-xs">
              {showEnglish ? "FR + EN" : "FR ONLY"}
            </span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
