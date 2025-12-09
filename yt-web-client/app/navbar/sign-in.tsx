"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  signInWithGoogle,
  signOut,
  onAuthStateChangedHelper,
} from "../firebase/firebase";
import styles from "./sign-in.module.css";

const SignIn = () => {
  // Init user State
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  return (
    <>
      {user ? (
        <button className={styles.sign} onClick={signOut}>
          Sign Out
        </button>
      ) : (
        <button className={styles.sign} onClick={signInWithGoogle}>
          Sign In
        </button>
      )}
    </>
  );
};

export default SignIn;
