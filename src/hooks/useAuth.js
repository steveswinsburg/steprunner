// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import {
  auth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut
} from '../firebase';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
  const loginWithGitHub = () => signInWithPopup(auth, new GithubAuthProvider());
  const logout = () => signOut(auth);

  return {
    user,
    authChecked,
    loginWithGoogle,
    loginWithGitHub,
    logout
  };
}