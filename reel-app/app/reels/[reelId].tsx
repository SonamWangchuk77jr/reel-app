import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, StatusBar, Image } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { getReelById, Reel } from '@/api/reels';
import { getEpisodesByReelId, Episode } from '@/api/episodes';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';

// Memoized dimensions
const { width, height } = Dimensions.get('window');
const VIDEO_DIMENSIONS = {
    width: width * 0.65,
    height: height * 0.4
} as const;

// Grid layout constants
const GAP = 8;
const ITEMS_PER_ROW = 3;
const ITEM_SIZE = (width - (GAP * (ITEMS_PER_ROW + 1))) / ITEMS_PER_ROW;

// Utility function for date formatting
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Function to create rows of episodes
const createEpisodeRows = (episodes: Episode[]) => {
    const rows = [];
    for (let i = 0; i < episodes.length; i += ITEMS_PER_ROW) {
        rows.push(episodes.slice(i, i + ITEMS_PER_ROW));
    }
    return rows;
};

// VideoItem component for episode thumbnails
const VideoItem = ({ videoUrl }: { videoUrl: string }) => {
    const player = useVideoPlayer(videoUrl, (p) => {
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
        <View style={{
            width: ITEM_SIZE,
            height: ITEM_SIZE,
            overflow: 'hidden',
            backgroundColor: 'gray'
        }}>
            <VideoView
                player={player}
                style={{
                    width: ITEM_SIZE * 2,
                    height: ITEM_SIZE * 2,
                    position: 'absolute',
                    top: -ITEM_SIZE * 0.5,
                    left: -ITEM_SIZE * 0.5,
                    transform: [{ scale: 1.2 }]
                }}
                pointerEvents="none"
            />
        </View>
    );
};

export default function ReelDetails() {
    const { reelId } = useLocalSearchParams<{ reelId: string }>();

    const { data: reel, isLoading: isReelLoading, error: reelError } = useQuery<Reel>({
        queryKey: ['reel', reelId],
        queryFn: () => getReelById(reelId),
    });

    const { data: episodes, isLoading: isEpisodesLoading } = useQuery<Episode[]>({
        queryKey: ['episodes', reelId],
        queryFn: () => getEpisodesByReelId(reelId),
    });

    // Create video player with the current video URL
    const videoPlayer = useVideoPlayer(reel?.video || '', (p) => {
        p.loop = true;
        p.muted = true;
        // @ts-ignore
        p.style = {
            resizeMode: 'cover',
            width: '100%',
            height: '100%'
        };
    });

    // Create rows of episodes for grid layout
    const episodeRows = useMemo(() => {
        if (!episodes) return [];
        return createEpisodeRows(episodes);
    }, [episodes]);

    if (isReelLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (reelError || !reel) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary">
                <Text className="text-white text-lg">No reels found</Text>
                <TouchableOpacity
                    className="mt-4 bg-primary/20 px-6 py-3 rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-primary">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-secondary">
            <StatusBar barStyle="light-content" />
            <Stack.Screen
                options={{
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
                    title: '',
                    headerTitleStyle: {
                        color: '#fff',
                        fontSize: 16,
                    },
                }}
            />

            <View className="flex flex-row">
                {/* Left Video Section */}
                <View style={{
                    width: VIDEO_DIMENSIONS.width,
                    height: VIDEO_DIMENSIONS.height,
                    backgroundColor: '#0C1319',
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    overflow: 'hidden',
                    shadowColor: "#0C1319",
                    shadowOffset: {
                        width: 2,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    marginTop: 20,
                }}>
                    <View style={{
                        width: VIDEO_DIMENSIONS.width,
                        height: VIDEO_DIMENSIONS.height,
                    }}>
                        <VideoView
                            player={videoPlayer}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </View>
                </View>

                {/* Right Section */}
                <View className="flex-1">
                    <View className="px-6 py-6">
                        {/* Title and Category */}
                        <View className="mb-4">
                            <Text className="text-white text-xl font-bold mb-2">{reel.title}</Text>
                            {reel.category && (
                                <View className="flex-row">
                                    <TouchableOpacity
                                        className="bg-primary/90 px-3 py-1.5 rounded-lg"
                                    >
                                        <Text className="text-white text-xs font-medium">#{reel.category}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {/* Meta Info */}
                        <View className="space-y-4">
                            <View className="bg-primary/5 p-4 rounded-xl">
                                <Text className="text-gray-400 text-xs mb-2">Posted on</Text>
                                <Text className="text-primary font-medium">
                                    {formatDate(reel.createdAt)}
                                </Text>
                            </View>

                            {/* Stats */}
                            <View className="flex-row justify-between bg-primary/5 p-4 rounded-xl mt-4">
                                <View className="items-center">
                                    <Text className="text-primary text-lg font-bold">{reel.likeCount || 0}</Text>
                                    <Text className="text-gray-400 text-xs mt-1">Likes</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-primary text-lg font-bold">{reel.saves?.length || 0}</Text>
                                    <Text className="text-gray-400 text-xs mt-1">Saves</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            {/* Description */}
            <View className="px-6 py-6">
                <Text className="text-gray-400 text-base leading-6 mb-6">{reel.description}</Text>
            </View>
            {/* Episodes Section */}
            <View className="px-6 py-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white text-xl font-bold">Episodes</Text>
                    <View className="flex-row items-center">
                        <Text className="text-primary text-sm mr-2">{episodes?.length || 0} episodes</Text>
                        <View className="w-2 h-2 rounded-full bg-primary/50" />
                    </View>
                </View>
                {isEpisodesLoading ? (
                    <View className="bg-primary/5 p-6 rounded-xl border border-primary/10 items-center justify-center py-8">
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                ) : (
                    <View className="space-y-4">
                        {episodes && episodes.length > 0 ? (
                            episodeRows.map((row, rowIndex) => (
                                <View
                                    key={rowIndex}
                                    className="flex-row flex-wrap"
                                    style={{
                                        gap: GAP,
                                        marginBottom: rowIndex !== episodeRows.length - 1 ? GAP : 0
                                    }}
                                >
                                    {row.map((episode, colIndex) => (
                                        <TouchableOpacity
                                            key={`${rowIndex}-${colIndex}`}
                                            style={{
                                                width: ITEM_SIZE,
                                                height: ITEM_SIZE,
                                            }}
                                            className="overflow-hidden rounded-md bg-white"
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                // Handle episode selection
                                                console.log('Selected episode:', episode._id);
                                            }}
                                        >
                                            <VideoItem videoUrl={episode.videoUrl} />
                                            <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                                                <Text className="text-white text-xs font-medium">Episode {episode.episodeNumber}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))
                        ) : (
                            <View className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                                <View className="items-center justify-center py-8">
                                    <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                                        <Feather name="video" size={24} color="#fff" />
                                    </View>
                                    <Text className="text-white text-lg font-medium mb-2">No Episodes Yet</Text>
                                    <Text className="text-gray-400 text-sm text-center mb-6">
                                        Add episodes to your reel to create a series
                                    </Text>
                                </View>
                            </View>
                        )}
                        <TouchableOpacity
                            className="bg-primary px-6 py-3 rounded-full flex-row items-center justify-center mt-4"
                            onPress={() => router.push(`/episodes/${reel._id}`)}
                        >
                            <Feather name="plus" size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text className="text-white font-medium">Add Episode</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
} 