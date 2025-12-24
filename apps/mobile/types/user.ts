export type UserPlan = "free" | "pro" | "enterprise";

export type User = {
  id: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  // Anonymous auth fields
  isAnonymous: boolean;
  // Credit/usage fields
  trialVideosUsed: number;
  bonusVideosAvailable: number;
  creditsBalance: number;
  // Plan info
  plan: UserPlan;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
};

export type Credentials = {
  email: string;
  password: string;
};

export type SignupData = {
  name: string;
  email: string;
  password: string;
};

export type ConvertAccountData = {
  email: string;
  password: string;
  name: string;
};

export type SocialProvider = "google" | "apple";

// Helper to check if user can use trial
export function canUseTrial(user: User): boolean {
  return user.isAnonymous && user.trialVideosUsed < 1;
}

// Helper to check if user has bonus videos
export function hasBonusVideos(user: User): boolean {
  return user.bonusVideosAvailable > 0;
}

// Helper to check if user has credits
export function hasCredits(user: User, minutes: number): boolean {
  return user.creditsBalance >= minutes;
}

// Helper to get display name
export function getDisplayName(user: User): string {
  return user.name || user.email?.split("@")[0] || "Anonymous User";
}
