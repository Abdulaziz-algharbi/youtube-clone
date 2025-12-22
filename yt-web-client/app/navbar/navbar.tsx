"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./navbar.module.css";
import SignIn from "./sign-in";
import { User } from "firebase/auth";
import Upload from "./upload";
import { useState } from "react";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  return (
    <nav className={styles.nav}>
      <Link href="/">
        <Image
          width={90}
          height={20}
          src="/youtube-logo.svg"
          alt="YouTube Logo"
        />
      </Link>
      {user && <Upload />}
      <SignIn currUser={(user) => setUser(user)} />
    </nav>
  );
};

export default Navbar;
