import React from "react";
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  type ModalProps as RNModalProps,
} from "react-native";
import { X } from "lucide-react-native";

interface ModalProps extends Omit<RNModalProps, "children"> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

const sizeStyles = {
  sm: "w-[280px]",
  md: "w-[340px]",
  lg: "w-[400px]",
  full: "w-full mx-4",
};

export function Modal({
  visible,
  onClose,
  title,
  showCloseButton = true,
  children,
  size = "md",
  ...props
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      {...props}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <TouchableWithoutFeedback>
            <View
              className={`
                bg-white rounded-2xl overflow-hidden
                max-h-[80%]
                ${sizeStyles[size]}
              `}
            >
              {(title || showCloseButton) && (
                <View className="flex-row items-center justify-between p-4 border-b border-neutral-200">
                  {title ? (
                    <Text className="text-lg font-semibold text-neutral-900">
                      {title}
                    </Text>
                  ) : (
                    <View />
                  )}
                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={onClose}
                      className="p-1 -m-1"
                      accessibilityLabel="Close modal"
                      accessibilityRole="button"
                    >
                      <X size={24} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View className="p-4">{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

export default Modal;
