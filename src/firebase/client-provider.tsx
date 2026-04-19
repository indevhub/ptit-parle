'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  // Ensure every visitor has an anonymous session immediately
  useEffect(() => {
    const auth = firebaseServices.auth;
    const db = firebaseServices.firestore;
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        initiateAnonymousSignIn(auth);
      } else {
        // Ensure the "main-learner" profile exists for the current user globally
        const profileId = 'main-learner';
        const profileRef = doc(db, 'users', user.uid, 'learnerProfiles', profileId);
        
        // We use setDocumentNonBlocking with merge:true to ensure the document exists
        // without accidentally wiping out existing progress if it's already there.
        setDocumentNonBlocking(profileRef, {
          id: profileId,
          name: 'Explorateur',
          // We don't overwrite totalStarsEarned if it exists by using merge: true
          totalStarsEarned: 0,
          currentTheme: 'Default',
          lastActiveAt: new Date().toISOString(),
        }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, [firebaseServices.auth, firebaseServices.firestore]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
