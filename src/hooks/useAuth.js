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
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      setAuthError(error);
    }
  };

  const loginWithGitHub = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, new GithubAuthProvider());
    } catch (error) {
      setAuthError(error);
    }
  };

  const logout = () => signOut(auth);

  return {
    user,
    authChecked,
    authError,
    loginWithGoogle,
    loginWithGitHub,
    logout
  };
}
