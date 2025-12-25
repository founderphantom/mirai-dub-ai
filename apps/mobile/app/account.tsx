import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User, Mail, CreditCard, LogOut, ChevronLeft } from "lucide-react-native";
import { useSession, signOut } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";


export default function AccountScreen() {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;

    const handleSignOut = async () => {
        try {
            await signOut();
            router.dismissAll(); // Close modal/card
            router.replace("/"); // Go to home (which will update due to session change)
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

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* Header */}
            <View className="px-4 py-4 flex-row items-center border-b border-neutral-100">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2 -ml-2"
                    onPress={() => router.back()}
                >
                    <ChevronLeft size={24} color="#000" />
                </Button>
                <Text className="text-xl font-bold text-neutral-900">Account</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* User Info */}
                <View className="bg-neutral-50 rounded-xl p-4 mb-4 border border-neutral-100">
                    <View className="flex-row items-center mb-4">
                        <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-4">
                            <User size={24} color="#3b82f6" />
                        </View>
                        <View>
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
                                {/*@ts-ignore*/}
                                {user?.plan || "Free"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Credits */}
                <View className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                            <CreditCard size={20} color="#3b82f6" className="mr-2" />
                            <Text className="text-base font-semibold text-neutral-900">Credits Balance</Text>
                        </View>
                    </View>

                    <View className="mt-2">
                        <Text className="text-3xl font-bold text-neutral-900">
                            {/*@ts-ignore*/}
                            {user?.creditsBalance || 0}
                        </Text>
                        <Text className="text-neutral-500 text-sm">minutes remaining</Text>
                    </View>

                    <Button
                        variant="outline"
                        className="mt-4"
                        onPress={() => {
                            // Navigate to pricing or top-up (not implemented yet, maybe just log)
                            alert("Top up feature coming soon!");
                        }}
                    >
                        Add Credits
                    </Button>
                </View>

                {/* Actions */}
                <View className="space-y-3">
                    <Button
                        variant="destructive"
                        onPress={handleSignOut}
                        leftIcon={<LogOut size={18} color="white" />}
                    >
                        Sign Out
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
