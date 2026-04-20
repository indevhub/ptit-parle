
"use client"

import React, { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UserPlus, Sparkles, User, ArrowRight, LogIn, Mail, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TranslatedText } from '@/components/TranslatedText';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { initiateEmailSignIn, initiateEmailSignUp, initiateSignOut } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePickerPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [newProfileName, setNewProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

    // Ensure user document exists in Firestore
    const userRef = doc(firestore, 'users', user.uid);
    setDocumentNonBlocking(userRef, {
      uid: user.uid,
      email: user.email,
      createdAt: new Date().toISOString(),
      isAnonymous: false
    }, { merge: true });

    setTimeout(() => {
      setIsCreating(false);
      setIsProfileDialogOpen(false);
      setNewProfileName('');
      handleSelectProfile(profileId);
    }, 500);
  };

  const handleAuth = () => {
    if (authMode === 'login') {
      initiateEmailSignIn(auth, email, password);
      toast({ title: "Connexion en cours...", description: "Magie en cours..." });
    } else {
      initiateEmailSignUp(auth, email, password);
      toast({ title: "Création du compte...", description: "Presque fini !" });
    }
  };

  const handleSignOut = () => {
    initiateSignOut(auth);
    localStorage.removeItem('activeProfileId');
    toast({ title: "À bientôt !", description: "Déconnexion réussie." });
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

  // If no user is logged in, show the Auth screen
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-10">
        <div className="text-center space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl inline-block mb-4 transform -rotate-3">
            <Sparkles className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tighter">
            P&apos;tit Parlé
          </h1>
          <p className="text-xl text-muted-foreground font-bold max-w-sm">
            <TranslatedText fr="Apprends le français en t'amusant !" en="Learn French while having fun!" noAudio />
          </p>
        </div>

        <Card className="w-full max-w-md rounded-[3rem] border-none shadow-2xl bg-white p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-black text-primary mb-2">
                <TranslatedText 
                  fr={authMode === 'login' ? "Bon Retour !" : "Nouveau Compte"} 
                  en={authMode === 'login' ? "Welcome Back!" : "New Account"} 
                  noAudio
                />
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="ml-2 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Email</Label>
                <Input 
                  type="email" 
                  placeholder="famille@exemple.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="rounded-2xl bg-muted border-none h-14 px-6 text-lg font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="ml-2 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">
                  <TranslatedText fr="Mot de passe" en="Password" inline noAudio />
                </Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="rounded-2xl bg-muted border-none h-14 px-6 text-lg font-bold"
                />
              </div>
            </div>

            <Button onClick={handleAuth} className="w-full h-16 rounded-full bg-primary hover:bg-primary/90 text-xl font-black shadow-xl child-button">
              {authMode === 'login' ? <LogIn className="h-6 w-6 mr-2" /> : <Sparkles className="h-6 w-6 mr-2" />}
              <TranslatedText 
                fr={authMode === 'login' ? "Se connecter" : "S'inscrire"} 
                en={authMode === 'login' ? "Log In" : "Sign Up"} 
                inline
                noAudio
              />
            </Button>

            <div className="text-center">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
              >
                <TranslatedText 
                  fr={authMode === 'login' ? "Pas de compte ? Créer un compte" : "Déjà un compte ? Se connecter"} 
                  en={authMode === 'login' ? "No account? Sign Up" : "Have an account? Log In"} 
                  noAudio
                />
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // If logged in, show the Profile Picker
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-12 px-6 space-y-10">
      <div className="w-full max-w-2xl flex justify-between items-center">
        <div className="bg-primary/10 px-4 py-2 rounded-full text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Mail className="h-3 w-3" />
          {user?.email}
        </div>
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="rounded-full gap-2 text-muted-foreground hover:text-destructive font-bold uppercase text-[10px] tracking-widest"
        >
          <LogOut className="h-4 w-4" />
          <TranslatedText fr="Quitter" en="Sign Out" inline noAudio />
        </Button>
      </div>

      <div className="text-center space-y-4">
        <div className="bg-white p-4 rounded-[2rem] shadow-xl inline-block mb-4">
          <User className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-primary tracking-tight">
          P&apos;tit Parlé
        </h1>
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

      <footer className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-center pt-8">
        <TranslatedText 
          fr="Tes données sont synchronisées dans le cloud" 
          en="Your data is synced to the cloud" 
          noAudio
        />
      </footer>
    </div>
  );
}
