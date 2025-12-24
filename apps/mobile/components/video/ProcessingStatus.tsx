import React from "react";
import { View, Text, Animated } from "react-native";
import {
  Upload,
  AudioLines,
  Languages,
  Mic,
  Smile,
  Film,
  Check,
  Loader2,
  Circle,
} from "lucide-react-native";
import type { ProcessingStep, ProcessingStepStatus } from "@/types/video";
import { Progress } from "@/components/ui/Progress";

interface ProcessingStatusProps {
  steps: ProcessingStep[];
  currentStep: string;
  overallProgress: number;
}

const stepIcons: Record<string, React.ComponentType<any>> = {
  upload: Upload,
  analyze: AudioLines,
  translate: Languages,
  voice: Mic,
  sync: Smile,
  finalize: Film,
};

function StepIcon({
  stepId,
  status,
}: {
  stepId: string;
  status: ProcessingStepStatus;
}) {
  const Icon = stepIcons[stepId] || Circle;

  if (status === "completed") {
    return (
      <View className="w-8 h-8 bg-success-500 rounded-full items-center justify-center">
        <Check size={18} color="#FFFFFF" />
      </View>
    );
  }

  if (status === "in-progress") {
    return (
      <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center">
        <Animated.View
          style={{
            transform: [{ rotate: "0deg" }],
          }}
        >
          <Icon size={18} color="#FFFFFF" />
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="w-8 h-8 bg-neutral-200 rounded-full items-center justify-center">
      <Icon size={18} color="#9CA3AF" />
    </View>
  );
}

export function ProcessingStatus({
  steps,
  currentStep,
  overallProgress,
}: ProcessingStatusProps) {
  return (
    <View className="bg-white rounded-xl p-4">
      {/* Overall Progress */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold text-neutral-900">
            Processing Video
          </Text>
          <Text className="text-2xl font-bold text-primary-600">
            {Math.round(overallProgress)}%
          </Text>
        </View>
        <Progress value={overallProgress} size="lg" showLabel={false} />
      </View>

      {/* Steps */}
      <View>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isActive = step.status === "in-progress";

          return (
            <View key={step.id} className="flex-row">
              {/* Left Column - Icon and Line */}
              <View className="items-center mr-3">
                <StepIcon stepId={step.id} status={step.status} />
                {!isLast && (
                  <View
                    className={`
                      w-0.5 flex-1 my-1
                      ${step.status === "completed" ? "bg-success-500" : "bg-neutral-200"}
                    `}
                  />
                )}
              </View>

              {/* Right Column - Content */}
              <View className={`flex-1 pb-4 ${isLast ? "" : "border-b-0"}`}>
                <Text
                  className={`
                    text-base font-medium
                    ${isActive ? "text-primary-600" : step.status === "completed" ? "text-neutral-900" : "text-neutral-400"}
                  `}
                >
                  {step.title}
                </Text>
                <Text
                  className={`
                    text-sm mt-0.5
                    ${isActive ? "text-primary-500" : "text-neutral-500"}
                  `}
                >
                  {step.description}
                </Text>
                {isActive && (
                  <View className="flex-row items-center mt-2">
                    <Loader2 size={14} color="#2563EB" />
                    <Text className="text-sm text-primary-600 ml-1">
                      In progress...
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default ProcessingStatus;
