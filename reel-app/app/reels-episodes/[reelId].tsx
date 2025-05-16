import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, StatusBar, FlatList, Alert, Modal, Platform } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Episode, getApprovedEpisodesByReelId, unlockEpisode } from '@/api/episodes';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { BlurView } from 'expo-blur';
import { deductKarmaPoints, getKarmaPoints } from '@/api/karmaPoints';
import Toast from 'react-native-toast-message';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Grid layout constants
const GAP = 8;
const COLUMNS = 3;
const ITEM_WIDTH = (width - (GAP * (COLUMNS + 1))) / COLUMNS;
const ITEM_HEIGHT = ITEM_WIDTH * 1.2;

// Episode card component
const EpisodeCard = ({ episode, onPress, isLocked }: { episode: Episode, onPress: () => void, isLocked: boolean }) => {
    const player = useVideoPlayer(episode.videoUrl, (p) => {
        p.loop = true;
        p.muted = true;
        // @ts-ignore - Native configuration
        p.style = {
            resizeMode: 'cover',
            width: '100%',
            height: '100%'
        };
    });

    return (
        <TouchableOpacity
            style={{
                width: ITEM_WIDTH,
                height: ITEM_HEIGHT,
                marginBottom: GAP,
                borderRadius: 16,
                overflow: 'hidden',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={{ flex: 1, backgroundColor: '#1A2530' }}>
                <VideoView
                    player={player}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }}
                    contentFit="cover"
                    pointerEvents="none"
                />
                <View className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-2">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-white font-medium text-xs" numberOfLines={1}>{episode.episodeName}</Text>
                            <Text className="text-gray-300 text-xs">Ep {episode.episodeNumber}</Text>
                        </View>
                        <View>
                            {isLocked && !episode.isFree ? (
                                <View className="bg-amber-800/50 rounded-full p-3">
                                    <Ionicons name="lock-closed" size={25} color="#FFC107" />
                                </View>
                            ) : (
                                <View className="bg-green-800/50 rounded-full p-3">
                                    <Ionicons name="play-circle" size={25} color="#4CAF50" />
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function ReelEpisodes() {
    const { reelId } = useLocalSearchParams<{ reelId: string }>();
    const { token, user } = useAuth();
    const queryClient = useQueryClient();
    const [unlocking, setUnlocking] = React.useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

    const { data: episodes, isLoading } = useQuery<Episode[]>({
        queryKey: ['episodes', reelId],
        queryFn: () => getApprovedEpisodesByReelId(reelId),
    });

    const isEpisodeLocked = (episode: Episode) => {
        if (episode.isFree) return false;
        if (!user) return true;

        // Check if the current user's ID is in the unlockedBy array
        return !episode.unlockedBy?.includes(user.id);
    };

    const handleEpisodePress = async (episode: Episode) => {
        if (!token) {
            Alert.alert("Login Required", "Please login to watch this episode");
            return;
        }

        if (isEpisodeLocked(episode) && !episode.isFree) {
            setSelectedEpisode(episode);
            setModalVisible(true);
            return;
        }

        // Episode is already unlocked or free, navigate to player
        router.push(`/episode-player/${episode._id}`);
    };

    const handleUnlock = async () => {
        if (!selectedEpisode) return;

        if (!token) {
            Alert.alert("Login Required", "Please login to watch this episode");
            return;
        }

        try {
            setUnlocking(true);
            // TODO: Check karma points
            const karmaPoints = await getKarmaPoints(token);
            if (karmaPoints.points < 100) {
                Alert.alert("Not Enough Karma Points", "You need at least 100 karma points to unlock this episode, Please Kindly watch ads to earn karma points.");
                return;
            }
            await deductKarmaPoints(token, 100);
            await unlockEpisode(token, selectedEpisode._id);
            await queryClient.invalidateQueries({ queryKey: ['episodes', reelId] });
            setModalVisible(false);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Episode unlocked successfully!',
            });
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to unlock episode");
        } finally {
            setUnlocking(false);
        }
    };

    const renderItem = ({ item }: { item: Episode }) => (
        <EpisodeCard
            episode={item}
            onPress={() => handleEpisodePress(item)}
            isLocked={isEpisodeLocked(item)}
        />
    );

    return (
        <View className="flex-1 bg-secondary">
            <StatusBar barStyle="light-content" />
            <Stack.Screen
                options={{
                    title: 'Episodes',
                    headerStyle: {
                        backgroundColor: '#0C1319',
                    },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="ml-2 bg-black/30 p-2 rounded-full"
                        >
                            <Feather name="chevron-left" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                    animation: Platform.OS === 'ios' ? 'fade' : 'fade',
                    presentation: 'card',
                    animationDuration: 200,
                    gestureEnabled: true,
                }}
            />

            {isLoading || unlocking ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            ) : !episodes || episodes.length === 0 ? (
                <View className="flex-1 justify-center items-center p-6">
                    <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                        <Feather name="video" size={24} color="#fff" />
                    </View>
                    <Text className="text-white text-lg font-medium mb-2">No Episodes Found</Text>
                    <Text className="text-gray-400 text-sm text-center mb-6">
                        This reel doesn't have any episodes yet
                    </Text>
                </View>
            ) : (
                <View className="flex-1 p-4">
                    <FlatList
                        data={episodes}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        numColumns={COLUMNS}
                        columnWrapperStyle={{ gap: GAP }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </View>
            )}

            {/* Modern Unlock Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView intensity={20} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View className="bg-[#1A2530] w-[85%] rounded-2xl overflow-hidden">
                        <View className="p-5">
                            <View className="items-center mb-4">
                                <View className="bg-amber-800/50 rounded-full p-4 mb-3">
                                    <Ionicons name="lock-closed" size={30} color="#FFC107" />
                                </View>
                                <Text className="text-white text-xl font-bold">Locked Episode</Text>
                                <Text className="text-gray-300 text-center mt-2">
                                    This episode is locked. You need at least 100 karma points to unlock it.
                                </Text>
                            </View>

                            <View className="flex-row mt-4">
                                <TouchableOpacity
                                    className="flex-1 bg-gray-700 py-3 rounded-xl mr-2"
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text className="text-white text-center font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 bg-amber-600 py-3 rounded-xl ml-2"
                                    onPress={handleUnlock}
                                    disabled={unlocking}
                                >
                                    {unlocking ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text className="text-white text-center font-medium">Unlock</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}
