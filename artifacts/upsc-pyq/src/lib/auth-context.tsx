import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  lastLoginAt?: any;
  createdAt?: any;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  registeredUsersCount: number;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  registeredUsersCount: 0,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeredUsersCount, setRegisteredUsersCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
          // Record or update user profile in Firestore safely
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const profileData = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              lastLoginAt: serverTimestamp(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userRef, profileData, { merge: true });
          } catch (err) {
            console.warn('Firestore user doc update note (offline/network):', err);
          }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for registered users count
  useEffect(() => {
    if (!user) {
      setRegisteredUsersCount(0);
      return () => {};
    }
    try {
      const q = query(collection(db, 'users'), orderBy('lastLoginAt', 'desc'), limit(50));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          setRegisteredUsersCount(snapshot.size);
        },
        (err) => {
          console.warn('Firestore user query warning:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('User list query error:', e);
      return () => {};
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOutUser,
        registeredUsersCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export function useRegisteredUsersList() {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUsersList([]);
      setLoadingList(false);
      return () => {};
    }

    const q = query(collection(db, 'users'), orderBy('lastLoginAt', 'desc'), limit(30));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as UserProfile);
        });
        setUsersList(list);
        setLoadingList(false);
      },
      (err) => {
        console.warn('Error fetching users:', err);
        setLoadingList(false);
      }
    );

    return () => unsub();
  }, [user]);

  return { usersList, loadingList };
}
