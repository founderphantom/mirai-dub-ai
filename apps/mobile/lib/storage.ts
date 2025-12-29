import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Platform-aware storage adapter
 * Uses SecureStore on native, localStorage on web
 */
export const storage = {
  getItem: (key: string): string | null => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return SecureStore.getItem(key);
  },

  setItem: (key: string, value: string): void => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      SecureStore.setItem(key, value);
    }
  },

  deleteItem: (key: string): void => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      SecureStore.deleteItemAsync(key);
    }
  },

  // Sync methods required by better-auth expo client
  getValueWithKeySync: (key: string): string | null => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return SecureStore.getItem(key);
  },

  setValueWithKeySync: (key: string, value: string): void => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      SecureStore.setItem(key, value);
    }
  },

  deleteValueWithKeySync: (key: string): void => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      SecureStore.deleteItemAsync(key);
    }
  },
};
