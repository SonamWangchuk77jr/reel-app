'use client';

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { episodesSchema } from '@/schema/episodesSchema';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/context/AuthContext';
import { createEpisode } from '@/api/episodes';
import { useQueryClient } from '@tanstack/react-query';
import type { InferType } from 'yup';

type EpisodeFormData = InferType<typeof episodesSchema>;

export default function EpisodeUpload() {
    const { reelId } = useLocalSearchParams<{ reelId: string }>();
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Use the new video player hook
    const videoPlayer = useVideoPlayer(selectedVideo ? { uri: selectedVideo.uri } : null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue: setFormValue,
    } = useForm<EpisodeFormData>({
        resolver: yupResolver(episodesSchema),
        defaultValues: {
            episodeNumber: 0,
            episodeName: '',
            description: '',
            caption: '',
            video: undefined,
            isFree: false,
        },
    });

    const pickVideo = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Required',
                    text2: 'Please grant camera roll permissions to select videos.',
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsEditing: true,
                quality: 1,
                videoMaxDuration: 60,
                aspect: [9, 16],
            });

            if (!result.canceled) {
                setSelectedVideo(result.assets[0]);
                setFormValue('video', result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking video:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to pick video. Please try again.',
            });
        }
    };

    const onSubmit = async (data: EpisodeFormData) => {
        if (!token) {
            Toast.show({
                type: 'error',
                text1: 'Authentication Error',
                text2: 'Please login to upload episodes',
            });
            return;
        }

        if (!selectedVideo) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please select a video to upload',
            });
            return;
        }

        if (!reelId) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Reel ID is missing',
            });
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('episodeNumber', data.episodeNumber.toString());
            formData.append('episodeName', data.episodeName);
            formData.append('description', data.description);
            formData.append('caption', data.caption);
            formData.append('reelId', reelId);
            formData.append('isFree', data.isFree.toString());

            formData.append('video', {
                uri: selectedVideo.uri,
                type: selectedVideo.mimeType || 'video/mp4',
                name: selectedVideo.fileName || 'video.mp4'
            } as any);

            // Simulate progress for demonstration
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 1000);

            await createEpisode(token, reelId, formData);
            setUploadProgress(100);

            // Invalidate the episodes query to refresh the list
            await queryClient.invalidateQueries({ queryKey: ['episodes', reelId] });

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Episode uploaded successfully!',
            });
            router.back();
        } catch (error: any) {
            console.log('Upload Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Upload Failed',
                text2: error.message || 'Something went wrong. Please try again.',
            });
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Add New Episode',
                    headerStyle: {
                        backgroundColor: '#0C1319',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="ml-2"
                        >
                            <Feather name="chevron-left" size={30} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerTitleStyle: {
                        color: '#fff',
                        fontSize: 16,
                    },
                }}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-secondary"
            >
                {isLoading && (
                    <View style={styles.overlay}>
                        <View style={styles.progressContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
                        </View>
                    </View>
                )}
                <ScrollView className="flex-1 p-4">
                    <View className="mb-6">
                        <TouchableOpacity
                            onPress={pickVideo}
                            className="bg-gray-800 p-4 rounded-lg border border-dashed border-gray-600 items-center justify-center"
                        >
                            {selectedVideo ? (
                                <View style={styles.videoContainer}>
                                    <VideoView
                                        player={videoPlayer}
                                        style={styles.video}
                                        contentFit="cover"
                                        nativeControls
                                    />
                                    <View className="flex-row items-center justify-center my-5">
                                        <Feather name="video" size={24} color="white" />
                                        <Text className="text-white ml-2">Change Video</Text>
                                    </View>
                                </View>
                            ) : (
                                <View className="items-center" style={{ height: 200 }}>
                                    <Feather name="video" size={48} color="white" />
                                    <Text className="text-white mt-2">Select Video</Text>
                                    <Text className="text-gray-400 text-sm mt-1">Max 60 seconds</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {errors.video && (
                            <Text className="text-red-500 text-sm mt-2">{errors.video.message}</Text>
                        )}
                    </View>

                    <Controller
                        name="episodeNumber"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <TextInput
                                    placeholder="Episode Number"
                                    value={value.toString()}
                                    onChangeText={(text) => onChange(parseInt(text) || 0)}
                                    keyboardType="numeric"
                                    className={`border border-gray-300 rounded-lg p-4 mb-2 text-white ${errors.episodeNumber ? 'border-red-500' : ''}`}
                                    placeholderTextColor="#666"
                                />
                                {errors.episodeNumber && (
                                    <Text className="text-red-500 text-sm mb-4">{errors.episodeNumber.message}</Text>
                                )}
                            </>
                        )}
                    />

                    <Controller
                        name="episodeName"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <TextInput
                                    placeholder="Episode Name"
                                    value={value}
                                    onChangeText={onChange}
                                    className={`border border-gray-300 rounded-lg p-4 mb-2 text-white ${errors.episodeName ? 'border-red-500' : ''}`}
                                    placeholderTextColor="#666"
                                />
                                {errors.episodeName && (
                                    <Text className="text-red-500 text-sm mb-4">{errors.episodeName.message}</Text>
                                )}
                            </>
                        )}
                    />

                    <Controller
                        name="description"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <TextInput
                                    placeholder="Description"
                                    value={value}
                                    onChangeText={onChange}
                                    multiline
                                    numberOfLines={4}
                                    className={`border border-gray-300 rounded-lg p-4 mb-2 text-white ${errors.description ? 'border-red-500' : ''}`}
                                    placeholderTextColor="#666"
                                />
                                {errors.description && (
                                    <Text className="text-red-500 text-sm mb-4">{errors.description.message}</Text>
                                )}
                            </>
                        )}
                    />

                    <Controller
                        name="caption"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <TextInput
                                    placeholder="Caption"
                                    value={value}
                                    onChangeText={onChange}
                                    className={`border border-gray-300 rounded-lg p-4 mb-2 text-white ${errors.caption ? 'border-red-500' : ''}`}
                                    placeholderTextColor="#666"
                                />
                                {errors.caption && (
                                    <Text className="text-red-500 text-sm mb-4">{errors.caption.message}</Text>
                                )}
                            </>
                        )}
                    />

                    <Controller
                        name="isFree"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <View className="flex-row items-center mb-4">
                                    <Switch
                                        value={value}
                                        onValueChange={onChange}
                                        className="transform scale-90"
                                    />
                                    <Text className="text-white ml-2">Free Episode</Text>
                                </View>
                                {errors.isFree && (
                                    <Text className="text-red-500 text-sm mb-4">{errors.isFree.message}</Text>
                                )}
                            </>
                        )}
                    />

                    <TouchableOpacity
                        onPress={handleSubmit(onSubmit)}
                        className="bg-primary py-4 rounded-lg mt-4 mb-10"
                        disabled={isLoading}
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {isLoading ? 'Uploading...' : 'Upload Episode'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    videoContainer: {
        width: '100%',
        aspectRatio: 9 / 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    progressContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    progressText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
}); 
