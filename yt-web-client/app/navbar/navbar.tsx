import Image from "next/image";
import Link from "next/link";

import styles from "./navbar.module.css";
import SignIn from "./sign-in";
import { User } from "firebase/auth";

const Navbar = () => {

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
      <SignIn />
    </nav>
  );
};

export default Navbar;
