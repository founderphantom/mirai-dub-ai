import { create } from "zustand";

// Credit packages (static, matches backend)
export const CREDIT_PLANS = [
  { id: "starter", name: "Starter", minutes: 30, price: 9, popular: false },
  { id: "creator", name: "Creator", minutes: 120, price: 29, popular: true },
  { id: "pro", name: "Pro", minutes: 300, price: 59, popular: false },
  { id: "enterprise", name: "Enterprise", minutes: 1000, price: 149, popular: false },
] as const;

export type CreditPlan = typeof CREDIT_PLANS[number];

// Local state for checkout flow
type CreditState = {
  isCheckingOut: boolean;
  selectedPackageId: string | null;
};

type CreditActions = {
  setCheckingOut: (checkingOut: boolean) => void;
  setSelectedPackage: (packageId: string | null) => void;
  reset: () => void;
};

type CreditStore = CreditState & CreditActions;

const initialState: CreditState = {
  isCheckingOut: false,
  selectedPackageId: null,
};

export const useCreditStore = create<CreditStore>()((set) => ({
  ...initialState,

  setCheckingOut: (checkingOut: boolean) => {
    set({ isCheckingOut: checkingOut });
  },

  setSelectedPackage: (packageId: string | null) => {
    set({ selectedPackageId: packageId });
  },

  reset: () => {
    set(initialState);
  },
}));
