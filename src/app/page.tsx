
"use client"

import React, { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateEmailSignIn, initiateEmailSignUp, initiateGoogleSignIn, initiateSignOut } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UserPlus, Sparkles, User, ArrowRight, Mail, LogIn, Chrome, Lock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TranslatedText } from '@/components/TranslatedText';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function RootEntryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  // Profile data is only queried if a user is authenticated
  const profilesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'learnerProfiles');
  }, [firestore, user]);

  const { data: profiles, isLoading: isProfilesLoading } = useCollection(profilesRef);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      initiateEmailSignIn(auth, email, password);
    } else {
      initiateEmailSignUp(auth, email, password);
    }
  };

  const handleGoogleAuth = () => {
    initiateGoogleSignIn(auth);
  };

  const handleSignOut = () => {
    initiateSignOut(auth);
    localStorage.removeItem('activeProfileId');
    toast({ title: "À bientôt !", description: "Déconnexion réussie." });
  };

  const handleSelectProfile = (profileId: string) => {
    localStorage.setItem('activeProfileId', profileId);
    router.push('/dashboard');
  };

  const handleCreateProfile = () => {
    if (!firestore || !user || !newProfileName.trim()) return;

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

    // Ensure the family document exists
    const familyRef = doc(firestore, 'users', user.uid);
    setDocumentNonBlocking(familyRef, {
      uid: user.uid,
      email: user.email,
      createdAt: new Date().toISOString(),
    }, { merge: true });

    setTimeout(() => {
      setIsCreating(false);
      setIsProfileDialogOpen(false);
      setNewProfileName('');
      handleSelectProfile(profileId);
    }, 500);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <div className="text-xl font-bold text-primary animate-pulse uppercase tracking-widest">
           <TranslatedText fr="Chargement Magique..." en="Magic Loading..." inline noAudio />
        </div>
      </div>
    );
  }

  // AUTHENTICATION SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl inline-block mb-4 transform -rotate-3">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-5xl font-black text-primary tracking-tighter">P&apos;tit Parlé</h1>
            <p className="text-lg text-muted-foreground font-bold italic">
              <TranslatedText fr="Ton aventure commence ici !" en="Your adventure starts here!" noAudio />
            </p>
          </div>

          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden p-8 space-y-6">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label className="ml-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="famille@magique.com" 
                  className="h-14 rounded-2xl bg-muted border-none font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="ml-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mot de passe</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-14 rounded-2xl bg-muted border-none font-bold"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-lg font-black shadow-xl child-button">
                {authMode === 'login' ? <LogIn className="mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" />}
                <TranslatedText fr={authMode === 'login' ? "Se connecter" : "Créer un compte"} en={authMode === 'login' ? "Log In" : "Sign Up"} inline noAudio />
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-bold">Ou</span></div>
            </div>

            <Button onClick={handleGoogleAuth} variant="outline" className="w-full h-14 rounded-full border-2 font-black shadow-lg child-button">
              <Chrome className="mr-2 h-5 w-5" />
              <TranslatedText fr="Continuer avec Google" en="Continue with Google" inline noAudio />
            </Button>

            <div className="text-center pt-2">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm font-bold text-primary hover:underline"
              >
                <TranslatedText 
                  fr={authMode === 'login' ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"} 
                  en={authMode === 'login' ? "No account? Sign up" : "Already have an account? Log in"} 
                  noAudio
                />
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // PROFILE PICKER SCREEN
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-12 px-6 space-y-10">
      <div className="w-full max-w-2xl flex justify-between items-center">
        <div className="bg-primary/10 px-4 py-2 rounded-full text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Mail className="h-3 w-3" />
          {user.email}
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive font-bold gap-2">
          <LogOut className="h-4 w-4" />
          <TranslatedText fr="Quitter" en="Logout" inline noAudio />
        </Button>
      </div>

      <div className="text-center space-y-4">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl inline-block mb-4 transform -rotate-3">
          <User className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-5xl font-black text-primary tracking-tighter">Explorateurs</h1>
        <p className="text-xl text-muted-foreground font-bold">
          <TranslatedText fr="Qui va apprendre aujourd'hui ?" en="Who is learning today?" noAudio />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {isProfilesLoading ? (
          <div className="col-span-full flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
                       <TranslatedText fr={`${profile.totalStarsEarned} étoiles`} en={`${profile.totalStarsEarned} stars`} inline noAudio />
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-primary/30 group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            ))}

            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Card className="rounded-[2.5rem] border-4 border-dashed border-primary/20 bg-white/50 overflow-hidden child-button cursor-pointer hover:border-primary/50 transition-colors min-h-[140px]">
                  <CardContent className="h-full p-8 flex items-center justify-center gap-4">
                    <UserPlus className="h-8 w-8 text-primary" />
                    <span className="text-xl font-black text-primary">
                      <TranslatedText fr="Nouveau Profil" en="New Profile" noAudio />
                    </span>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="rounded-[3rem] p-8 border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black text-primary text-center">
                    <TranslatedText fr="Créer un Explorateur" en="Create an Explorer" noAudio />
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">
                      <TranslatedText fr="Nom de l'enfant" en="Child's Name" inline noAudio />
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
                    <TranslatedText fr="Commencer l'Aventure !" en="Start the Adventure!" noAudio />
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
