import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { anonymousClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import { API_CONFIG } from "@/lib/constants";

// Create Better Auth client for Expo
export const authClient = createAuthClient({
  baseURL: API_CONFIG.baseUrl,
  plugins: [
    expoClient({
      scheme: "miraidub",
      storagePrefix: "miraidub",
      storage: SecureStore,
    }),
    anonymousClient(),
  ],
});

// Export commonly used hooks and methods
export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;

// Type exports
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];
