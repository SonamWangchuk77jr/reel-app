import Logout from "@/components/Logout";
import ReelPlayCard from "@/components/ReelPlayCard";
import SliderBanner from "@/components/SliderBanner";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import React from "react";
import {
  SafeAreaView,
  Text, View, ScrollView,
  TouchableOpacity, Image
} from "react-native";


const reelsCategories = [
  { id: 1, name: "All" },
  { id: 2, name: "Trending" },
  { id: 3, name: "Following" },
  { id: 4, name: "Favorites" },
  { id: 5, name: "Following" },
  { id: 6, name: "Favorites" },
  { id: 7, name: "Favorites" },
];

const mostTrending = [
  { id: 1, name: "Fantasy", image: images.cham2 },
  { id: 2, name: "Thriller", image: images.bhudhaPoint },
  { id: 3, name: "Horror", image: images.paroTakstang },
  { id: 4, name: "Sci Fiction", image: images.gankarPhuensum },
];

const mostTrendingDrama = [
  { id: 1, name: "Drama", image: images.paroTakstang },
  { id: 2, name: "Culture", image: images.bhudhaPoint },
  { id: 3, name: "Horror", image: images.cham2 },
  { id: 4, name: "Sci Fiction", image: images.gankarPhuensum },
];

const trendingHistory = [
  { id: 1, name: "Fantasy", image: images.cham },
  { id: 2, name: "Culture", image: images.bhudhaPoint },
  { id: 3, name: "Horror", image: images.paroTakstang },
  { id: 4, name: "Sci Fiction", image: images.gankarPhuensum },
];


export default function Index() {
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
            {reelsCategories.map((category) => (
              <TouchableOpacity key={category.id} className="bg-primary px-3 py-2 rounded-[15px]">
                <Text className="text-[#B9CDEE]/80 text-[16px]">{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Most Trending Section */}
        <View>
          <View className="flex-row items-center justify-between px-6 mt-10">
            <Text className="text-[#B9CDEE]/80 font-bold text-2xl">Most Trending</Text>
            <Text className="text-[15px] text-[#B9CDEE]/80">View all</Text>
          </View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-[15px] px-6 mt-4 w-full">
              {mostTrending.map((item) => (
                <View key={item.id} className="bg-primary w-[160px] h-[200px] rounded-[15px]">
                  <Image source={item.image} className="w-full h-full rounded-[15px]" />
                  <View className="absolute bottom-0 left-0 right-0  px-3 py-4">
                    <Text className="text-white text-[15px] font-font-[300]">{item.name}</Text>
                  </View>
                  <View className="absolute bottom-10 right-0 px-3 py-4">
                    <TouchableOpacity className="bg-primary rounded-full p-3">
                      <Image source={icons.play} tintColor="#ffff" className="size-4" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Most Trending Drama */}
        <View>
          <View className="flex-row items-center justify-between px-6 mt-10">
            <Text className="text-[#B9CDEE]/80 font-bold text-2xl">Trending Drama</Text>
            <Text className="text-[15px] text-[#B9CDEE]/80">View all</Text>
          </View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-[15px] px-6 mt-4 w-full">
              {mostTrendingDrama.map((item) => (
                <ReelPlayCard key={item.id} title={item.name} image={item.image} />
              ))}
              <ReelPlayCard title="Drama" image={images.cham} />
            </View>
          </ScrollView>
        </View>

        {/* Trending History */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-6 mt-10">
            <Text className="text-[#B9CDEE]/80 font-bold text-2xl">Trending History</Text>
            <Text className="text-[15px] text-[#B9CDEE]/80">View all</Text>
          </View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-[15px] px-6 mt-4 w-full">
              {trendingHistory.map((item) => (
                <ReelPlayCard key={item.id} title={item.name} image={item.image} />
              ))}
            </View>
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

