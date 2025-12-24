import React, { createContext, useContext, useState, useCallback } from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react-native";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, { bg: string; icon: React.ReactNode; iconColor: string }> = {
  success: {
    bg: "bg-success-50 border-success-200",
    icon: <CheckCircle size={20} />,
    iconColor: "#10B981",
  },
  error: {
    bg: "bg-error-50 border-error-200",
    icon: <AlertCircle size={20} />,
    iconColor: "#EF4444",
  },
  warning: {
    bg: "bg-warning-50 border-warning-200",
    icon: <AlertTriangle size={20} />,
    iconColor: "#F59E0B",
  },
  info: {
    bg: "bg-info-50 border-info-200",
    icon: <Info size={20} />,
    iconColor: "#3B82F6",
  },
};

function ToastItem({
  toast,
  onHide,
}: {
  toast: Toast;
  onHide: () => void;
}) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const style = toastStyles[toast.type];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onHide());
    }, toast.duration || 4000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={`
        flex-row items-start
        mx-4 mb-2 p-4
        border rounded-xl
        ${style.bg}
      `}
    >
      <View style={{ color: style.iconColor }} className="mr-3 mt-0.5">
        {React.cloneElement(style.icon as React.ReactElement, {
          color: style.iconColor,
        })}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-neutral-900">
          {toast.title}
        </Text>
        {toast.message && (
          <Text className="text-sm text-neutral-600 mt-0.5">
            {toast.message}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={onHide} className="ml-2 p-1 -m-1">
        <X size={18} color="#6B7280" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View className="absolute top-0 left-0 right-0 pt-14 z-50" pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onHide={() => hideToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastProvider;
