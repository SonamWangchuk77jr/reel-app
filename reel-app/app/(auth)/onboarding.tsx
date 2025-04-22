import { View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

const onboardingSteps = [
    {
        id: 1,
        title: "Welcome to Reel App",
        description: "Discover and share amazing moments with your friends and family",
        image: require("@/assets/images/home/bhudha-point.jpeg"), // You'll need to add these images

    },
    {
        id: 2,
        title: "Create & Share",
        description: "Create beautiful reels and share your stories with the world",
        image: require("@/assets/images/home/gangkar-phuensum.jpeg"),
    },
    {
        id: 3,
        title: "Connect & Explore",
        description: "Connect with friends and explore trending content",
        image: require("@/assets/images/home/paro-taktshang.jpg"),
    },
];

export default function OnboardingScreen() {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Navigate to the main app
            router.replace("/(tabs)");
        }
    };

    const handleSkip = () => {
        router.replace("/(tabs)");
    };

    return (
        <View className="flex-1 bg-secondary">
            <View className="flex-1 justify-center items-center px-6">
                <Image
                    source={onboardingSteps[currentStep].image}
                    className="w-[300px] h-[300px] mb-8"
                    resizeMode="contain"
                />
                <Text className="text-2xl font-bold text-white text-center mb-4">
                    {onboardingSteps[currentStep].title}
                </Text>
                <Text className="text-white/75 text-center text-base mb-8">
                    {onboardingSteps[currentStep].description}
                </Text>

                <View className="flex-row mb-8">
                    {onboardingSteps.map((_, index) => (
                        <View
                            key={index}
                            className={`w-2 h-2 rounded-full mx-1 ${index === currentStep ? "bg-primary" : "bg-white/30"
                                }`}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    className="bg-primary w-[80%] py-4 rounded-[30px] mb-4"
                    onPress={handleNext}
                >
                    <Text className="text-white text-center text-lg font-bold">
                        {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
                    </Text>
                </TouchableOpacity>

                {currentStep < onboardingSteps.length - 1 && (
                    <TouchableOpacity onPress={handleSkip}>
                        <Text className="text-white/75 text-base">Skip</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
} 