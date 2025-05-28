import { getReelsByCategory } from "@/api/reels";
import { getReelsCategory } from "@/api/reelsCategory";
import Logout from "@/components/Logout";
import SliderBanner from "@/components/SliderBanner";
import { icons } from "@/constants/icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  SafeAreaView,
  Text, View, ScrollView,
  TouchableOpacity, Image, ActivityIndicator
} from "react-native";
import { VideoView, useVideoPlayer } from 'expo-video';
import { useRouter } from 'expo-router';

interface Category {
  _id: string;
  name: string;
}

interface ReelItem {
  _id: string;
  video: string;
  title: string;
}

const ReelCard = ({ item, router }: { item: ReelItem, router: any }) => {
  const [isLoading, setIsLoading] = useState(true);
  const player = useVideoPlayer(item.video, (p) => {
    p.loop = false;
    p.muted = true;
    p.pause();
    setIsLoading(false);
  });

  return (
    <TouchableOpacity
      key={item._id}
      className="w-[140px] h-[200px] bg-primary/20 rounded-xl overflow-hidden"
      onPress={() => router.push({
        pathname: '/reels-episodes/[reelId]',
        params: { reelId: item._id }
      })}
    >
      <View className="relative w-full h-full">
        {item.video ? (
          <>
            <View className="w-full h-full">
              <VideoView
                player={player}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                contentFit="cover"
              />
              {isLoading && (
                <View className="absolute inset-0 bg-gray-200 items-center justify-center">
                  <ActivityIndicator size="small" color="#0000ff" />
                </View>
              )}
            </View>
          </>
        ) : (
          <View className="w-full h-full bg-primary/20 items-center justify-center">
            <Text className="text-white/80">No Video</Text>
          </View>
        )}

        {/* Bottom gradient overlay */}
        <View className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Title and user info */}
        <View className="absolute bottom-2 left-2 right-2">
          <Text
            className="text-white text-sm font-medium"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title || 'Untitled Reel'}
          </Text>
        </View>

        {/* Play button overlay */}
        <View className="absolute inset-0 items-center justify-center">
          <View className="bg-primary/80 rounded-full p-2">
            <Image
              source={icons.play}
              tintColor="#ffffff"
              className="w-4 h-4"
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  // get category list
  const { data: categoryData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categoryList'],
    queryFn: () => getReelsCategory(),
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // get reels by category
  const { data: reelsData, isLoading: isReelsLoading, refetch } = useQuery({
    queryKey: ['reelsByCategory', selectedCategory],
    queryFn: () => getReelsByCategory(selectedCategory),
    enabled: true, // Ensure the query runs when the component mounts
  });

  // Extract categories from the response data
  const categories = categoryData?.data?.data || [];

  // Extract reels from the response data
  const reels = reelsData || [];

  return (
    <SafeAreaView className="bg-secondary h-full flex-1">
      <ScrollView className="flex-1 h-full" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 mt-3">
          <View className="flex-row items-center justify-between mt-4">
            <View>
              <Text className="text-[#B9CDEE]/80 font-bold text-2xl">My Drama</Text>
              <Text className="text-[13px] text-[#B9CDEE]/70 pt-2">Spark Me Tenderly</Text>
            </View>
            <View>
              <Logout />
            </View>
          </View>
        </View>

        {/* Banner Section With Image Slider */}
        <SliderBanner />

        {/* Reels Category */}
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View className="px-6 mt-10 flex-row items-center gap-[10px] justify-between">
            {/* by default all */}
            <TouchableOpacity
              key="all"
              className={`px-3 py-2 rounded-[15px] ${selectedCategory === "all" ? "bg-primary" : "bg-primary/20"}`}
              onPress={() => handleCategoryChange("all")}
            >
              <Text className="text-[#B9CDEE]/80 text-[16px]">All</Text>
            </TouchableOpacity>

            {categories.map((category: Category) => (
              <TouchableOpacity
                key={category._id}
                className={`px-3 py-2 rounded-[15px] ${selectedCategory === category.name ? "bg-primary" : "bg-primary/20"}`}
                onPress={() => handleCategoryChange(category.name)}
              >
                <Text className="text-[#B9CDEE]/80 text-[16px]">{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Reel List Section */}
        <View>
          <View className="flex-row items-center justify-between px-6 mt-10 mb-5">
            <Text className="text-[#B9CDEE]/80 font-bold text-2xl">Watch Reels</Text>
          </View>

          {/* Reels List */}
          {isReelsLoading ? (
            <View className="flex-1 items-center justify-center py-10">
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <View className="flex-row flex-wrap px-4 gap-4 w-full mb-10">
                {reels.map((item: ReelItem) => (
                  <ReelCard key={item._id} item={item} router={router} />
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}