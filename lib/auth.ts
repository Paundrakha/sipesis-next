"use client";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User, UserRole } from "@/types";

const accountEmails: Record<string, string> = {
  faraday: "adityaarfiansyah.2023@student.uny.ac.id",
  satpam: "adityaarfiansyah22@gmail.com",
};

export async function firebaseLogin(
  username: string,
  password: string,
  selectedRole: UserRole
): Promise<User> {
  const email = accountEmails[username.toLowerCase()];
  if (!email) throw new Error("USERNAME_TIDAK_DITEMUKAN");

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error("DATA_USER_TIDAK_DITEMUKAN");
  }

  const userData = userDoc.data();
  if (userData.username !== username.toLowerCase()) {
    await signOut(auth);
    throw new Error("USERNAME_TIDAK_SESUAI");
  }
  if (userData.role !== selectedRole) {
    await signOut(auth);
    throw new Error("ROLE_TIDAK_SESUAI");
  }

  const result: User = {
    uid: user.uid,
    username: userData.username,
    role: userData.role,
  };

  sessionStorage.setItem("sipkel_user", JSON.stringify(result));
  return result;
}

export async function firebaseLogout(): Promise<void> {
  await signOut(auth);
  sessionStorage.removeItem("sipkel_user");
}
