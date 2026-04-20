"use client"

import React, { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UserPlus, Sparkles, User, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TranslatedText } from '@/components/TranslatedText';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePickerPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [newProfileName, setNewProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const profilesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'learnerProfiles');
  }, [firestore, user]);

  const { data: profiles, isLoading: isProfilesLoading } = useCollection(profilesRef);

  const handleSelectProfile = (profileId: string) => {
    localStorage.setItem('activeProfileId', profileId);
    router.push('/dashboard');
  };

  const handleCreateProfile = () => {
    if (!user || !firestore || !newProfileName.trim()) return;

    setIsCreating(true);
    const profileId = Math.random().toString(36).substring(7);
    const profileRef = doc(firestore, 'users', user.uid, 'learnerProfiles', profileId);

    setDocumentNonBlocking(profileRef, {
      id: profileId,
      name: newProfileName,
      totalStarsEarned: 0,
      currentTheme: 'Default',
      lastActiveAt: new Date().toISOString(),
    }, { merge: true });

    setTimeout(() => {
      setIsCreating(false);
      setIsDialogOpen(false);
      setNewProfileName('');
      handleSelectProfile(profileId);
    }, 500);
  };

  if (isUserLoading || isProfilesLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <div className="text-xl font-bold text-primary animate-pulse uppercase tracking-widest">
           <TranslatedText fr="Chargement Magique..." en="Magic Loading..." inline />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-10">
      <div className="text-center space-y-4">
        <div className="bg-white p-4 rounded-[2rem] shadow-xl inline-block mb-4">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tight">
          P&apos;tit Parlé
        </h1>
        <p className="text-xl text-muted-foreground font-bold">
          <TranslatedText fr="Qui va apprendre aujourd'hui ?" en="Who is learning today?" />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {profiles?.map((profile) => (
          <Card 
            key={profile.id} 
            onClick={() => handleSelectProfile(profile.id)}
            className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden child-button cursor-pointer group"
          >
            <CardContent className="p-8 flex items-center gap-6">
              <div className="bg-primary/10 h-20 w-20 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <User className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-primary leading-none mb-2">
                  {profile.name}
                </h3>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                   <TranslatedText fr={`${profile.totalStarsEarned} étoiles`} en={`${profile.totalStarsEarned} stars`} inline />
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-primary/30 group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Card className="rounded-[2.5rem] border-4 border-dashed border-primary/20 bg-white/50 overflow-hidden child-button cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-8 flex items-center justify-center gap-4">
                <UserPlus className="h-8 w-8 text-primary" />
                <span className="text-xl font-black text-primary">
                  <TranslatedText fr="Nouveau Profil" en="New Profile" />
                </span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="rounded-[3rem] p-8 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-primary text-center">
                <TranslatedText fr="Créer un Explorateur" en="Create an Explorer" />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">
                  <TranslatedText fr="Nom de l'enfant" en="Child's Name" inline />
                </Label>
                <Input
                  id="name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Ex: Léo"
                  className="h-16 rounded-2xl bg-muted border-none text-xl font-bold px-6"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateProfile} 
                disabled={!newProfileName.trim() || isCreating}
                className="w-full h-16 rounded-full bg-primary hover:bg-primary/90 text-xl font-black shadow-xl child-button"
              >
                {isCreating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6 mr-2" />}
                <TranslatedText fr="Commencer l'Aventure !" en="Start the Adventure!" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <footer className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-50">
        <TranslatedText 
          fr="Tes données sont sauvegardées sur cet appareil" 
          en="Your data is saved on this device" 
        />
      </footer>
    </div>
  );
}
