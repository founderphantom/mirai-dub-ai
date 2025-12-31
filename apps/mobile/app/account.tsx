import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  User,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Gift,
  ShoppingCart,
  RefreshCw,
} from "lucide-react-native";
import { useSession, signOut } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";
import { useCredits, useTransactionHistory, formatCredits, useResponsive } from "@/hooks";
import { ResponsiveContainer, Footer } from "@/components/layout";
import type { CreditTransaction } from "@/lib/api/credits";


// Helper to get transaction icon
function getTransactionIcon(type: CreditTransaction["type"]) {
  switch (type) {
    case "purchase":
      return <ShoppingCart size={16} color="#22c55e" />;
    case "usage":
      return <Minus size={16} color="#ef4444" />;
    case "bonus":
      return <Gift size={16} color="#8b5cf6" />;
    case "refund":
      return <RefreshCw size={16} color="#3b82f6" />;
    default:
      return <CreditCard size={16} color="#6b7280" />;
  }
}

// Format date for display
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AccountScreen() {
  const router = useRouter();
  const { showDesktopLayout } = useResponsive();
  const { data: session } = useSession();
  const { data: credits, isLoading: isLoadingCredits } = useCredits();
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    fetchNextPage,
    hasNextPage,
  } = useTransactionHistory();
  const user = session?.user;

  // Flatten transaction pages
  const transactions = transactionsData?.pages.flatMap((page) => page.items) || [];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.dismissAll();
      router.replace("/");
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-lg font-medium text-neutral-900 mb-4">Not signed in</Text>
        <Button onPress={() => router.replace("/(auth)/login")}>Sign In</Button>
      </SafeAreaView>
    );
  }

  // User Info Component
  const UserInfoCard = () => (
    <View className="bg-neutral-50 rounded-xl p-4 mb-4 border border-neutral-100">
      <View className="flex-row items-center mb-4">
        <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-4">
          <User size={24} color="#3b82f6" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-neutral-900">
            {user.name || "User"}
          </Text>
          <Text className="text-neutral-500">{user.email}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-neutral-200 pt-4">
        <Text className="text-neutral-500">Plan</Text>
        <View className="bg-primary-100 px-3 py-1 rounded-full">
          <Text className="text-primary-700 font-medium capitalize">
            {(user as { plan?: string })?.plan || "Free"}
          </Text>
        </View>
      </View>
    </View>
  );

  // Credits Balance Component
  const CreditsBalanceCard = () => (
    <Pressable
      className="bg-white rounded-xl border border-neutral-200 p-4 mb-4 shadow-sm active:bg-neutral-50"
      onPress={() => router.push("/credits")}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <CreditCard size={20} color="#3b82f6" />
          <Text className="text-base font-semibold text-neutral-900 ml-2">
            Credits Balance
          </Text>
        </View>
        <ChevronRight size={20} color="#9ca3af" />
      </View>

      {isLoadingCredits ? (
        <ActivityIndicator size="small" color="#3b82f6" />
      ) : (
        <>
          <Text className="text-3xl font-bold text-neutral-900">
            {formatCredits(credits?.balance || 0)}
          </Text>
          <Text className="text-neutral-500 text-sm">
            {credits?.balance || 0} minutes remaining
          </Text>

          {/* Bonus/Trial indicators */}
          {((credits?.trialVideosRemaining ?? 0) > 0 ||
            (credits?.bonusVideosAvailable ?? 0) > 0) && (
            <View className="flex-row flex-wrap gap-2 mt-3">
              {(credits?.trialVideosRemaining ?? 0) > 0 && (
                <View className="bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-medium">
                    {credits?.trialVideosRemaining} free trial
                  </Text>
                </View>
              )}
              {(credits?.bonusVideosAvailable ?? 0) > 0 && (
                <View className="bg-purple-100 px-2 py-1 rounded-full">
                  <Text className="text-purple-700 text-xs font-medium">
                    {credits?.bonusVideosAvailable} bonus videos
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}

      <Pressable
        className="bg-primary-500 rounded-lg py-3 mt-4 flex-row items-center justify-center active:bg-primary-600"
        onPress={() => router.push("/credits")}
      >
        <Plus size={18} color="#fff" />
        <Text className="text-white font-semibold ml-2">Add Credits</Text>
      </Pressable>
    </Pressable>
  );

  // Sign Out Button Component
  const SignOutSection = () => (
    <View className="space-y-3 mb-8">
      <Button
        variant="destructive"
        onPress={handleSignOut}
        leftIcon={<LogOut size={18} color="white" />}
      >
        Sign Out
      </Button>
    </View>
  );

  // Transaction History Component
  const TransactionHistory = ({ limit }: { limit?: number }) => (
    <View className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
      <Text className="text-base font-semibold text-neutral-900 mb-4">
        {limit ? "Recent Transactions" : "Transaction History"}
      </Text>

      {isLoadingTransactions ? (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      ) : transactions.length === 0 ? (
        <View className="py-4 items-center">
          <Text className="text-neutral-400 text-sm">No transactions yet</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {(limit ? transactions.slice(0, limit) : transactions).map((tx) => (
            <View
              key={tx.id}
              className="flex-row items-center justify-between py-2 border-b border-neutral-100 last:border-0"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 h-8 bg-neutral-100 rounded-full items-center justify-center mr-3">
                  {getTransactionIcon(tx.type)}
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-900 font-medium text-sm" numberOfLines={1}>
                    {tx.description || tx.type}
                  </Text>
                  <Text className="text-neutral-400 text-xs">
                    {formatDate(tx.createdAt)}
                  </Text>
                </View>
              </View>
              <Text
                className={`font-semibold ${
                  tx.creditsAmount > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {tx.creditsAmount > 0 ? "+" : ""}
                {tx.creditsAmount}m
              </Text>
            </View>
          ))}

          {hasNextPage && (
            <Pressable
              className="py-2 items-center"
              onPress={() => fetchNextPage()}
            >
              <Text className="text-primary-600 text-sm font-medium">
                Load More
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={showDesktopLayout ? [] : ["top"]}>
      {/* Mobile Header with Back Button */}
      {!showDesktopLayout && (
        <View className="px-4 py-4 flex-row items-center border-b border-neutral-100">
          <Pressable className="mr-2 -ml-2 p-2" onPress={() => router.back()}>
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <Text className="text-xl font-bold text-neutral-900">Account</Text>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Page Header */}
        <ResponsiveContainer className="pt-6 pb-4">
          {showDesktopLayout && (
            <>
              <Pressable
                className="flex-row items-center mb-2"
                onPress={() => router.push("/(tabs)/home")}
              >
                <Text className="text-primary-600 text-sm font-medium">← Home</Text>
              </Pressable>
              <Text className="text-2xl font-bold text-neutral-900">
                Account Settings
              </Text>
              <Text className="text-neutral-500 mt-1">
                Manage your profile, credits, and transaction history
              </Text>
            </>
          )}
        </ResponsiveContainer>

        {showDesktopLayout ? (
          // Desktop: Two-column layout
          <ResponsiveContainer>
            <View className="flex-row gap-8 mt-4">
              {/* Left Column (45%) - User Info, Credits, Sign Out */}
              <View style={{ flex: 0.45 }}>
                <UserInfoCard />
                <CreditsBalanceCard />
                <SignOutSection />
              </View>

              {/* Right Column (55%) - Full Transaction History */}
              <View style={{ flex: 0.55 }}>
                <TransactionHistory />
              </View>
            </View>
          </ResponsiveContainer>
        ) : (
          // Mobile: Single column layout
          <View className="px-4">
            <UserInfoCard />
            <CreditsBalanceCard />
            <TransactionHistory limit={5} />
            <View className="mt-6">
              <SignOutSection />
            </View>
          </View>
        )}

        {showDesktopLayout && <Footer />}
      </ScrollView>
    </SafeAreaView>
  );
}
