import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// App-specific auth state (separate from Better Auth session)
type AuthState = {
  hasCompletedOnboarding: boolean;
  isInitialized: boolean;
};

type AuthActions = {
  setOnboardingComplete: () => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
};

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  hasCompletedOnboarding: false,
  isInitialized: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setOnboardingComplete: () => {
        set({ hasCompletedOnboarding: true });
      },

      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);

// Re-export types for convenience
export type { User } from "@/types/user";
