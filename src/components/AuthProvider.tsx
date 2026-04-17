"use client";

import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth, db } from "@/lib/firebase";
import type { AppUser } from "@/lib/types";

type AuthContextValue = {
  firebaseUser: User | null;
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(firebaseUser: User) {
  const ref = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as AppUser;
  }

  const profile: AppUser = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email || "RealPort User",
    email: firebaseUser.email || "",
    createdAt: new Date().toISOString(),
  };

  await setDoc(ref, profile);
  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser);

      if (!nextUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = await loadProfile(nextUser);
      setUser(profile);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      user,
      loading,
      async login(email, password) {
        await signInWithEmailAndPassword(auth, email, password);
      },
      async register(name, email, password) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const profile: AppUser = {
          id: credential.user.uid,
          name,
          email,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, "users", credential.user.uid), profile);
      },
      async logout() {
        await signOut(auth);
      },
    }),
    [firebaseUser, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
