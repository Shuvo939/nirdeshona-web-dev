"use client";

import { createContext, useContext } from "react";

export type LoginOptions = {
  /** Short line under the title, e.g. "Log in to react to this post." */
  reason?: string;
  /** Where the Google redirect fallback should come back to. Defaults to this page. */
  next?: string;
  /** Runs after a successful sign-in instead of the default page reload. */
  onSuccess?: () => void;
};

export type AuthCtx = {
  googleClientId: string | null;
  openLogin: (options?: LoginOptions) => void;
};

export const AuthContext = createContext<AuthCtx>({ googleClientId: null, openLogin: () => {} });

export function useAuthConfig() {
  return useContext(AuthContext);
}

/** Opens the login popup instead of sending the visitor to /login. */
export function useLoginPrompt() {
  return useContext(AuthContext).openLogin;
}
